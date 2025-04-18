import { StyleSheet } from 'react-native';

export const productionStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  button: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 14,
    color: '#666',
  },
});