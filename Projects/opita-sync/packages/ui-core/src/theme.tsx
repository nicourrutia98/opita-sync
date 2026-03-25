import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';
export type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'muted';

export interface ThemeTokens {
  paper: string;
  panel: string;
  surface: string;
  surfaceAlt: string;
  line: string;
  ink: string;
  muted: string;
  subtle: string;
  brand: string;
  brandStrong: string;
  brandSoft: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  shadow: string;
}

const LIGHT_TOKENS: ThemeTokens = {
  paper: '#f5f7fb',
  panel: '#ffffff',
  surface: '#eef2f7',
  surfaceAlt: '#e5ebf2',
  line: '#d6dde6',
  ink: '#17212b',
  muted: '#5d6b78',
  subtle: '#7d8794',
  brand: '#0f766e',
  brandStrong: '#0a5c56',
  brandSoft: '#d5efeb',
  success: '#0f7a4a',
  warning: '#946300',
  danger: '#b42318',
  info: '#2563eb',
  shadow: 'rgba(15, 23, 42, 0.08)'
};

const DARK_TOKENS: ThemeTokens = {
  paper: '#0b1117',
  panel: '#111922',
  surface: '#16202a',
  surfaceAlt: '#1c2834',
  line: '#273442',
  ink: '#edf3f8',
  muted: '#9aa7b4',
  subtle: '#768391',
  brand: '#35d0c4',
  brandStrong: '#19b3a8',
  brandSoft: '#113c39',
  success: '#39c67a',
  warning: '#f0b34d',
  danger: '#fb7185',
  info: '#60a5fa',
  shadow: 'rgba(2, 6, 23, 0.44)'
};

export function getThemeTokens(theme: ThemeMode): ThemeTokens {
  return theme === 'dark' ? DARK_TOKENS : LIGHT_TOKENS;
}

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  tokens: ThemeTokens;
}

const ThemeContext = createContext<ThemeState | null>(null);

export function ThemeProvider(props: { children: ReactNode; initialTheme?: ThemeMode }) {
  const [theme, setTheme] = useState<ThemeMode>(props.initialTheme ?? 'light');

  useEffect(() => {
    const stored = window.localStorage.getItem('opita-theme');
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('opita-theme', theme);
    document.documentElement.dataset.theme = theme;
    const tokens = getThemeTokens(theme);
    const root = document.documentElement.style;
    root.setProperty('--paper', tokens.paper);
    root.setProperty('--panel', tokens.panel);
    root.setProperty('--surface', tokens.surface);
    root.setProperty('--surface-alt', tokens.surfaceAlt);
    root.setProperty('--line', tokens.line);
    root.setProperty('--ink', tokens.ink);
    root.setProperty('--muted', tokens.muted);
    root.setProperty('--subtle', tokens.subtle);
    root.setProperty('--brand', tokens.brand);
    root.setProperty('--brand-strong', tokens.brandStrong);
    root.setProperty('--brand-soft', tokens.brandSoft);
    root.setProperty('--success', tokens.success);
    root.setProperty('--warning', tokens.warning);
    root.setProperty('--danger', tokens.danger);
    root.setProperty('--info', tokens.info);
  }, [theme]);

  const state = useMemo<ThemeState>(() => ({ theme, setTheme, tokens: getThemeTokens(theme) }), [theme]);

  return <ThemeContext.Provider value={state}>{props.children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return value;
}

