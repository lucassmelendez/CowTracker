import { StyleSheet } from 'react-native';
import { getShadowStyle } from '../utils/styles';

// Colores para la aplicación
export const colors = {
  primary: '#27ae60',
  secondary: '#3498db',
  background: '#f5f5f5',
  white: '#ffffff',
  text: '#2c3e50',
  textLight: '#7f8c8d',
  error: '#e74c3c',
  border: '#e0e0e0',
  inputBg: '#f9f9f9',
  success: '#2ecc71',
  warning: '#f39c12',
  info: '#3498db',
};

// Estilos comunes para formularios
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
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    ...getShadowStyle(),
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
  },
  input: {
    backgroundColor: colors.inputBg,
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: colors.error,
    marginBottom: 10,
    textAlign: 'center',
  },
});

// Estilos comunes para tarjetas
export const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    ...getShadowStyle(),
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 10,
  },
});

// Estilos comunes para encabezados
export const headerStyles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
});

// Estilos comunes para listas
export const listStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  itemSubtitle: {
    fontSize: 14,
    color: colors.textLight,
  },
});

// Estilos comunes para botones
export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  secondary: {
    backgroundColor: colors.secondary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  outline: {
    backgroundColor: 'transparent',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    backgroundColor: 'transparent',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  primaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
}); 