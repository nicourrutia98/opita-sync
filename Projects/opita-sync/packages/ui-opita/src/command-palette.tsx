import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Badge, Button, Input } from '../../ui-core/src/primitives.js';
import { useTheme } from '../../ui-core/src/theme.js';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  href?: string;
  onSelect?: () => void;
}

export function CommandPalette(props: { open: boolean; commands: CommandItem[]; onClose: () => void; onNavigate: (href: string) => void }) {
  const { tokens } = useTheme();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!props.open) {
      setQuery('');
    }
  }, [props.open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        props.onClose();
      }
    }

    if (props.open) {
      window.addEventListener('keydown', onKeyDown);
    }
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [props.open, props]);

  const filtered = useMemo(
    () =>
      props.commands.filter((command) => {
        const haystack = `${command.label} ${command.description ?? ''}`.toLowerCase();
        return haystack.includes(query.trim().toLowerCase());
      }),
    [props.commands, query]
  );

  if (!props.open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(2, 6, 23, 0.4)',
        display: 'grid',
        placeItems: 'start center',
        paddingTop: 92,
        zIndex: 70
      }}
      onClick={props.onClose}
    >
      <div
        style={{
          width: 'min(720px, calc(100vw - 24px))',
          background: tokens.panel,
          border: `1px solid ${tokens.line}`,
          borderRadius: 24,
          boxShadow: `0 30px 80px ${tokens.shadow}`,
          overflow: 'hidden'
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderBottom: `1px solid ${tokens.line}` }}>
          <Search size={18} color={tokens.subtle} />
          <Input value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Ir a Operate, abrir Inbox, buscar..." style={{ flex: 1, border: 'none', boxShadow: 'none', background: 'transparent', padding: 0, height: 28 }} />
          <Badge tone="muted">{filtered.length} comandos</Badge>
        </div>

        <div style={{ maxHeight: 420, overflow: 'auto' }}>
          {filtered.map((command) => (
            <button
              key={command.id}
              style={{
                width: '100%',
                display: 'grid',
                gap: 4,
                textAlign: 'left',
                padding: 16,
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${tokens.line}`,
                color: tokens.ink,
                cursor: 'pointer'
              }}
              onClick={() => {
                props.onClose();
                if (command.href) props.onNavigate(command.href);
                command.onSelect?.();
              }}
            >
              <strong>{command.label}</strong>
              {command.description && <span style={{ color: tokens.muted, fontSize: 13 }}>{command.description}</span>}
            </button>
          ))}
          {filtered.length === 0 && <div style={{ padding: 20, color: tokens.muted }}>Sin resultados.</div>}
        </div>
      </div>
    </div>
  );
}

