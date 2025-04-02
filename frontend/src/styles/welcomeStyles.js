import { StyleSheet } from 'react-native';
import { getShadowStyle } from '../utils/styles';
import { colors } from './commonStyles';

export const welcomeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10
  },
  welcomeText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20
  },
  formContainer: {
    ...getShadowStyle(),
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 5
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16
  },
  createButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold'
  }
}); 