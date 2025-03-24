import React from 'react';
import { StyleSheet } from 'react-native';
import { AuthProvider } from '../src/components/AuthContext';
import RegisterScreen from '../src/screens/RegisterScreen';

export default function RegisterPage() {
  return (
    <AuthProvider>
      <RegisterScreen />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 