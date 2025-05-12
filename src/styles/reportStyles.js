import { StyleSheet } from 'react-native';
import { colors } from './commonStyles';
import { getShadowStyle } from '../utils/styles';

export const reportStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: colors.text
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  reportList: {
    flex: 1,
    marginBottom: 20,
  },
  reportItem: {
    padding: 15,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginBottom: 10,
    ...getShadowStyle(),
  },
  reportName: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  downloadButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    ...getShadowStyle(),
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold'
  },
  problemButton: {
    backgroundColor: '#e74c3c',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
    ...getShadowStyle(),
  },
  problemButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
    ...getShadowStyle(),
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    minHeight: 150,
  },
  sendButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    ...getShadowStyle(),
  },
  sendButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 