import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('yaml-builder-theme') as Theme | null;
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('ex-theme-light', 'ex-theme-dark');
    root.classList.add(theme === 'dark' ? 'ex-theme-dark' : 'ex-theme-light');
    localStorage.setItem('yaml-builder-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return { theme, toggleTheme };
}
