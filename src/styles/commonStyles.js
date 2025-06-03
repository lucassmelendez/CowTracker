import { StyleSheet } from 'react-native';
import { getShadowStyle } from '../utils/styles';

// Paleta de colores mejorada para CowTracker
export const colors = {
  // Colores principales
  primary: '#2E8B57',
  primaryLight: '#3CB371',
  primaryDark: '#228B22',
  secondary: '#4A90E2',
  secondaryLight: '#6BB6FF',
  secondaryDark: '#357ABD',
  
  // Colores de acento
  accent: '#FF6B6B',
  accentLight: '#FF8E8E',
  accentDark: '#E55555',
  
  // Colores de estado
  success: '#48BB78',
  successLight: '#68D391',
  warning: '#ED8936',
  warningLight: '#F6AD55',
  error: '#F56565',
  errorLight: '#FC8181',
  info: '#4299E1',
  infoLight: '#63B3ED',
  
  // Colores de superficie
  background: '#F7FAFC',
  backgroundLight: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceLight: '#F8F9FA',
  surfaceElevated: '#FFFFFF',
  
  // Colores de texto
  text: '#1A202C',
  textSecondary: '#4A5568',
  textTertiary: '#718096',
  textLight: '#A0AEC0',
  textInverse: '#FFFFFF',
  
  // Colores de borde
  border: '#E2E8F0',
  borderLight: '#EDF2F7',
  borderDark: '#CBD5E0',
  
  // Colores especiales
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
  
  // Colores de input
  inputBg: '#F7FAFC',
  inputBorder: '#E2E8F0',
  inputFocus: '#4A90E2',
  
  // Gradientes
  gradients: {
    primary: ['#2E8B57', '#3CB371'],
    secondary: ['#4A90E2', '#6BB6FF'],
    accent: ['#FF6B6B', '#FF8E8E'],
    success: ['#48BB78', '#68D391'],
    warm: ['#FF6B6B', '#FFB347'],
    cool: ['#4A90E2', '#63B3ED'],
    sunset: ['#FF6B6B', '#FFB347', '#FFEB3B'],
    ocean: ['#2E8B57', '#4A90E2', '#63B3ED'],
  }
};

// Estilos mejorados para formularios
export const formStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    ...getShadowStyle({ 
      height: 4, 
      elevation: 8, 
      opacity: 0.1, 
      radius: 12 
    }),
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.inputBg,
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    fontSize: 16,
    color: colors.text,
    ...getShadowStyle({ 
      height: 1, 
      elevation: 2, 
      opacity: 0.05, 
      radius: 4 
    }),
  },
  inputFocused: {
    borderColor: colors.inputFocus,
    backgroundColor: colors.white,
    ...getShadowStyle({ 
      height: 2, 
      elevation: 4, 
      opacity: 0.1, 
      radius: 8 
    }),
  },
  button: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    ...getShadowStyle({ 
      height: 3, 
      elevation: 6, 
      opacity: 0.2, 
      radius: 8 
    }),
  },
  buttonPressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  errorText: {
    color: colors.error,
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
});

// Estilos mejorados para tarjetas
export const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...getShadowStyle({ 
      height: 4, 
      elevation: 8, 
      opacity: 0.08, 
      radius: 12 
    }),
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  containerElevated: {
    backgroundColor: colors.surfaceElevated,
    ...getShadowStyle({ 
      height: 6, 
      elevation: 12, 
      opacity: 0.12, 
      radius: 16 
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 22,
  },
  content: {
    marginTop: 8,
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});

// Estilos mejorados para encabezados
export const headerStyles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    lineHeight: 24,
    fontWeight: '400',
  },
  titleWithGradient: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
    // Para gradientes se necesitaría react-native-linear-gradient
  },
});

// Estilos mejorados para listas
export const listStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    ...getShadowStyle({ 
      height: 2, 
      elevation: 4, 
      opacity: 0.06, 
      radius: 8 
    }),
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  itemPressed: {
    backgroundColor: colors.surfaceLight,
    transform: [{ scale: 0.98 }],
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.3,
  },
  itemSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: 16,
  },
});

// Estilos mejorados para botones
export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    ...getShadowStyle({ 
      height: 3, 
      elevation: 6, 
      opacity: 0.2, 
      radius: 8 
    }),
  },
  primaryPressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  secondary: {
    backgroundColor: colors.secondary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    ...getShadowStyle({ 
      height: 3, 
      elevation: 6, 
      opacity: 0.2, 
      radius: 8 
    }),
  },
  secondaryPressed: {
    backgroundColor: colors.secondaryDark,
    transform: [{ scale: 0.98 }],
  },
  outline: {
    backgroundColor: colors.transparent,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  outlinePressed: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.primaryDark,
  },
  text: {
    backgroundColor: colors.transparent,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  textPressed: {
    backgroundColor: colors.surfaceLight,
  },
  // Textos de botones
  primaryText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  secondaryText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  outlineText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  linkText: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  // Variantes de tamaño
  small: {
    height: 40,
    paddingHorizontal: 16,
  },
  large: {
    height: 60,
    paddingHorizontal: 32,
  },
  // Botones con iconos
  withIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
}); 