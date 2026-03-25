'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  GripHorizontal,
  PlayCircle,
  ShieldAlert,
  TimerReset,
  X
} from 'lucide-react';
import { AppShellLayout } from '../../../../packages/ui-opita/src/shell.js';
import {
  Badge,
  Button,
  Card,
  CardContent,
  StateBlock,
  Textarea
} from '../../../../packages/ui-core/src/primitives.js';
import type { OperateWorkspaceResponse, RunDetailResponse } from '../lib/types.js';
import { approvePreExecution, approveRelease, fetchOperateThreadPage, fetchOperateWorkspace, fetchRun, releaseCheck, startChat, startRun, stopChat, subscribeToChatStream } from '../lib/api.js';
import { queryKeys } from '../lib/query-keys.js';
import { useRunStream } from '../lib/use-stream.js';
import type { GovernedArtifact, OperateThreadEntry, StatusBadge } from '../../../../packages/ui-artifacts/src/index.js';

type SideTabKey = keyof OperateWorkspaceResponse['sidePanel'];

const SIDE_TABS: Array<{ key: SideTabKey; label: string }> = [
  { key: 'contract', label: 'Contract' },
  { key: 'plan', label: 'Plan' },
  { key: 'risk', label: 'Risk' },
  { key: 'run', label: 'Run' },
  { key: 'history', label: 'History' },
  { key: 'inspector', label: 'Inspector' }
];

const MOBILE_INITIAL_THREAD_WINDOW = 20;
const MOBILE_TOP_LOAD_THRESHOLD = 120;
const MOBILE_NEAR_BOTTOM_THRESHOLD = 80;
const MOBILE_FAR_FROM_BOTTOM_THRESHOLD = 120;
const MOBILE_COMPOSER_HIDE_SCROLL = 56;
const MOBILE_COMPOSER_SHOW_SCROLL = 32;
const THREAD_PAGE_SIZE = 20;
const DESKTOP_TOP_LOAD_THRESHOLD = 100;
const THREAD_OVERLAY_HIDE_SCROLL = 32;
const THREAD_OVERLAY_SHOW_SCROLL = 18;
const THREAD_OVERLAY_TOP_INSET = 18;
const THREAD_OVERLAY_PADDING_DESKTOP = 92;
const THREAD_OVERLAY_PADDING_MOBILE = 86;

function normalizeThreadText(text?: string | null): string {
  return (text ?? '').trim().replace(/\s+/g, ' ');
}

function useCompactOperateViewport(breakpoint = 960) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const media = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const apply = () => setCompact(media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [breakpoint]);

  return compact;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  return reduced;
}

function useAnimatedPresence(open: boolean, durationMs: number) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timeout = window.setTimeout(() => setMounted(false), durationMs);
    return () => window.clearTimeout(timeout);
  }, [durationMs, open]);

  return { mounted, visible };
}

function lineClamp(lines: number): CSSProperties {
  return {
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  };
}

const TITLE_STOP_WORDS = new Set([
  'a', 'about', 'algo', 'al', 'an', 'and', 'are', 'as', 'ayuda', 'chat', 'como', 'con', 'crear', 'create',
  'cuál', 'de', 'del', 'después', 'draft', 'el', 'en', 'eres', 'es', 'este', 'esto', 'follow', 'for', 'gpt',
  'haz', 'how', 'hilo', 'i', 'intent', 'la', 'las', 'lo', 'los', 'make', 'mensaje', 'mi', 'más', 'necesito',
  'new', 'no', 'of', 'on', 'or', 'para', 'por', 'prepare', 'que', 'run', 'seguimiento', 'si', 'start', 'tema',
  'the', 'thread', 'to', 'un', 'una', 'want', 'workflow', 'y'
]);

function toConversationTitleSeed(text?: string | null): string | null {
  if (!text) return null;
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return null;

  const firstSentence = normalized.split(/(?<=[.!?])\s+/)[0] ?? normalized;
  const meaningfulWords = firstSentence
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !TITLE_STOP_WORDS.has(word));

  const titleWords = (meaningfulWords.length ? meaningfulWords : firstSentence.split(/\s+/))
    .slice(0, meaningfulWords.length >= 3 ? 3 : 4)
    .map((word) => {
      const lower = word.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    });

  const conciseTitle = titleWords.join(' ').trim().slice(0, 32).trim();
  if (conciseTitle) {
    return conciseTitle;
  }

  const trimmedSentence = firstSentence.trim();
  if (trimmedSentence.length <= 32) {
    return trimmedSentence;
  }
  return `${trimmedSentence.slice(0, 29).trimEnd()}...`;
}

function deriveConversationTitle(params: {
  runObjective?: string;
  submittedComposerValue?: string | null;
  threadMessages: OperateThreadEntry[];
}): string {
  const hasContext = Boolean(params.runObjective) || params.threadMessages.some((entry) => entry.actor !== 'user' && (entry.body?.trim() || entry.artifacts.length));
  if (!hasContext) {
    return 'New chat';
  }
  const firstUserEntry = params.threadMessages.find((entry) => entry.actor === 'user' && entry.body?.trim())?.body;
  return (
    toConversationTitleSeed(firstUserEntry) ||
    toConversationTitleSeed(params.submittedComposerValue) ||
    toConversationTitleSeed(params.runObjective) ||
    'New chat'
  );
}

function formatProviderErrorMessage(errorCode?: string, fallback?: string | null): string {
  switch (errorCode) {
    case 'provider_not_configured':
      return 'OpenAI is not configured for this environment.';
    case 'provider_payload_invalid':
      return 'The provider request was blocked before execution because the payload shape was invalid.';
    case 'provider_request_rejected':
      return 'The provider rejected the request shape. Review the governed chat payload or retry after narrowing context.';
    case 'provider_stream_unavailable':
      return 'The provider stream was unavailable. Retry the governed interpretation.';
    case 'provider_state_resume_miss':
      return 'Provider continuity state expired. The next turn should resume under manual continuity.';
    case 'provider_response_shape_invalid':
      return 'The provider returned a response shape that could not be normalized safely.';
    case 'provider_rate_limited':
      return 'The provider is rate limited. Retry shortly or reduce request frequency.';
    case 'provider_transient_failure':
      return 'The provider request failed temporarily. Retry the governed interpretation.';
    default:
      return fallback || 'The governed chat request failed.';
  }
}

function toneForBadge(tone: StatusBadge['tone']): 'brand' | 'success' | 'warning' | 'danger' | 'muted' {
  return tone === 'neutral' ? 'muted' : tone;
}

function FieldKicker(props: { children: ReactNode }) {
  return <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--muted)', fontWeight: 700 }}>{props.children}</div>;
}

function artifactCardStyle(compact = false): CSSProperties {
  return {
    border: '1px solid var(--line)',
    borderRadius: compact ? 16 : 18,
    background: 'var(--surface)',
    padding: compact ? 12 : 14,
    display: 'grid',
    gap: compact ? 8 : 10
  };
}

