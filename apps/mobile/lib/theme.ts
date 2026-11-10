import { useColorScheme } from 'react-native';

// The web app's shadcn zinc theme, as hex.
const light = {
  background: '#ffffff',
  foreground: '#09090b',
  card: '#ffffff',
  muted: '#f4f4f5',
  mutedForeground: '#71717a',
  border: '#e4e4e7',
  primary: '#18181b',
  primaryForeground: '#fafafa',
  destructive: '#dc2626',
  success: '#16a34a',
} as const;

const dark = {
  background: '#09090b',
  foreground: '#fafafa',
  card: '#18181b',
  muted: '#27272a',
  mutedForeground: '#a1a1aa',
  border: '#27272a',
  primary: '#e4e4e7',
  primaryForeground: '#18181b',
  destructive: '#f87171',
  success: '#4ade80',
} as const;

export type Theme = { [K in keyof typeof light]: string };

export const radius = 10;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}
