import React from 'react';
import { StyleSheet } from 'react-native';
import { AuthProvider } from '../src/components/AuthContext';
import LoginScreen from '../src/screens/LoginScreen';

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginScreen />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 