import { StyleSheet } from 'react-native';
import { getShadowStyle } from '../utils/styles';

export const registerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  headerContainer: {
    marginVertical: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    ...getShadowStyle(),
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f9f9f9',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectorButton: {
    backgroundColor: '#f9f9f9',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
  },
  selectorText: {
    color: '#333',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#27ae60',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 10,
    textAlign: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  loginText: {
    color: '#7f8c8d',
  },
  loginLink: {
    color: '#3498db',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    ...getShadowStyle(),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  roleItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  roleItemSelected: {
    backgroundColor: '#e8f7f0',
  },
  roleItemText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  roleItemTextSelected: {
    fontWeight: 'bold',
    color: '#27ae60',
  },
  cancelButton: {
    marginTop: 15,
    paddingVertical: 15,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
}); 