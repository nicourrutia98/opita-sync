import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { forwardRef, useMemo } from 'react';
import { getThemeTokens, type ThemeMode, type Tone, useTheme } from './theme.js';

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function toneColor(theme: ThemeMode, tone: Tone) {
  const tokens = getThemeTokens(theme);
  switch (tone) {
    case 'brand':
      return { background: tokens.brandSoft, color: tokens.brandStrong, borderColor: tokens.brandSoft };
    case 'success':
      return { background: theme === 'dark' ? 'rgba(57,198,122,0.14)' : 'rgba(57,198,122,0.15)', color: tokens.success, borderColor: theme === 'dark' ? 'rgba(57,198,122,0.28)' : 'rgba(57,198,122,0.18)' };
    case 'warning':
      return { background: theme === 'dark' ? 'rgba(240,179,77,0.14)' : 'rgba(240,179,77,0.16)', color: tokens.warning, borderColor: theme === 'dark' ? 'rgba(240,179,77,0.26)' : 'rgba(240,179,77,0.2)' };
    case 'danger':
      return { background: theme === 'dark' ? 'rgba(251,113,133,0.14)' : 'rgba(180,35,24,0.1)', color: tokens.danger, borderColor: theme === 'dark' ? 'rgba(251,113,133,0.26)' : 'rgba(180,35,24,0.18)' };
    case 'muted':
      return { background: tokens.surface, color: tokens.subtle, borderColor: tokens.line };
    default:
      return { background: tokens.surface, color: tokens.muted, borderColor: tokens.line };
  }
}

export function Card(props: HTMLAttributes<HTMLDivElement>) {
  const { tokens } = useTheme();
  return (
    <section
      {...props}
      style={{
        background: tokens.panel,
        border: `1px solid ${tokens.line}`,
        borderRadius: 24,
        boxShadow: `0 12px 32px ${tokens.shadow}`,
        padding: 0,
        ...props.style
      }}
    />
  );
}

export function CardHeader(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} style={{ padding: 20, paddingBottom: 0, ...props.style }} />;
}

export function CardContent(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} style={{ padding: 20, ...props.style }} />;
}

export function CardTitle(props: HTMLAttributes<HTMLHeadingElement>) {
  const { tokens } = useTheme();
  return <h3 {...props} style={{ margin: 0, color: tokens.ink, fontSize: 18, lineHeight: 1.2, fontWeight: 650, ...props.style }} />;
}

export function Badge(props: { tone?: Tone; children: ReactNode; className?: string }) {
  const { tokens, theme } = useTheme();
  const styles = toneColor(theme, props.tone ?? 'neutral');
  return (
    <span
      className={props.className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        minHeight: 26,
        borderRadius: 999,
        border: `1px solid ${styles.borderColor}`,
        background: styles.background,
        color: styles.color,
        padding: '4px 10px',
        fontSize: 12,
        fontWeight: 650,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap'
      }}
    >
      {props.children}
    </span>
  );
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: 'sm' | 'md' | 'lg' }) {
  const { tokens } = useTheme();
  const { variant = 'primary', size = 'md', style, ...rest } = props;
  const styles = useMemo(() => {
    const base = {
      borderRadius: 16,
      border: '1px solid transparent',
      fontWeight: 650,
      cursor: 'pointer',
      transition: 'transform 120ms ease, background-color 120ms ease, border-color 120ms ease, color 120ms ease'
    } as const;
    const heights = { sm: 36, md: 42, lg: 48 } as const;
    if (variant === 'secondary') {
      return {
        ...base,
        background: tokens.panel,
        color: tokens.ink,
        borderColor: tokens.line,
        height: heights[size]
      };
    }
    if (variant === 'ghost') {
      return {
        ...base,
        background: 'transparent',
        color: tokens.muted,
        borderColor: 'transparent',
        height: heights[size]
      };
    }
    if (variant === 'danger') {
      return {
        ...base,
        background: tokens.danger,
        color: '#fff',
        borderColor: tokens.danger,
        height: heights[size]
      };
    }
    return {
      ...base,
      background: tokens.brand,
      color: '#fff',
      borderColor: tokens.brand,
      boxShadow: `0 10px 24px ${tokens.shadow}`,
      height: heights[size]
    };
  }, [size, tokens, variant]);

  return (
    <button
      {...rest}
      style={{
        ...styles,
        padding: size === 'sm' ? '0 12px' : size === 'lg' ? '0 18px' : '0 16px',
        ...style
      }}
    />
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(props, ref) {
  const { tokens } = useTheme();
  return (
    <input
      ref={ref}
      {...props}
      style={{
        height: 44,
        borderRadius: 16,
        border: `1px solid ${tokens.line}`,
        background: tokens.panel,
        color: tokens.ink,
        padding: '0 14px',
        outline: 'none',
        boxShadow: `0 1px 0 ${tokens.shadow}`,
        ...props.style
      }}
    />
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(props, ref) {
  const { tokens } = useTheme();
  return (
    <textarea
      ref={ref}
      {...props}
      style={{
        minHeight: 120,
        borderRadius: 18,
        border: `1px solid ${tokens.line}`,
        background: tokens.panel,
        color: tokens.ink,
        padding: '12px 14px',
        outline: 'none',
        resize: 'vertical',
        ...props.style
      }}
    />
  );
});

export function Separator(props: { vertical?: boolean }) {
  const { tokens } = useTheme();
  return (
    <div
      aria-hidden="true"
      style={{
        width: props.vertical ? 1 : '100%',
        height: props.vertical ? '100%' : 1,
        background: tokens.line
      }}
    />
  );
}

export function StateBlock(props: { tone: 'loading' | 'empty' | 'error' | 'success'; title: string; description: string }) {
  const { theme, tokens } = useTheme();
  const styles = toneColor(theme, props.tone === 'loading' ? 'muted' : props.tone === 'empty' ? 'neutral' : props.tone === 'error' ? 'danger' : 'success');
  return (
    <div
      style={{
        borderRadius: 20,
        border: `1px dashed ${styles.borderColor}`,
        background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : tokens.panel,
        padding: 16,
        color: tokens.ink
      }}
    >
      <div style={{ display: 'grid', gap: 6 }}>
        <strong style={{ color: styles.color }}>{props.title}</strong>
        <span style={{ color: tokens.muted, fontSize: 13, lineHeight: 1.5 }}>{props.description}</span>
      </div>
    </div>
  );
}

export function MetricCard(props: { label: string; value: string; helper: string }) {
  const { tokens } = useTheme();
  return (
    <Card>
      <CardContent>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: tokens.subtle, fontWeight: 700 }}>{props.label}</div>
          <div style={{ fontSize: 34, lineHeight: 1.1, fontWeight: 700, color: tokens.ink }}>{props.value}</div>
          <div style={{ fontSize: 13, color: tokens.muted, lineHeight: 1.5 }}>{props.helper}</div>
        </div>
      </CardContent>
    </Card>
  );
}

