'use client';

import { useEffect } from 'react';
import { useThemeStore, THEMES } from '@/stores/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { activeThemeId, setActiveTheme } = useThemeStore();

  // Rehydrate persisted theme on mount
  useEffect(() => {
    useThemeStore.persist.rehydrate();
  }, []);

  // Apply theme whenever activeThemeId changes
  useEffect(() => {
    const theme = THEMES.find((t) => t.id === activeThemeId) || THEMES[0];
    applyThemeToCSS(theme);
  }, [activeThemeId]);

  return <>{children}</>;
}

function applyThemeToCSS(theme: (typeof THEMES)[0]) {
  const root = document.documentElement;
  const c = theme.colors;

  // === Core theme CSS custom properties ===
  root.style.setProperty('--theme-primary', c.primary);
  root.style.setProperty('--theme-secondary', c.secondary);
  root.style.setProperty('--theme-accent', c.accent);
  root.style.setProperty('--theme-gradient', c.gradient);
  root.style.setProperty('--theme-glow', c.glow);
  root.style.setProperty('--theme-bg', c.bg);
  root.style.setProperty('--theme-card', c.card);
  root.style.setProperty('--theme-text', c.text);
  root.style.setProperty('--theme-text-muted', c.textMuted);
  root.style.setProperty('--theme-border', c.border);

  // === Map to shadcn CSS vars ===
  root.style.setProperty('--primary', c.primary);
  root.style.setProperty('--accent', c.primary);
  root.style.setProperty('--ring', c.primary);
  root.style.setProperty('--chart-1', c.primary);
  root.style.setProperty('--sidebar-primary', c.primary);
  root.style.setProperty('--sidebar-ring', c.primary);

  // === Body background ===
  document.body.style.backgroundColor = c.bg;
  document.body.style.color = c.text;
  document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
}

export default ThemeProvider;
