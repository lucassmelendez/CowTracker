/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Paleta de colores mejorada para CowTracker
 * Diseño moderno con gradientes y colores sofisticados
 */

const tintColorLight = '#2E8B57'; // Verde más elegante
const tintColorDark = '#98FB98'; // Verde claro para modo oscuro

export const Colors = {
  light: {
    text: '#1A202C',
    background: '#F7FAFC',
    tint: tintColorLight,
    icon: '#4A5568',
    tabIconDefault: '#718096',
    tabIconSelected: tintColorLight,
    // Nuevos colores para CowTracker
    primary: '#2E8B57',
    primaryLight: '#3CB371',
    primaryDark: '#228B22',
    secondary: '#4A90E2',
    secondaryLight: '#6BB6FF',
    accent: '#FF6B6B',
    accentLight: '#FF8E8E',
    success: '#48BB78',
    warning: '#ED8936',
    error: '#F56565',
    info: '#4299E1',
    surface: '#FFFFFF',
    surfaceLight: '#F8F9FA',
    border: '#E2E8F0',
    borderLight: '#EDF2F7',
    textSecondary: '#718096',
    textTertiary: '#A0AEC0',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  dark: {
    text: '#F7FAFC',
    background: '#1A202C',
    tint: tintColorDark,
    icon: '#A0AEC0',
    tabIconDefault: '#718096',
    tabIconSelected: tintColorDark,
    // Nuevos colores para modo oscuro
    primary: '#68D391',
    primaryLight: '#9AE6B4',
    primaryDark: '#48BB78',
    secondary: '#63B3ED',
    secondaryLight: '#90CDF4',
    accent: '#FC8181',
    accentLight: '#FEB2B2',
    success: '#68D391',
    warning: '#F6AD55',
    error: '#FC8181',
    info: '#63B3ED',
    surface: '#2D3748',
    surfaceLight: '#4A5568',
    border: '#4A5568',
    borderLight: '#718096',
    textSecondary: '#A0AEC0',
    textTertiary: '#718096',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  // Gradientes para efectos visuales
  gradients: {
    primary: ['#2E8B57', '#3CB371'],
    secondary: ['#4A90E2', '#6BB6FF'],
    accent: ['#FF6B6B', '#FF8E8E'],
    success: ['#48BB78', '#68D391'],
    warm: ['#FF6B6B', '#FFB347'],
    cool: ['#4A90E2', '#63B3ED'],
    sunset: ['#FF6B6B', '#FFB347', '#FFEB3B'],
    ocean: ['#2E8B57', '#4A90E2', '#63B3ED'],
  },
};
