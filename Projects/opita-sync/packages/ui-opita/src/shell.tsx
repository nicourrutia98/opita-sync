import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronRight, Command, LayoutGrid, Menu, PanelRightOpen, PanelRightClose, Settings2, Activity, Inbox, ShieldCheck, BookOpenText, X } from 'lucide-react';
import { Badge, Button, Card, Separator } from '../../ui-core/src/primitives.js';
import { useTheme } from '../../ui-core/src/theme.js';
import { CANONICAL_AREAS, type CanonicalArea } from './navigation.js';
import { CommandPalette, type CommandItem } from './command-palette.js';

const iconByArea: Record<CanonicalArea, typeof LayoutGrid> = {
  operate: LayoutGrid,
  catalog: BookOpenText,
  inbox: Inbox,
  activity: Activity,
  governance: ShieldCheck,
  settings: Settings2
};

export function BrandLockup() {
  const { theme, tokens } = useTheme();
  const logo = theme === 'dark' ? '/brand/flow-grid-primary-dark.svg' : '/brand/flow-grid-primary.svg';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <img src={logo} alt="Opita Sync" style={{ width: 34, height: 34 }} />
      <div style={{ display: 'grid', gap: 2 }}>
        <strong style={{ fontSize: 15 }}>Opita Sync</strong>
        <span style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: tokens.subtle }}>Governed console</span>
      </div>
    </div>
  );
}

function areaHref(area: CanonicalArea) {
  return `/${area}`;
}

