'use client';

import { useEffect } from 'react';
import { useThemeStore, THEMES } from '@/stores/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { activeThemeId, darkMode } = useThemeStore();

  useEffect(() => {
    useThemeStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const theme = THEMES.find((t) => t.id === activeThemeId) || THEMES[0];
    applyThemeToCSS(theme, darkMode);
  }, [activeThemeId, darkMode]);

  return <>{children}</>;
}

function applyThemeToCSS(theme: (typeof THEMES)[0], isDark: boolean) {
  const root = document.documentElement;
  const c = theme.colors;

  // Toggle dark class on <html>
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Theme accent colors (same for both modes)
  root.style.setProperty('--theme-primary', c.primary);
  root.style.setProperty('--theme-secondary', c.secondary);
  root.style.setProperty('--theme-accent', c.accent);
  root.style.setProperty('--theme-gradient', c.gradient);
  root.style.setProperty('--theme-glow', c.glow);

  // Map to shadcn CSS vars
  root.style.setProperty('--primary', c.primary);
  root.style.setProperty('--accent', c.primary);
  root.style.setProperty('--ring', c.primary);
  root.style.setProperty('--chart-1', c.primary);
  root.style.setProperty('--sidebar-primary', c.primary);
  root.style.setProperty('--sidebar-ring', c.primary);

  // Transition on body
  document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
}

export default ThemeProvider;
