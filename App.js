import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/components/AuthContext';
import Navigation from './src/navigation';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar backgroundColor="#27ae60" barStyle="light-content" />
      <Navigation />
    </AuthProvider>
  );
} 