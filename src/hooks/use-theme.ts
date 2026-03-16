import { useCallback, useEffect } from 'react';

import { useLocalStorage } from './use-local-storage';
import { useSSR } from './use-ssr';

export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'moodist-theme';

function getSystemTheme(): ThemeMode {
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

function getThemeColor(theme: ThemeMode) {
  return theme === 'light' ? '#fcfcfc' : '#050505';
}

export function useTheme() {
  const { isBrowser } = useSSR();
  const [theme, setTheme] = useLocalStorage<ThemeMode>(STORAGE_KEY, 'dark');

  useEffect(() => {
    if (!isBrowser) return;

    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      setTheme(getSystemTheme());
    }
  }, [isBrowser, setTheme]);

  useEffect(() => {
    if (!isBrowser) return;

    document.documentElement.dataset.theme = theme;

    const metaTheme = document.querySelector('meta[name="theme-color"]');

    metaTheme?.setAttribute('content', getThemeColor(theme));
  }, [isBrowser, theme]);

  const toggleTheme = useCallback(() => {
    setTheme(current => (current === 'dark' ? 'light' : 'dark'));
  }, [setTheme]);

  return {
    isDarkTheme: theme === 'dark',
    theme,
    toggleTheme,
  };
}