function VegaLiteChart(props: { spec: unknown; compact?: boolean }) {
  const spec = props.spec as {
    data?: { values?: Array<Record<string, unknown>> };
    mark?: string | { type?: string };
    encoding?: {
      x?: { field?: string };
      y?: { field?: string; aggregate?: string };
      color?: { field?: string };
    };
  };
  const values = Array.isArray(spec?.data?.values) ? spec.data.values : [];
  const markType = typeof spec?.mark === 'string' ? spec.mark : spec?.mark?.type;
  const xField = spec?.encoding?.x?.field;
  const yField = spec?.encoding?.y?.field;
  const colorField = spec?.encoding?.color?.field;

  if (!values.length || !xField || !yField || (markType !== 'bar' && markType !== 'line')) {
    return (
      <div style={{ color: 'var(--muted)', fontSize: props.compact ? 12 : 13 }}>
        Chart preview unavailable for this governed spec.
      </div>
    );
  }

  const width = 640;
  const height = 280;
  const padding = { top: 20, right: 16, bottom: 36, left: 44 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const palette = ['#0f766e', '#2563eb', '#ea580c', '#7c3aed'];
  const xValues = [...new Set(values.map((item) => String(item[xField] ?? '')))];
  const groups = colorField ? [...new Set(values.map((item) => String(item[colorField] ?? '')))] : ['__single__'];
  const maxY = Math.max(
    1,
    ...values.map((item) => Number(item[yField] ?? 0))
  );

  if (markType === 'bar') {
    const aggregated = xValues.map((xValue) => {
      const total = values
        .filter((item) => String(item[xField] ?? '') === xValue)
        .reduce((sum, item) => sum + Number(item[yField] ?? 0), 0);
      return { xValue, total };
    });

    const barWidth = plotWidth / Math.max(aggregated.length, 1) * 0.56;
    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#cbd5e1" />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#cbd5e1" />
        {aggregated.map((item, index) => {
          const x = padding.left + (plotWidth / Math.max(aggregated.length, 1)) * index + ((plotWidth / Math.max(aggregated.length, 1)) - barWidth) / 2;
          const barHeight = (item.total / maxY) * plotHeight;
          const y = height - padding.bottom - barHeight;
          return (
            <g key={item.xValue}>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx={8} fill={palette[index % palette.length]} />
              <text x={x + barWidth / 2} y={height - 14} textAnchor="middle" fontSize="12" fill="#475569">{item.xValue}</text>
              <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fontSize="11" fill="#0f172a">${Math.round(item.total / 1000)}k</text>
            </g>
          );
        })}
      </svg>
    );
  }

  const groupLines = groups.map((group, groupIndex) => {
    const points = values
      .filter((item) => String(item[colorField ?? ''] ?? '__single__') === group || group === '__single__')
      .map((item) => {
        const xIndex = xValues.indexOf(String(item[xField] ?? ''));
        const x = padding.left + (plotWidth / Math.max(xValues.length - 1, 1)) * xIndex;
        const y = height - padding.bottom - (Number(item[yField] ?? 0) / maxY) * plotHeight;
        return { x, y, label: String(item[xField] ?? ''), value: Number(item[yField] ?? 0) };
      });
    return { group, color: palette[groupIndex % palette.length], points };
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#cbd5e1" />
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#cbd5e1" />
      {xValues.map((label, index) => {
        const x = padding.left + (plotWidth / Math.max(xValues.length - 1, 1)) * index;
        return <text key={label} x={x} y={height - 14} textAnchor="middle" fontSize="12" fill="#475569">{label}</text>;
      })}
      {groupLines.map((line) => (
        <g key={line.group}>
          <path
            d={line.points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')}
            fill="none"
            stroke={line.color}
            strokeWidth={2.5}
          />
          {line.points.map((point) => (
            <g key={`${line.group}-${point.label}`}>
              <circle cx={point.x} cy={point.y} r={4} fill={line.color} />
            </g>
          ))}
        </g>
      ))}
      {groupLines.map((line, index) => (
        <g key={`${line.group}-legend`}>
          <circle cx={padding.left + index * 90} cy={12} r={4} fill={line.color} />
          <text x={padding.left + 10 + index * 90} y={16} fontSize="12" fill="#475569">{line.group === '__single__' ? 'Series' : line.group}</text>
        </g>
      ))}
    </svg>
  );
}

function ArtifactRenderer(props: { artifact: GovernedArtifact; compact?: boolean }) {
  const artifact = props.artifact;
  const compact = props.compact ?? false;

  if (artifact.type === 'rich_text') {
    return (
      <div style={artifactCardStyle(compact)}>
        {artifact.title ? <strong>{artifact.title}</strong> : null}
        <div style={{ color: 'var(--muted)', fontSize: compact ? 13 : 14, lineHeight: 1.6 }}>{artifact.body}</div>
      </div>
    );
  }

  if (artifact.type === 'kv_summary') {
    return (
      <div style={artifactCardStyle(compact)}>
        <strong>{artifact.title}</strong>
        <div style={{ display: 'grid', gap: 8 }}>
          {artifact.items.map((item) => (
            <div key={`${artifact.title}-${item.key}`} style={{ display: 'grid', gridTemplateColumns: compact ? '88px minmax(0,1fr)' : '120px minmax(0,1fr)', gap: compact ? 10 : 12, alignItems: 'start' }}>
              <span style={{ color: 'var(--muted)', fontSize: compact ? 11 : 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.key}</span>
              <span style={{ fontSize: compact ? 13 : 14, fontWeight: item.emphasis ? 650 : 500, minWidth: 0 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (artifact.type === 'status_badges') {
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {artifact.badges.map((badge) => (
          <Badge key={`${badge.label}-${badge.value ?? 'none'}`} tone={toneForBadge(badge.tone)}>
            {badge.label}
            {badge.value ? `: ${badge.value}` : ''}
          </Badge>
        ))}
      </div>
    );
  }

  if (artifact.type === 'contract_diff') {
    return (
      <div style={artifactCardStyle(compact)}>
        <strong>{artifact.title}</strong>
        <div style={{ display: 'grid', gap: 10 }}>
          {artifact.changes.map((change) => (
            <div key={change.field} style={{ borderRadius: 14, border: '1px solid var(--line)', background: 'var(--panel)', padding: 12, display: 'grid', gap: 6 }}>
              <strong style={{ fontSize: 13 }}>{change.field}</strong>
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>{artifact.beforeLabel}: {change.requested}</div>
              <div style={{ fontSize: 13 }}>{artifact.afterLabel}: {change.effective}</div>
              {change.reason ? <div style={{ color: 'var(--muted)', fontSize: 12 }}>{change.reason}</div> : null}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (artifact.type === 'plan_summary') {
    return (
      <div style={artifactCardStyle(compact)}>
        <strong>{artifact.title}</strong>
        <div style={{ fontSize: compact ? 13 : 14, fontWeight: 650 }}>{artifact.selectedCapability}</div>
        <div style={{ color: 'var(--muted)', fontSize: compact ? 12 : 13 }}>{artifact.summary}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Badge tone="muted">{artifact.executionMode}</Badge>
          {artifact.checkpoints.map((item) => (
            <Badge key={item} tone="brand">{item}</Badge>
          ))}
        </div>
      </div>
    );
  }

  if (artifact.type === 'timeline') {
    return (
      <div style={artifactCardStyle(compact)}>
        <strong>{artifact.title}</strong>
        <div style={{ display: 'grid', gap: 10 }}>
          {artifact.events.map((event, index) => (
            <div key={`${event.label}-${index}`} style={{ display: 'grid', gridTemplateColumns: '12px minmax(0,1fr)', gap: 10, alignItems: 'start' }}>
              <div style={{ width: 10, height: 10, borderRadius: 999, background: 'var(--brand)' }} />
              <div style={{ display: 'grid', gap: 2 }}>
                <strong style={{ fontSize: 13 }}>{event.label}</strong>
                {event.state ? <div style={{ color: 'var(--muted)', fontSize: 12 }}>{event.state}</div> : null}
                {event.detail ? <div style={{ color: 'var(--muted)', fontSize: 12 }}>{event.detail}</div> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (artifact.type === 'approval_card') {
    return (
      <div style={{ ...artifactCardStyle(compact), borderColor: 'rgba(240,179,77,0.25)', background: 'rgba(240,179,77,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <strong>{artifact.title}</strong>
          <Badge tone="warning">{artifact.mode}</Badge>
        </div>
        <div style={{ color: 'var(--muted)', fontSize: compact ? 12 : 13, lineHeight: 1.5 }}>{artifact.rationale}</div>
        <div style={{ display: 'grid', gap: 4, color: 'var(--ink)', fontSize: compact ? 12 : 13 }}>
          <div>Allowed effect: {artifact.allowedEffect}</div>
          <div>Risk: {artifact.riskSummary}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {artifact.actions.map((action) => (
            <Badge key={action.id} tone={action.intent === 'approve' ? 'brand' : action.intent === 'reject' ? 'danger' : 'muted'}>
              {action.label}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  if (artifact.type === 'data_table') {
    return (
      <div style={artifactCardStyle(compact)}>
        <strong>{artifact.title}</strong>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: compact ? 12 : 13 }}>
            <thead>
              <tr>
                {artifact.columns.map((column) => (
                  <th key={column} style={{ textAlign: 'left', paddingBottom: 8, color: 'var(--muted)', fontWeight: 600 }}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {artifact.rows.map((row, index) => (
                <tr key={`${artifact.title}-${index}`}>
                  {row.map((cell, cellIndex) => (
                    <td key={`${index}-${cellIndex}`} style={{ padding: '8px 0', borderTop: '1px solid var(--line)' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (artifact.type === 'dataset_summary') {
    return (
      <div style={artifactCardStyle(compact)}>
        <strong>{artifact.title}</strong>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Badge tone="brand">{artifact.datasetRef}</Badge>
            <Badge tone="muted">{artifact.rowCount} rows</Badge>
            <Badge tone="muted">{artifact.columnCount} columns</Badge>
            <Badge tone="warning">{artifact.classification}</Badge>
          </div>
          <div style={{ color: 'var(--muted)', fontSize: compact ? 12 : 13 }}>
            Allowed domains: {artifact.allowedDataDomains.join(', ')}
          </div>
          {artifact.notes.length ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {artifact.notes.map((note) => (
                <Badge key={note} tone="muted">{note}</Badge>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (artifact.type === 'query_summary') {
    return (
      <div style={artifactCardStyle(compact)}>
        <strong>{artifact.title}</strong>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Badge tone="brand">{artifact.analysisMode}</Badge>
          <Badge tone="muted">{artifact.datasetRef}</Badge>
          <Badge tone="muted">{artifact.releaseMode}</Badge>
          {artifact.requestedChartFamily ? <Badge tone="muted">{artifact.requestedChartFamily}</Badge> : null}
        </div>
        <div style={{ color: 'var(--muted)', fontSize: compact ? 12 : 13 }}>
          Transforms: {artifact.transforms.join(' | ')}
        </div>
        {artifact.narrowedFields.length ? (
          <div style={{ color: 'var(--muted)', fontSize: compact ? 12 : 13 }}>
            Narrowed fields: {artifact.narrowedFields.join(', ')}
          </div>
        ) : null}
      </div>
    );
  }

  if (artifact.type === 'chart_spec') {
    return (
      <div style={artifactCardStyle(compact)}>
        <div style={{ display: 'grid', gap: 4 }}>
          <strong>{artifact.title}</strong>
          {artifact.subtitle ? <div style={{ color: 'var(--muted)', fontSize: compact ? 12 : 13 }}>{artifact.subtitle}</div> : null}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Badge tone="brand">{artifact.library}</Badge>
          <Badge tone="muted">{artifact.datasetRef}</Badge>
          <Badge tone="muted">{artifact.releaseMode}</Badge>
        </div>
        <VegaLiteChart spec={artifact.spec} compact={compact} />
      </div>
    );
  }

  if (artifact.type === 'policy_notice') {
    return (
      <div style={{ ...artifactCardStyle(compact), borderColor: artifact.tone === 'danger' ? 'rgba(180,35,24,0.18)' : 'rgba(240,179,77,0.22)' }}>
        <strong>{artifact.title}</strong>
        <div style={{ color: 'var(--muted)', fontSize: compact ? 12 : 13, lineHeight: 1.6 }}>{artifact.message}</div>
        {artifact.nextActions.length ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {artifact.nextActions.map((item) => (
              <Badge key={item} tone="muted">{item}</Badge>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (artifact.type === 'redaction_notice') {
    return (
      <div style={{ ...artifactCardStyle(compact), borderColor: 'rgba(240,179,77,0.22)' }}>
        <strong>{artifact.title}</strong>
        <div style={{ color: 'var(--muted)', fontSize: compact ? 12 : 13 }}>{artifact.message}</div>
        <Badge tone="warning">{artifact.releaseOutcome}</Badge>
      </div>
    );
  }

  if (artifact.type === 'document_ref') {
    return (
      <div style={artifactCardStyle(compact)}>
        <strong>{artifact.title}</strong>
        <div style={{ fontSize: compact ? 12 : 13 }}>{artifact.refLabel}: <code>{artifact.refValue}</code></div>
        {artifact.supportingText ? <div style={{ color: 'var(--muted)', fontSize: 12 }}>{artifact.supportingText}</div> : null}
      </div>
    );
  }

  if (artifact.type === 'cta_bar') {
    return (
      <div style={{ ...artifactCardStyle(compact), display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {artifact.title ? <strong style={{ marginRight: 6 }}>{artifact.title}</strong> : null}
        {artifact.actions.map((action) => (
          <Badge key={action.id} tone={toneForBadge(action.tone)}>{action.label}</Badge>
        ))}
      </div>
    );
  }

  return null;
}

function ThreadEntryView(props: { entry: OperateThreadEntry; compact?: boolean }) {
  const isUser = props.entry.actor === 'user';
  const isOrchestrator = props.entry.actor === 'orchestrator';
  const compact = props.compact ?? false;
  const animateIn = props.entry.entryId.startsWith('live-');
  const [entered, setEntered] = useState(!animateIn);

  useEffect(() => {
    if (!animateIn) {
      setEntered(true);
      return undefined;
    }

    setEntered(false);
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [animateIn, props.entry.entryId]);

  const transitionStyle = animateIn
    ? {
        opacity: entered ? 1 : 0,
        transform: entered ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 180ms ease, transform 180ms ease'
      }
    : undefined;

  const content = (
    <>
      <div style={{ display: 'flex', alignItems: compact ? 'start' : 'center', justifyContent: 'space-between', gap: 12, flexWrap: compact ? 'wrap' : 'nowrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flexWrap: 'wrap' }}>
          <Badge tone={isUser ? 'brand' : isOrchestrator ? 'muted' : 'warning'}>
            {props.entry.actor}
          </Badge>
          {props.entry.title ? <strong style={compact ? { fontSize: 14 } : undefined}>{props.entry.title}</strong> : null}
        </div>
        {props.entry.status ? <Badge tone="muted">{props.entry.status}</Badge> : null}
      </div>
      {props.entry.body ? (
        <div
          style={{
            color: isUser ? 'var(--ink)' : isOrchestrator ? 'var(--ink)' : 'var(--muted)',
            fontSize: compact ? 13 : 14,
            lineHeight: 1.65,
            whiteSpace: 'pre-wrap'
          }}
        >
          {props.entry.body}
        </div>
      ) : null}
      {props.entry.artifacts.length ? (
        <div style={{ display: 'grid', gap: 10 }}>
          {props.entry.artifacts.map((artifact, index) => (
            <ArtifactRenderer key={`${props.entry.entryId}-${artifact.type}-${index}`} artifact={artifact} compact={compact} />
          ))}
        </div>
      ) : null}
    </>
  );

  if (isOrchestrator) {
    return (
      <div
        style={{
          display: 'grid',
          gap: compact ? 10 : 12,
          padding: compact ? '4px 2px' : '6px 4px',
          ...transitionStyle
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: compact ? 13 : 16,
        borderRadius: compact ? 18 : 22,
        border: `1px solid ${isUser ? 'rgba(15,118,110,0.16)' : 'var(--line)'}`,
        background: isUser ? 'rgba(15,118,110,0.05)' : 'var(--panel)',
        display: 'grid',
        gap: compact ? 10 : 12,
        ...transitionStyle
      }}
    >
      {content}
    </div>
  );
}

function SidePanel(props: {
  workspace: OperateWorkspaceResponse;
  activeTab: SideTabKey;
  onChangeTab: (tab: SideTabKey) => void;
  run?: RunDetailResponse;
  onApprovePreExecution: () => void;
  onApproveRelease: () => void;
  onReleaseCheck: () => void;
  compact?: boolean;
}) {
  const entries = props.workspace.sidePanel[props.activeTab];
  const compact = props.compact ?? false;

  return (
    <div style={{ display: 'grid', gap: compact ? 12 : 14 }}>
      <Card>
        <CardContent>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SIDE_TABS.map((tab) => (
              <Button key={tab.key} variant={tab.key === props.activeTab ? 'primary' : 'secondary'} size="sm" onClick={() => props.onChangeTab(tab.key)}>
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {props.run ? (
        <Card>
          <CardContent>
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <strong>Governed controls</strong>
                <Badge tone="muted">{props.run.runState}</Badge>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button variant="secondary" size="sm" onClick={props.onReleaseCheck}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <ShieldAlert size={14} />
                    Release check
                  </span>
                </Button>
                <Button variant="secondary" size="sm" onClick={props.onApprovePreExecution}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <TimerReset size={14} />
                    Approve pre-exec
                  </span>
                </Button>
                <Button variant="secondary" size="sm" onClick={props.onApproveRelease}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={14} />
                    Approve release
                  </span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div style={{ display: 'grid', gap: 12 }}>
        {entries.map((entry) => (
          <ThreadEntryView key={entry.entryId} entry={entry} compact={compact} />
        ))}
      </div>
    </div>
  );
}

function MobileOperateStatus(props: { workspace: OperateWorkspaceResponse }) {
  return (
    <Card style={{ borderRadius: 18 }}>
      <CardContent>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'grid', gap: 4, minWidth: 0 }}>
              <FieldKicker>Workspace</FieldKicker>
              <strong style={{ fontSize: 15 }}>
                {props.workspace.header.tenantLabel} {' | '} {props.workspace.header.environment}
              </strong>
            </div>
            <Badge tone="muted">{props.workspace.header.runStatus}</Badge>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {props.workspace.header.badges.map((badge) => (
              <Badge key={`${badge.label}-${badge.value ?? 'none'}`} tone={toneForBadge(badge.tone)}>
                {badge.label}
                {badge.value ? `: ${badge.value}` : ''}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MobileDetailLauncher(props: {
  activeTab: SideTabKey;
  onOpen: (tab: SideTabKey) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 2,
        scrollbarWidth: 'none'
      }}
    >
      {SIDE_TABS.map((tab) => (
        <Button key={tab.key} variant={props.activeTab === tab.key ? 'primary' : 'secondary'} size="sm" onClick={() => props.onOpen(tab.key)}>
          {tab.label}
        </Button>
      ))}
    </div>
  );
}

function MobileDetailSheet(props: {
  open: boolean;
  title: string;
  onClose: () => void;
  visible: boolean;
  motionMs: number;
  children: ReactNode;
}) {
  if (!props.open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: props.visible ? 'rgba(8,15,29,0.28)' : 'rgba(8,15,29,0)',
        transition: `background ${props.motionMs}ms ease`
      }}
    >
      <button
        type="button"
        aria-label="Close governed details"
        onClick={props.onClose}
        style={{ position: 'absolute', inset: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 'auto 0 0 0',
          background: 'var(--surface)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTop: '1px solid var(--line)',
          maxHeight: '78dvh',
          padding: '10px 12px calc(14px + env(safe-area-inset-bottom, 0px))',
          display: 'grid',
          gap: 12,
          overflow: 'auto',
          transform: props.visible ? 'translateY(0)' : 'translateY(18px)',
          opacity: props.visible ? 1 : 0.01,
          transition: `transform ${props.motionMs}ms ease, opacity ${props.motionMs}ms ease`
        }}
      >
        <div style={{ display: 'grid', justifyItems: 'center', gap: 10 }}>
          <GripHorizontal size={24} color="var(--muted)" />
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'grid', gap: 2 }}>
              <FieldKicker>Governed detail</FieldKicker>
              <strong>{props.title}</strong>
            </div>
            <button
              type="button"
              onClick={props.onClose}
              aria-label="Close"
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                border: '1px solid var(--line)',
                background: 'var(--panel)',
                color: 'var(--ink)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
        {props.children}
      </div>
    </div>
  );
}

export function OperatePage(props: { auth?: { tenantName: string; userLabel: string } } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const runId = searchParams.get('runId');
  const compactViewport = useCompactOperateViewport();
  const reducedMotion = useReducedMotion();
  const detailMotionMs = reducedMotion ? 1 : 150;
  const composerMotionMs = reducedMotion ? 1 : 140;
  const [activeTab, setActiveTab] = useState<SideTabKey>('contract');
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [composerValue, setComposerValue] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [liveChatStatus, setLiveChatStatus] = useState<'idle' | 'queued' | 'streaming' | 'completed' | 'failed' | 'cancelled'>('idle');
  const [liveAssistantMessage, setLiveAssistantMessage] = useState('');
  const [liveChatError, setLiveChatError] = useState<string | null>(null);
  const [submittedComposerValue, setSubmittedComposerValue] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<OperateThreadEntry[]>([]);
  const [threadCursor, setThreadCursor] = useState<string | null>(null);
  const [threadHasMore, setThreadHasMore] = useState(false);
  const [threadLoadingMore, setThreadLoadingMore] = useState(false);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const [threadPinnedToBottom, setThreadPinnedToBottom] = useState(true);
  const [composerCollapsed, setComposerCollapsed] = useState(false);
  const [threadOverlayVisible, setThreadOverlayVisible] = useState(true);
  const [unseenCount, setUnseenCount] = useState(0);
  const prependSnapshotRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null);
  const initialThreadPositionedRef = useRef(false);
  const lastThreadLengthRef = useRef(0);
  const lastScrollTopRef = useRef(0);
  const upwardScrollAccumulatorRef = useRef(0);
  const downwardScrollAccumulatorRef = useRef(0);
  const overlayHideAccumulatorRef = useRef(0);
  const overlayShowAccumulatorRef = useRef(0);
  const isNearBottomRef = useRef(true);
  const pendingScrollToBottomFramesRef = useRef(0);
  const detailSheetPresence = useAnimatedPresence(mobileDetailsOpen, detailMotionMs);
  const composerMaxHeight = compactViewport ? 160 : 220;

  const workspaceQuery = useQuery({
    queryKey: [...queryKeys.operateWorkspace, runId ?? '__none__'],
    queryFn: () => fetchOperateWorkspace(runId)
  });
  const threadScopeKey = `${runId ?? '__none__'}:${chatId ?? '__none__'}`;
  const threadPageQuery = useQuery({
    queryKey: queryKeys.operateThread(threadScopeKey),
    queryFn: () => fetchOperateThreadPage({ runId, limit: THREAD_PAGE_SIZE })
  });

  const runQuery = useQuery({
    queryKey: queryKeys.run(runId ?? '__none__'),
    queryFn: () => fetchRun(runId ?? ''),
    enabled: Boolean(runId)
  });

  useRunStream(runId);

  const startRunMutation = useMutation({
    onMutate: (rawIntent: string) => {
      setSubmittedComposerValue(rawIntent);
    },
    mutationFn: (rawIntent: string) =>
      startRun({
        rawIntent,
        approvalMode: 'pre-application',
        classificationLevel: 'confidential'
      }),
    onSuccess: async (result) => {
      setStatusNote(`Run ${result.runId} created.`);
      setComposerCollapsed(false);
      setUnseenCount(0);
      await queryClient.invalidateQueries({ queryKey: queryKeys.viewModel });
      await queryClient.invalidateQueries({ queryKey: queryKeys.operateWorkspace });
      await queryClient.invalidateQueries({ queryKey: queryKeys.operateThread(threadScopeKey) });
      router.replace(`/operate?runId=${encodeURIComponent(result.runId)}`);
    }
  });

  const startChatMutation = useMutation({
    onMutate: (message: string) => {
      setSubmittedComposerValue(message);
      setLiveChatStatus('queued');
      setLiveAssistantMessage('');
      setLiveChatError(null);
    },
    mutationFn: (message: string) => startChat({ message, chatId: chatId ?? undefined }),
    onSuccess: (result) => {
      setChatId(result.chatId);
      setLiveChatStatus(result.status);
      setLiveAssistantMessage(result.latestAssistantMessage);
      setLiveChatError(result.lastError ? formatProviderErrorMessage(result.lastErrorCode, result.lastError) : null);
      setStatusNote(`Orchestrator session ${result.chatId} started.`);
      setComposerCollapsed(false);
    },
    onError: (error) => {
      setLiveChatStatus('failed');
      setLiveChatError(error instanceof Error ? error.message : 'chat_failed');
    }
  });

  const stopChatMutation = useMutation({
    mutationFn: (activeChatId: string) => stopChat(activeChatId),
    onSuccess: async (result) => {
      setLiveChatStatus(result.status);
      setLiveAssistantMessage(result.latestAssistantMessage);
      setLiveChatError(null);
      setStatusNote('Streaming response stopped.');
      await queryClient.invalidateQueries({ queryKey: queryKeys.operateWorkspace });
      await queryClient.invalidateQueries({ queryKey: queryKeys.operateThread(threadScopeKey) });
    }
  });

  const releaseCheckMutation = useMutation({
    mutationFn: () => releaseCheck(runId!),
    onSuccess: async () => {
      setStatusNote('Release check executed.');
      await queryClient.invalidateQueries({ queryKey: queryKeys.run(runId ?? '__none__') });
      await queryClient.invalidateQueries({ queryKey: queryKeys.operateWorkspace });
      await queryClient.invalidateQueries({ queryKey: queryKeys.operateThread(threadScopeKey) });
    }
  });

  const approvePreExecutionMutation = useMutation({
    mutationFn: () => approvePreExecution(runId!),
    onSuccess: async () => {
      setStatusNote('Pre-execution approval granted.');
      await queryClient.invalidateQueries({ queryKey: queryKeys.run(runId ?? '__none__') });
      await queryClient.invalidateQueries({ queryKey: queryKeys.operateWorkspace });
      await queryClient.invalidateQueries({ queryKey: queryKeys.operateThread(threadScopeKey) });
    }
  });

  const approveReleaseMutation = useMutation({
    mutationFn: () => approveRelease(runId!),
    onSuccess: async () => {
      setStatusNote('Release approved.');
      await queryClient.invalidateQueries({ queryKey: queryKeys.run(runId ?? '__none__') });
      await queryClient.invalidateQueries({ queryKey: queryKeys.operateWorkspace });
      await queryClient.invalidateQueries({ queryKey: queryKeys.operateThread(threadScopeKey) });
    }
  });

  useEffect(() => {
    if (!chatId) return undefined;
    return subscribeToChatStream(chatId, {
      onStarted: (payload) => {
        const status = typeof payload.status === 'string' ? payload.status : 'streaming';
        setLiveChatStatus(status === 'queued' ? 'queued' : 'streaming');
      },
      onDelta: (payload) => {
        setLiveChatStatus('streaming');
        if (typeof payload.fullText === 'string') {
          setLiveAssistantMessage(payload.fullText);
          return;
        }
        if (typeof payload.delta === 'string') {
          setLiveAssistantMessage((current) => current + payload.delta);
        }
      },
      onCompleted: async (payload) => {
        setLiveChatStatus('completed');
        setLiveAssistantMessage(typeof payload.latestAssistantMessage === 'string' ? payload.latestAssistantMessage : '');
        await queryClient.invalidateQueries({ queryKey: queryKeys.operateWorkspace });
        await queryClient.invalidateQueries({ queryKey: queryKeys.operateThread(threadScopeKey) });
      },
      onCancelled: async (payload) => {
        setLiveChatStatus('cancelled');
        setLiveAssistantMessage(typeof payload.latestAssistantMessage === 'string' ? payload.latestAssistantMessage : '');
        setLiveChatError(null);
        await queryClient.invalidateQueries({ queryKey: queryKeys.operateWorkspace });
        await queryClient.invalidateQueries({ queryKey: queryKeys.operateThread(threadScopeKey) });
      },
      onError: (payload) => {
        setLiveChatStatus('failed');
        const fallback = typeof payload.error === 'string' ? payload.error : 'chat_failed';
        const errorCode = typeof payload.lastErrorCode === 'string' ? payload.lastErrorCode : undefined;
        setLiveChatError(formatProviderErrorMessage(errorCode, fallback));
      }
    });
  }, [chatId, queryClient, threadScopeKey]);

  useEffect(() => {
    if (!statusNote) return undefined;
    const timeout = window.setTimeout(() => setStatusNote(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [statusNote]);

  useEffect(() => {
    const node = composerRef.current;
    if (!node || composerCollapsed) return;

    const frame = requestAnimationFrame(() => {
      const textarea = composerRef.current;
      if (!textarea) return;
      textarea.style.height = '0px';
      const nextHeight = Math.min(textarea.scrollHeight, composerMaxHeight);
      textarea.style.height = `${nextHeight}px`;
      textarea.style.overflowY = textarea.scrollHeight > composerMaxHeight ? 'auto' : 'hidden';
    });

    return () => cancelAnimationFrame(frame);
  }, [composerCollapsed, composerMaxHeight, composerValue]);

  useEffect(() => {
    if (!compactViewport) {
      setMobileDetailsOpen(false);
      setComposerCollapsed(false);
      setUnseenCount(0);
      upwardScrollAccumulatorRef.current = 0;
      downwardScrollAccumulatorRef.current = 0;
      overlayHideAccumulatorRef.current = 0;
      overlayShowAccumulatorRef.current = 0;
      isNearBottomRef.current = true;
      setThreadOverlayVisible(true);
    }
  }, [compactViewport]);

  const workspace = workspaceQuery.data;
  const run = runQuery.data;
  const activeTabLabel = SIDE_TABS.find((tab) => tab.key === activeTab)?.label ?? 'Contract';
  const trimmedComposerValue = composerValue.trim();
  const composerPlaceholder = workspace?.composer.placeholder?.trim() || 'Describe the governed outcome you want.';
  const chatBusy = startChatMutation.isPending || stopChatMutation.isPending || liveChatStatus === 'queued' || liveChatStatus === 'streaming';
  const canSendChat = Boolean(trimmedComposerValue) && !chatBusy && !startRunMutation.isPending;
  const canCompileRun = Boolean(trimmedComposerValue) && !startRunMutation.isPending;
  const canStopChat = Boolean(chatId) && (liveChatStatus === 'queued' || liveChatStatus === 'streaming');

  const handleSendChat = () => {
    if (!canSendChat) return;
    const nextMessage = trimmedComposerValue;
    setThreadPinnedToBottom(true);
    isNearBottomRef.current = true;
    setUnseenCount(0);
    setComposerCollapsed(false);
    setThreadOverlayVisible(true);
    pendingScrollToBottomFramesRef.current = 2;
    setComposerValue('');
    startChatMutation.mutate(nextMessage);
  };

  const handleCompileRun = () => {
    if (!canCompileRun) return;
    const nextIntent = trimmedComposerValue;
    setComposerValue('');
    startRunMutation.mutate(nextIntent);
  };

  const handleStopChat = () => {
    if (!chatId || !canStopChat) return;
    stopChatMutation.mutate(chatId);
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key !== 'Enter' ||
      event.shiftKey ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }
    event.preventDefault();
    handleSendChat();
  };

  const canonicalHasSubmittedUser = useMemo(() => {
    if (!submittedComposerValue) return false;
    const submittedText = normalizeThreadText(submittedComposerValue);
    return threadMessages.some((entry) => entry.actor === 'user' && normalizeThreadText(entry.body) === submittedText);
  }, [submittedComposerValue, threadMessages]);

  const canonicalHasLiveAssistant = useMemo(() => {
    if (!liveAssistantMessage) return false;
    const assistantText = normalizeThreadText(liveAssistantMessage);
    return threadMessages.some((entry) => entry.actor === 'orchestrator' && normalizeThreadText(entry.body) === assistantText);
  }, [liveAssistantMessage, threadMessages]);

  const liveThread = useMemo<OperateThreadEntry[]>(() => {
    if (!submittedComposerValue && !liveAssistantMessage && !liveChatError && liveChatStatus === 'idle') return [];
    const items: OperateThreadEntry[] = [];
    if (
      submittedComposerValue &&
      !canonicalHasSubmittedUser &&
      (
        startChatMutation.isPending ||
        startRunMutation.isPending ||
        liveChatStatus === 'queued' ||
        liveChatStatus === 'streaming' ||
        liveChatStatus === 'cancelled' ||
        liveAssistantMessage ||
        liveChatError
      )
    ) {
      items.push({
        entryId: 'live-user',
        actor: 'user',
        body: submittedComposerValue,
        artifacts: []
      });
    }
    if (
      (liveAssistantMessage || liveChatError || ((liveChatStatus === 'queued' || liveChatStatus === 'streaming') && Boolean(submittedComposerValue))) &&
      (!canonicalHasLiveAssistant || liveChatStatus === 'queued' || liveChatStatus === 'streaming' || Boolean(liveChatError))
    ) {
      items.push({
        entryId: 'live-orchestrator',
        actor: 'orchestrator',
        title: liveChatStatus === 'cancelled' ? 'Stopped orchestrator response' : 'Streaming orchestrator response',
        body: liveAssistantMessage || (liveChatError ? undefined : 'Thinking...'),
        artifacts: liveChatError
          ? [
              {
                type: 'policy_notice',
                title: 'Chat unavailable',
                message: liveChatError,
                tone: 'danger',
                nextActions: ['Retry under narrower constraints', 'Open risk panel']
              }
            ]
          : liveChatStatus === 'cancelled'
            ? [
                {
                  type: 'policy_notice',
                  title: 'Response stopped',
                  message: 'Streaming was stopped by the operator. The partial interpretation remains available in the thread.',
                  tone: 'warning',
                  nextActions: ['Send a narrower follow-up', 'Compile governed run']
                }
              ]
            : []
      });
    }
    return items;
  }, [
    canonicalHasLiveAssistant,
    canonicalHasSubmittedUser,
    liveAssistantMessage,
    liveChatError,
    liveChatStatus,
    startChatMutation.isPending,
    startRunMutation.isPending,
    submittedComposerValue
  ]);

  useEffect(() => {
    setThreadMessages([]);
    setThreadCursor(null);
    setThreadHasMore(false);
    setThreadLoadingMore(false);
    setThreadPinnedToBottom(true);
    setUnseenCount(0);
    setLiveChatStatus('idle');
    setThreadOverlayVisible(true);
    prependSnapshotRef.current = null;
    initialThreadPositionedRef.current = false;
    lastThreadLengthRef.current = 0;
    lastScrollTopRef.current = 0;
    overlayHideAccumulatorRef.current = 0;
    overlayShowAccumulatorRef.current = 0;
  }, [runId]);

  useEffect(() => {
    const page = threadPageQuery.data;
    if (!page) return;

    setThreadMessages((current) => {
      if (!current.length) {
        return page.messages;
      }

      const existingIds = new Set(current.map((entry) => entry.entryId));
      const missingTail = page.messages.filter((entry) => !existingIds.has(entry.entryId));
      return missingTail.length ? [...current, ...missingTail] : current;
    });
    setThreadCursor((current) => current ?? page.nextCursor);
    setThreadHasMore(page.hasMore);
  }, [threadPageQuery.data]);

  useEffect(() => {
    if (
      startChatMutation.isPending ||
      startRunMutation.isPending ||
      stopChatMutation.isPending ||
      liveChatStatus === 'queued' ||
      liveChatStatus === 'streaming' ||
      liveChatStatus === 'failed'
    ) {
      return;
    }
    if (submittedComposerValue && !canonicalHasSubmittedUser) return;
    if (liveAssistantMessage && !canonicalHasLiveAssistant) return;

    setLiveAssistantMessage('');
    setLiveChatError(null);
    setLiveChatStatus('idle');
    setSubmittedComposerValue(null);
  }, [
    canonicalHasLiveAssistant,
    canonicalHasSubmittedUser,
    liveAssistantMessage,
    liveChatStatus,
    startChatMutation.isPending,
    startRunMutation.isPending,
    stopChatMutation.isPending,
    submittedComposerValue
  ]);

  const threadItems = useMemo(() => [...threadMessages, ...liveThread], [liveThread, threadMessages]);
  const conversationTitle = useMemo(
    () => deriveConversationTitle({
      runObjective: run?.objective,
      submittedComposerValue,
      threadMessages: threadItems
    }),
    [run?.objective, submittedComposerValue, threadItems]
  );
  const newestThreadEntryId = threadItems[threadItems.length - 1]?.entryId;
  const composerState = run?.runState === 'waiting_approval' || run?.runState === 'release_approval_required'
    ? 'approval-paused'
    : run?.runState === 'release_blocked'
      ? 'blocked'
      : startRunMutation.isPending || startChatMutation.isPending
        ? 'running'
        : 'idle';

  const threadVirtualizer = useVirtualizer({
    count: compactViewport ? threadItems.length : 0,
    getScrollElement: () => threadRef.current,
    estimateSize: () => 188,
    overscan: 5
  });

  const virtualItems = compactViewport ? threadVirtualizer.getVirtualItems() : [];

  const scrollThreadToBottom = () => {
    if (compactViewport) {
      if (!threadItems.length) return;
      threadVirtualizer.scrollToIndex(threadItems.length - 1, { align: 'end' });
      return;
    }

    const node = threadRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  };

  useEffect(() => {
    if (pendingScrollToBottomFramesRef.current <= 0) return undefined;

    let frame = 0;
    const step = () => {
      if (pendingScrollToBottomFramesRef.current <= 0) return;
      pendingScrollToBottomFramesRef.current -= 1;
      scrollThreadToBottom();
      if (pendingScrollToBottomFramesRef.current > 0) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [compactViewport, newestThreadEntryId, threadItems.length]);

  useEffect(() => {
    const node = threadRef.current;
    const prependSnapshot = prependSnapshotRef.current;
    if (!node || !prependSnapshot) return;

    const frame = requestAnimationFrame(() => {
      const currentNode = threadRef.current;
      const currentSnapshot = prependSnapshotRef.current;
      if (!currentNode || !currentSnapshot) return;

      const delta = currentNode.scrollHeight - currentSnapshot.scrollHeight;
      currentNode.scrollTop = currentSnapshot.scrollTop + delta;
      prependSnapshotRef.current = null;
    });

    return () => cancelAnimationFrame(frame);
  }, [compactViewport, threadItems.length]);

  useEffect(() => {
    if (!threadItems.length || prependSnapshotRef.current) return;
    if (!initialThreadPositionedRef.current) {
      initialThreadPositionedRef.current = true;
      const frame = requestAnimationFrame(scrollThreadToBottom);
      return () => cancelAnimationFrame(frame);
    }
    if (!threadPinnedToBottom) return;
    const frame = requestAnimationFrame(scrollThreadToBottom);
    return () => cancelAnimationFrame(frame);
  }, [compactViewport, newestThreadEntryId, threadItems.length, threadPinnedToBottom]);

  useEffect(() => {
    if (!threadPinnedToBottom) return;
    if (
      !submittedComposerValue &&
      !liveAssistantMessage &&
      !liveChatError &&
      liveChatStatus !== 'queued' &&
      liveChatStatus !== 'streaming'
    ) {
      return;
    }

    const frame = requestAnimationFrame(scrollThreadToBottom);
    return () => cancelAnimationFrame(frame);
  }, [liveAssistantMessage, liveChatError, liveChatStatus, submittedComposerValue, threadPinnedToBottom]);

  useEffect(() => {
    const previousLength = lastThreadLengthRef.current;
    if (previousLength === 0) {
      lastThreadLengthRef.current = threadItems.length;
      return;
    }
    if (threadItems.length <= previousLength) {
      lastThreadLengthRef.current = threadItems.length;
      return;
    }

    const appendedCount = threadItems.length - previousLength;
    lastThreadLengthRef.current = threadItems.length;
    if (isNearBottomRef.current) {
      setUnseenCount(0);
      setComposerCollapsed(false);
      return;
    }
    setUnseenCount((current) => current + appendedCount);
  }, [threadItems.length]);

  const loadOlderMessages = async () => {
    const oldestEntryId = threadMessages[0]?.entryId ?? threadCursor;
    const node = threadRef.current;
    if (!oldestEntryId || !threadHasMore || threadLoadingMore || !node) return;

    prependSnapshotRef.current = {
      scrollHeight: node.scrollHeight,
      scrollTop: node.scrollTop
    };
    setThreadLoadingMore(true);

    try {
      const page = await fetchOperateThreadPage({
        runId,
        before: oldestEntryId,
        limit: THREAD_PAGE_SIZE
      });
      setThreadMessages((current) => {
        const existingIds = new Set(current.map((entry) => entry.entryId));
        const olderMessages = page.messages.filter((entry) => !existingIds.has(entry.entryId));
        return olderMessages.length ? [...olderMessages, ...current] : current;
      });
      setThreadCursor(page.nextCursor);
      setThreadHasMore(page.hasMore);
    } finally {
      setThreadLoadingMore(false);
    }
  };

  const jumpToLatest = () => {
    setComposerCollapsed(false);
    setThreadPinnedToBottom(true);
    setUnseenCount(0);
    setThreadOverlayVisible(true);
    upwardScrollAccumulatorRef.current = 0;
    downwardScrollAccumulatorRef.current = 0;
    overlayHideAccumulatorRef.current = 0;
    overlayShowAccumulatorRef.current = 0;
    isNearBottomRef.current = true;

    requestAnimationFrame(scrollThreadToBottom);
  };

  const handleThreadScroll = (node: HTMLDivElement) => {
    const currentScrollTop = node.scrollTop;
    const delta = currentScrollTop - lastScrollTopRef.current;
    lastScrollTopRef.current = currentScrollTop;

    const distanceFromBottom = node.scrollHeight - node.scrollTop - node.clientHeight;
    const nearBottom = distanceFromBottom < MOBILE_NEAR_BOTTOM_THRESHOLD;
    isNearBottomRef.current = nearBottom;
    setThreadPinnedToBottom(nearBottom);

    if (nearBottom) {
      setUnseenCount(0);
      setComposerCollapsed(false);
      upwardScrollAccumulatorRef.current = 0;
      downwardScrollAccumulatorRef.current = 0;
      overlayHideAccumulatorRef.current = 0;
      overlayShowAccumulatorRef.current = 0;
    } else if (compactViewport && delta < -4) {
      upwardScrollAccumulatorRef.current += Math.abs(delta);
      downwardScrollAccumulatorRef.current = 0;
      if (
        upwardScrollAccumulatorRef.current > MOBILE_COMPOSER_HIDE_SCROLL &&
        distanceFromBottom > MOBILE_FAR_FROM_BOTTOM_THRESHOLD
      ) {
        setComposerCollapsed(true);
      }
    } else if (compactViewport && delta > 4) {
      downwardScrollAccumulatorRef.current += delta;
      upwardScrollAccumulatorRef.current = 0;
      if (downwardScrollAccumulatorRef.current > MOBILE_COMPOSER_SHOW_SCROLL) {
        setComposerCollapsed(false);
      }
    }

    if (currentScrollTop <= THREAD_OVERLAY_TOP_INSET) {
      setThreadOverlayVisible(true);
      overlayHideAccumulatorRef.current = 0;
      overlayShowAccumulatorRef.current = 0;
    } else if (delta > 4) {
      overlayHideAccumulatorRef.current += delta;
      overlayShowAccumulatorRef.current = 0;
      if (overlayHideAccumulatorRef.current > THREAD_OVERLAY_HIDE_SCROLL) {
        setThreadOverlayVisible(false);
      }
    } else if (delta < -4) {
      overlayShowAccumulatorRef.current += Math.abs(delta);
      overlayHideAccumulatorRef.current = 0;
      if (overlayShowAccumulatorRef.current > THREAD_OVERLAY_SHOW_SCROLL) {
        setThreadOverlayVisible(true);
      }
    }

    const topThreshold = compactViewport ? MOBILE_TOP_LOAD_THRESHOLD : DESKTOP_TOP_LOAD_THRESHOLD;
    if (currentScrollTop <= topThreshold) {
      void loadOlderMessages();
    }
  };

  return (
    <AppShellLayout
      area="operate"
      title="Operate"
      subtitle="Chat-first governed execution workspace. Contract, policy, approvals, durable execution, and output control remain explicit."
      summary={workspace?.header.runStatus ?? 'idle'}
      tenantName={props.auth?.tenantName}
      userLabel={props.auth?.userLabel}
      pathname={pathname}
      onNavigate={(href) => router.push(href)}
      mobileLayout={compactViewport ? 'workspace' : 'default'}
      desktopLayout="workspace"
      workspaceOverlayVisible={threadOverlayVisible}
      inspector={
        workspace ? (
          <SidePanel
            workspace={workspace}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            run={run}
            onApprovePreExecution={() => runId && approvePreExecutionMutation.mutate()}
            onApproveRelease={() => runId && approveReleaseMutation.mutate()}
            onReleaseCheck={() => runId && releaseCheckMutation.mutate()}
            compact={false}
          />
        ) : (
          <StateBlock tone="loading" title="Loading" description="Preparing governed side-panel context." />
        )
      }
    >
      <div
        style={
          compactViewport
            ? {
                display: 'grid',
                gridTemplateRows: 'auto auto minmax(0,1fr) auto',
                gap: 10,
                minWidth: 0,
                minHeight: 0,
                height: '100%',
                padding: '0 12px calc(10px + env(safe-area-inset-bottom, 0px))'
              }
            : {
                display: 'grid',
                gap: 16,
                minWidth: 0,
                minHeight: 0,
                height: '100%',
                overflow: 'hidden',
                gridTemplateRows: 'auto minmax(0,1fr) auto'
              }
        }
      >
        {!compactViewport && statusNote ? <StateBlock tone="success" title="Operate updated" description={statusNote} /> : null}

        {workspace && compactViewport ? <MobileOperateStatus workspace={workspace} /> : null}

        {workspace ? (
          <div
            style={
              compactViewport
                ? {
                    position: 'sticky',
                    top: 0,
                    zIndex: 12,
                    display: 'grid',
                    gap: 8,
                    background: 'var(--paper)',
                    paddingBottom: 2
                  }
                : {
                    display: 'grid',
                    gap: 12,
                    minHeight: 0
                  }
            }
          >
            {compactViewport ? (
              <MobileDetailLauncher
                activeTab={activeTab}
                onOpen={(tab) => {
                  setActiveTab(tab);
                  setMobileDetailsOpen(true);
                }}
              />
            ) : null}
          </div>
        ) : null}

        {compactViewport ? (
          <div
            style={{
              minHeight: 0,
              overflow: 'hidden',
              background: 'transparent',
              position: 'relative'
            }}
          >
            <div
              style={{
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                overscrollBehavior: 'contain',
                padding: `${THREAD_OVERLAY_PADDING_MOBILE}px 0 4px`,
                scrollbarWidth: 'thin'
              }}
              ref={threadRef}
              onScroll={(event) => handleThreadScroll(event.currentTarget)}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 86,
                  right: 52,
                  height: 34,
                  zIndex: 15,
                  pointerEvents: 'none',
                  opacity: threadOverlayVisible ? 1 : 0,
                  transform: threadOverlayVisible ? 'translateY(0)' : 'translateY(-10px)',
                  transition: reducedMotion ? 'none' : 'opacity 160ms ease, transform 160ms ease',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <div
                  style={{
                    display: 'block',
                    fontSize: 16,
                    lineHeight: '34px',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: 'var(--ink)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    transform: 'translateY(-1px)'
                  }}
                >
                  {conversationTitle}
                </div>
              </div>
              {!run && workspace?.quickIntents?.length ? (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap', overflowX: 'auto', padding: '0 0 10px' }}>
                  {workspace.quickIntents.map((intent) => (
                    <Button key={intent} variant="secondary" size="sm" onClick={() => setComposerValue(intent)}>
                      {intent}
                    </Button>
                  ))}
                </div>
              ) : null}

              {workspaceQuery.isLoading ? <StateBlock tone="loading" title="Loading workspace" description="Projecting contract, policy, plan, run, and output-control context." /> : null}

              {threadLoadingMore ? (
                <div style={{ padding: '0 0 10px' }}>
                  <StateBlock tone="loading" title="Loading history" description="Fetching older governed thread entries." />
                </div>
              ) : null}

              <div
                style={{
                  height: threadVirtualizer.getTotalSize(),
                  position: 'relative',
                  width: '100%'
                }}
              >
                {virtualItems.map((virtualItem) => {
                  const entry = threadItems[virtualItem.index];
                  if (!entry) return null;
                  return (
                    <div
                      key={entry.entryId}
                      data-index={virtualItem.index}
                      ref={threadVirtualizer.measureElement}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        paddingBottom: 10,
                        transform: `translateY(${virtualItem.start}px)`
                      }}
                    >
                      <ThreadEntryView entry={entry} compact />
                    </div>
                  );
                })}
              </div>
            </div>

            {statusNote ? (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 8,
                  zIndex: 14
                }}
              >
                <StateBlock tone="success" title="Operate updated" description={statusNote} />
              </div>
            ) : null}

            {unseenCount > 0 ? (
              <div
                style={{
                  position: 'absolute',
                  right: 12,
                  bottom: composerCollapsed ? 74 : 134,
                  transition: reducedMotion ? 'none' : `transform ${composerMotionMs}ms ease, opacity ${composerMotionMs}ms ease`,
                  transform: 'translateY(0)',
                  opacity: 1,
                  zIndex: 14
                }}
              >
                <Button variant="secondary" size="sm" onClick={jumpToLatest}>
                  {unseenCount} new {unseenCount === 1 ? 'message' : 'messages'}
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div
            style={{
              minHeight: 0,
              height: '100%',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 88,
                  right: 88,
                  height: 34,
                  zIndex: 15,
                  pointerEvents: 'none',
                  opacity: threadOverlayVisible ? 1 : 0,
                  transform: threadOverlayVisible ? 'translateY(0)' : 'translateY(-12px)',
                  transition: reducedMotion ? 'none' : 'opacity 160ms ease, transform 160ms ease',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <div
                  style={{
                    display: 'block',
                    fontSize: 18,
                    lineHeight: '34px',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    color: 'var(--ink)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    transform: 'translateY(-1px)'
                  }}
                >
                  {conversationTitle}
                </div>
              </div>
            <div
              ref={threadRef}
              onScroll={(event) => handleThreadScroll(event.currentTarget)}
              style={{
                minHeight: 0,
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                overscrollBehavior: 'contain',
                display: 'grid',
                alignContent: 'start',
                gap: 12,
                paddingRight: 4,
                paddingTop: THREAD_OVERLAY_PADDING_DESKTOP,
                paddingBottom: 2
              }}
            >
              {!run && workspace?.quickIntents?.length ? (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {workspace.quickIntents.map((intent) => (
                    <Button key={intent} variant="secondary" size="sm" onClick={() => setComposerValue(intent)}>
                      {intent}
                    </Button>
                  ))}
                </div>
              ) : null}

              {workspaceQuery.isLoading ? <StateBlock tone="loading" title="Loading workspace" description="Projecting contract, policy, plan, run, and output-control context." /> : null}
              {threadLoadingMore ? <StateBlock tone="loading" title="Loading history" description="Fetching older governed thread entries." /> : null}
              {threadItems.map((entry) => (
                <ThreadEntryView key={entry.entryId} entry={entry} />
              ))}
            </div>
          </div>
        )}

        <div
          style={
            compactViewport
              ? {
                  padding: composerCollapsed ? '2px 6px calc(2px + env(safe-area-inset-bottom, 0px))' : '4px 6px calc(4px + env(safe-area-inset-bottom, 0px))',
                  borderTop: '1px solid var(--line)',
                  background: 'var(--panel)',
                  display: 'grid',
                  gap: composerCollapsed ? 1 : 2,
                  boxShadow: '0 -8px 24px rgba(15,23,42,0.04)',
                  transition: reducedMotion ? 'none' : `padding ${composerMotionMs}ms ease, gap ${composerMotionMs}ms ease`
                }
              : {
                  padding: '4px 8px 6px',
                  borderTop: '1px solid var(--line)',
                  background: 'var(--panel)',
                  display: 'grid',
                  gap: 2
                }
          }
        >
          <div style={{ display: 'grid', gap: composerCollapsed && compactViewport ? 1 : 2 }}>
            <div
              style={{
                border: '1px solid var(--line)',
                borderRadius: compactViewport ? 15 : 16,
                background: 'var(--surface)',
                padding: compactViewport ? '6px' : '6px 8px',
                display: 'grid',
                gap: compactViewport ? 6 : 8,
                gridTemplateColumns: 'minmax(0,1fr) auto',
                alignItems: 'end'
              }}
            >
              {!composerCollapsed ? (
                <>
                  <Textarea
                    ref={composerRef}
                    rows={1}
                    value={composerValue}
                    onChange={(event) => setComposerValue(event.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    placeholder={composerPlaceholder}
                    style={{
                      minHeight: compactViewport ? 32 : 36,
                      maxHeight: composerMaxHeight,
                      resize: 'none',
                      overflowY: 'hidden',
                      overscrollBehavior: 'contain',
                      border: 'none',
                      background: 'transparent',
                      padding: compactViewport ? '2px 0 1px' : '3px 1px 2px',
                      boxShadow: 'none'
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 6,
                      alignItems: 'center',
                      minWidth: 'fit-content',
                      justifyContent: 'flex-end'
                    }}
                  >
                    <Button
                      onClick={handleSendChat}
                      disabled={!canSendChat}
                      title="Send"
                      aria-label="Send"
                      style={{ width: 38, height: 38, minWidth: 38, padding: 0, justifyContent: 'center' }}
                    >
                      <ArrowRight size={16} />
                    </Button>
                    {canStopChat ? (
                      <Button
                        variant="danger"
                        onClick={handleStopChat}
                        disabled={stopChatMutation.isPending}
                        title="Stop"
                        aria-label="Stop"
                        style={{ width: 38, height: 38, minWidth: 38, padding: 0, justifyContent: 'center' }}
                      >
                        <X size={16} />
                      </Button>
                    ) : null}
                    <Button
                      variant="secondary"
                      onClick={handleCompileRun}
                      disabled={!canCompileRun}
                      title="Compile governed run"
                      aria-label="Compile governed run"
                      style={{ width: 38, height: 38, minWidth: 38, padding: 0, justifyContent: 'center' }}
                    >
                      <PlayCircle size={16} />
                    </Button>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    borderRadius: 16,
                    background: 'transparent',
                    color: 'var(--muted)',
                    fontSize: 13,
                    minHeight: 28,
                    display: 'grid',
                    alignItems: 'center',
                    ...lineClamp(1)
                  }}
                >
                  {composerState === 'approval-paused'
                    ? 'Run paused for approval. Scroll down to resume governed actions.'
                    : composerState === 'blocked'
                      ? 'Output blocked by policy. Scroll down to review safe next actions.'
                      : composerValue || composerPlaceholder}
                </div>
              )}
            </div>
          </div>
        </div>

        {workspace && compactViewport ? (
          <MobileDetailSheet open={detailSheetPresence.mounted} visible={detailSheetPresence.visible} motionMs={detailMotionMs} onClose={() => setMobileDetailsOpen(false)} title={activeTabLabel}>
            <SidePanel
              workspace={workspace}
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              run={run}
              onApprovePreExecution={() => runId && approvePreExecutionMutation.mutate()}
              onApproveRelease={() => runId && approveReleaseMutation.mutate()}
              onReleaseCheck={() => runId && releaseCheckMutation.mutate()}
              compact
            />
          </MobileDetailSheet>
        ) : null}
      </div>
    </AppShellLayout>
  );
}