function useCompactShell(breakpoint = 960) {
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

export interface AppShellLayoutProps {
  area: CanonicalArea;
  title: string;
  subtitle: string;
  summary?: string;
  tenantName?: string;
  userLabel?: string;
  pathname: string;
  onNavigate: (href: string) => void;
  inspector?: ReactNode;
  children: ReactNode;
  mobileLayout?: 'default' | 'workspace';
  desktopLayout?: 'default' | 'workspace';
  workspaceOverlayVisible?: boolean;
}

export function AppShellLayout(props: AppShellLayoutProps) {
  const { tokens, theme, setTheme } = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const compactShell = useCompactShell();
  const desktopWorkspace = props.desktopLayout === 'workspace';
  const workspaceOverlayVisible = props.workspaceOverlayVisible ?? true;
  const reducedMotion = useReducedMotion();
  const navMotionMs = reducedMotion ? 1 : 160;
  const navPresence = useAnimatedPresence(mobileNavOpen, navMotionMs);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((current) => !current);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const commands = useMemo<CommandItem[]>(
    () => [
      ...CANONICAL_AREAS.map((area) => ({
        id: area.key,
        label: `Go to ${area.label}`,
        description: area.description,
        href: areaHref(area.key)
      })),
      { id: 'theme', label: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme', onSelect: () => setTheme(theme === 'dark' ? 'light' : 'dark') }
    ],
    [setTheme, theme]
  );

  useEffect(() => {
    if (!compactShell) {
      setMobileNavOpen(false);
    }
  }, [compactShell]);

  if (compactShell) {
    return (
      <div
        style={{
          height: '100dvh',
          background: tokens.paper,
          color: tokens.ink,
          display: 'grid',
          gridTemplateRows: props.mobileLayout === 'workspace' ? 'minmax(0,1fr)' : 'auto minmax(0,1fr)',
          overflow: 'hidden'
        }}
      >
        <CommandPalette open={paletteOpen} commands={commands} onClose={() => setPaletteOpen(false)} onNavigate={props.onNavigate} />

        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 60,
            padding: 'calc(10px + env(safe-area-inset-top, 0px)) 14px 10px',
            borderBottom: `1px solid ${tokens.line}`,
            background: tokens.panel
          }}
        >
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  border: `1px solid ${tokens.line}`,
                  background: tokens.surface,
                  color: tokens.ink,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Menu size={18} />
              </button>

              <div style={{ minWidth: 0, display: 'grid', justifyItems: 'center', gap: 2, flex: 1 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: tokens.subtle }}>{props.area}</div>
                <strong style={{ fontSize: 17, lineHeight: 1.1 }}>{props.title}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', minWidth: 40 }}>
                {props.summary ? <Badge tone="muted">{props.summary}</Badge> : null}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, minWidth: 0 }}>
              <div style={{ color: tokens.muted, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {props.tenantName ?? 'Tenant'} {' • '} {props.userLabel ?? 'Governed operator'}
              </div>
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: tokens.subtle,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Commands
              </button>
            </div>
          </div>
        </header>

        {navPresence.mounted ? (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 80,
              background: navPresence.visible ? 'rgba(8,15,29,0.32)' : 'rgba(8,15,29,0)',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 320px) 1fr',
              transition: `background ${navMotionMs}ms ease`
            }}
          >
            <div
              style={{
                height: '100dvh',
                background: tokens.surface,
                borderRight: `1px solid ${tokens.line}`,
                padding: 'calc(14px + env(safe-area-inset-top, 0px)) 14px calc(18px + env(safe-area-inset-bottom, 0px))',
                display: 'grid',
                gap: 16,
                alignContent: 'start',
                transform: navPresence.visible ? 'translateX(0)' : 'translateX(-14px)',
                opacity: navPresence.visible ? 1 : 0.01,
                transition: `transform ${navMotionMs}ms ease, opacity ${navMotionMs}ms ease`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <BrandLockup />
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close navigation"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    border: `1px solid ${tokens.line}`,
                    background: tokens.panel,
                    color: tokens.ink,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <Card style={{ background: tokens.panel }}>
                <div style={{ padding: 14, display: 'grid', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: tokens.subtle }}>Workspace</span>
                    <Badge tone="brand">{props.tenantName ?? 'Tenant'}</Badge>
                  </div>
                  <div style={{ color: tokens.muted, fontSize: 12, lineHeight: 1.45 }}>
                    {props.userLabel ? `${props.userLabel}. ` : ''}Contract-first. Policy-compiled. Output control remains explicit.
                  </div>
                </div>
              </Card>

              <nav style={{ display: 'grid', gap: 8 }}>
                {CANONICAL_AREAS.map((area) => {
                  const Icon = iconByArea[area.key];
                  const active = props.pathname?.startsWith(`/${area.key}`) ?? props.area === area.key;
                  return (
                    <button
                      key={area.key}
                      type="button"
                      onClick={() => {
                        setMobileNavOpen(false);
                        props.onNavigate(areaHref(area.key));
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        width: '100%',
                        borderRadius: 14,
                        border: `1px solid ${active ? tokens.brand : tokens.line}`,
                        background: active ? tokens.brandSoft : tokens.surface,
                        color: active ? tokens.brandStrong : tokens.ink,
                        padding: '12px 13px',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      <Icon size={18} />
                      <div style={{ display: 'grid', gap: 2, minWidth: 0 }}>
                        <span style={{ fontWeight: 650 }}>{area.label}</span>
                        <span style={{ fontSize: 12, color: active ? tokens.brandStrong : tokens.muted }}>{area.description}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>

              <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                <Button variant="secondary" onClick={() => setPaletteOpen(true)}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Command size={16} />
                    Command palette
                  </span>
                </Button>
                <Button variant="secondary" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                  Toggle {theme === 'dark' ? 'light' : 'dark'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await fetch('/api/auth/logout', {
                      method: 'POST',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({})
                    });
                    setMobileNavOpen(false);
                    props.onNavigate('/login');
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>

            <button
              type="button"
              aria-label="Close navigation overlay"
              onClick={() => setMobileNavOpen(false)}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
            />
          </div>
        ) : null}

        <main
          data-ui="page-shell"
          style={{
            minWidth: 0,
            minHeight: 0,
            overflow: props.mobileLayout === 'workspace' ? 'hidden' : 'auto',
            padding: props.mobileLayout === 'workspace' ? '8px 0 0' : '12px 12px calc(16px + env(safe-area-inset-bottom, 0px))',
            display: 'grid',
            gap: 12,
            gridTemplateRows: props.mobileLayout === 'workspace' ? 'auto minmax(0,1fr)' : undefined
          }}
        >
          <header style={{ display: 'grid', gap: 6, minWidth: 0, padding: props.mobileLayout === 'workspace' ? '0 12px' : 0 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: tokens.subtle }}>{props.area}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <h1 style={{ margin: 0, fontSize: 22, lineHeight: 1.05 }}>{props.title}</h1>
              {props.summary ? <Badge tone="muted">{props.summary}</Badge> : null}
            </div>
            <p
              style={{
                margin: 0,
                color: tokens.muted,
                lineHeight: 1.45,
                fontSize: 13,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {props.subtitle}
            </p>
          </header>

          <div style={{ minWidth: 0, minHeight: 0, overflow: props.mobileLayout === 'workspace' ? 'hidden' : 'visible' }}>{props.children}</div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ height: '100dvh', maxHeight: '100dvh', background: tokens.paper, color: tokens.ink, overflow: 'hidden' }}>
      <CommandPalette open={paletteOpen} commands={commands} onClose={() => setPaletteOpen(false)} onNavigate={props.onNavigate} />
      <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(0,1fr) auto', height: '100dvh', maxHeight: '100dvh', overflow: 'hidden' }}>
        <aside
          style={{
            position: 'sticky',
            top: 0,
            alignSelf: 'start',
            height: '100dvh',
            overflow: 'auto',
            borderRight: `1px solid ${tokens.line}`,
            background: tokens.panel,
            padding: 20,
            display: 'grid',
            gap: 18
          }}
        >
          <BrandLockup />

          <Card style={{ background: tokens.surface }}>
            <div style={{ padding: 16, display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: tokens.subtle }}>Workspace</span>
                <Badge tone="brand">{props.tenantName ?? 'Tenant'}</Badge>
              </div>
              <div style={{ color: tokens.muted, fontSize: 13, lineHeight: 1.5 }}>
                {props.userLabel ? `${props.userLabel}. ` : ''}Deny by default. Most restrictive rule wins. Output control stays visible.
              </div>
            </div>
          </Card>

          <nav style={{ display: 'grid', gap: 8 }}>
            {CANONICAL_AREAS.map((area) => {
              const Icon = iconByArea[area.key];
              const active = props.pathname?.startsWith(`/${area.key}`) ?? props.area === area.key;
              return (
                <button
                  key={area.key}
                  type="button"
                  onClick={() => props.onNavigate(areaHref(area.key))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    borderRadius: 16,
                    border: `1px solid ${active ? tokens.brand : tokens.line}`,
                    background: active ? tokens.brandSoft : tokens.panel,
                    color: active ? tokens.brandStrong : tokens.ink,
                    padding: '12px 14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: 650
                  }}
                >
                  <Icon size={18} />
                  <div style={{ display: 'grid', gap: 2 }}>
                    <span>{area.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: active ? tokens.brandStrong : tokens.muted }}>{area.description}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          <div style={{ marginTop: 'auto', display: 'grid', gap: 12 }}>
            <Separator />
            <Button variant="secondary" onClick={() => setPaletteOpen(true)}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Command size={16} />
                Command palette
              </span>
            </Button>
            <Button variant="secondary" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              Toggle {theme === 'dark' ? 'light' : 'dark'}
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                await fetch('/api/auth/logout', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({})
                });
                props.onNavigate('/login');
              }}
            >
              Logout
            </Button>
          </div>
        </aside>

        <main
          data-ui="page-shell"
          style={{
            minWidth: 0,
            minHeight: 0,
            height: '100dvh',
            maxHeight: '100dvh',
            padding: desktopWorkspace ? '8px 12px 12px' : 24,
            display: 'grid',
            gap: desktopWorkspace ? 8 : 18,
            gridTemplateRows: props.desktopLayout === 'workspace' ? 'minmax(0,1fr)' : undefined,
            overflow: props.desktopLayout === 'workspace' ? 'hidden' : 'auto',
            position: 'relative'
          }}
        >
          {desktopWorkspace ? (
            <div
              style={{
                position: 'absolute',
                top: 8,
                left: 12,
                right: 12,
                zIndex: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                minHeight: 34,
                padding: '0 2px',
                pointerEvents: 'none',
                opacity: workspaceOverlayVisible ? 1 : 0,
                transform: workspaceOverlayVisible ? 'translateY(0)' : 'translateY(-12px)',
                transition: 'opacity 160ms ease, transform 160ms ease'
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: tokens.subtle,
                  border: `1px solid ${tokens.line}`,
                  background: theme === 'dark' ? 'rgba(15,23,42,0.22)' : 'rgba(255,255,255,0.22)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 999,
                  padding: '7px 12px',
                  boxShadow: `0 10px 24px ${tokens.shadow}`
                }}
              >
                {props.area}
              </div>
              <button
                type="button"
                aria-label={inspectorOpen ? 'Close inspector' : 'Open inspector'}
                onClick={() => setInspectorOpen((current) => !current)}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  border: `1px solid ${tokens.line}`,
                  background: theme === 'dark' ? 'rgba(15,23,42,0.22)' : 'rgba(255,255,255,0.22)',
                  backdropFilter: 'blur(10px)',
                  color: tokens.ink,
                  boxShadow: `0 10px 24px ${tokens.shadow}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  pointerEvents: 'auto'
                }}
              >
                {inspectorOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
              </button>
            </div>
          ) : (
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'grid', gap: 6 }}>
                <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: tokens.subtle }}>{props.area}</div>
                <h1 style={{ margin: 0, fontSize: 28, lineHeight: 1.1 }}>{props.title}</h1>
                <p style={{ margin: 0, color: tokens.muted, lineHeight: 1.5, maxWidth: 920 }}>{props.subtitle}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {props.summary && <Badge tone="muted">{props.summary}</Badge>}
                <Button variant="secondary" onClick={() => setInspectorOpen((current) => !current)}>
                  {inspectorOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
                </Button>
              </div>
            </header>
          )}

          <div style={{ minWidth: 0, minHeight: 0, overflow: props.desktopLayout === 'workspace' ? 'hidden' : 'visible' }}>{props.children}</div>
        </main>

        <aside
          style={{
            width: inspectorOpen ? 350 : 0,
            overflow: 'hidden',
            borderLeft: inspectorOpen ? `1px solid ${tokens.line}` : 'none',
            background: tokens.panel,
            transition: 'width 160ms ease',
            display: 'grid'
          }}
        >
          <div style={{ minWidth: 350, padding: 20, display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <strong style={{ fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: tokens.subtle }}>Inspector</strong>
              <Button variant="ghost" size="sm" onClick={() => setInspectorOpen(false)}>
                <ChevronRight size={16} />
              </Button>
            </div>
            {props.inspector ?? <div style={{ color: tokens.muted, lineHeight: 1.5 }}>Select a run, asset, or policy to inspect context, risk, and approval state.</div>}
          </div>
        </aside>
      </div>
    </div>
  );
}
