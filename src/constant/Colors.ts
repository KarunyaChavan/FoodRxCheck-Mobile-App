/**
 * @file Centralizes the app color tokens used by shared UI components.
 * Configured for light and dark modes following strict design specifications.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    primary: '#0a7ea4',
    border: '#ddd',
    cardBackground: '#fff',
    error: '#d9534f',
    shadow: '#000',
    textSecondary: '#555',
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    primary: '#0a7ea4',
    border: '#333',
    cardBackground: '#1e1e1e',
    error: '#ff6b6b',
    shadow: '#000',
    textSecondary: '#aaa',
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};
export type ColorTheme = typeof import('./Colors').default.light;
