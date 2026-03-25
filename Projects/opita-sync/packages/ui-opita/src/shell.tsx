import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronRight, Command, LayoutGrid, PanelRightOpen, PanelRightClose, Settings2, Activity, Inbox, ShieldCheck, BookOpenText } from 'lucide-react';
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

export interface AppShellLayoutProps {
  area: CanonicalArea;
  title: string;
  subtitle: string;
  summary?: string;
  pathname: string;
  onNavigate: (href: string) => void;
  inspector?: ReactNode;
  children: ReactNode;
}

export function AppShellLayout(props: AppShellLayoutProps) {
  const { tokens, theme, setTheme } = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(true);

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

  return (
    <div style={{ minHeight: '100dvh', background: tokens.paper, color: tokens.ink }}>
      <CommandPalette open={paletteOpen} commands={commands} onClose={() => setPaletteOpen(false)} onNavigate={props.onNavigate} />
      <div style={{ display: 'grid', gridTemplateColumns: '280px minmax(0,1fr) auto', minHeight: '100dvh' }}>
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
                <Badge tone="brand">Tenant 1</Badge>
              </div>
              <div style={{ color: tokens.muted, fontSize: 13, lineHeight: 1.5 }}>Deny by default. Most restrictive rule wins. Output control stays visible.</div>
            </div>
          </Card>

          <nav style={{ display: 'grid', gap: 8 }}>
            {CANONICAL_AREAS.map((area) => {
              const Icon = iconByArea[area.key];
              const active = props.pathname?.startsWith(`/${area.key}`) ?? props.area === area.key;
              return (
                <a
                  key={area.key}
                  href={areaHref(area.key)}
                  onClick={(event) => {
                    event.preventDefault();
                    props.onNavigate(areaHref(area.key));
                  }}
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
                    fontWeight: 650,
                    textDecoration: 'none'
                  }}
                >
                  <Icon size={18} />
                  <div style={{ display: 'grid', gap: 2 }}>
                    <span>{area.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: active ? tokens.brandStrong : tokens.muted }}>{area.description}</span>
                  </div>
                </a>
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
          </div>
        </aside>

        <main data-ui="page-shell" style={{ minWidth: 0, padding: 24, display: 'grid', gap: 18 }}>
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

          <div style={{ minWidth: 0 }}>{props.children}</div>
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
