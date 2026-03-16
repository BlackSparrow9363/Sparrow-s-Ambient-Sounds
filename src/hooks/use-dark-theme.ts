import { useTheme } from './use-theme';

export function useDarkTheme() {
  const { isDarkTheme } = useTheme();

  return isDarkTheme;
}
