import React from 'react';
import { StyleSheet } from 'react-native';
import { AuthProvider } from '../../src/components/AuthContext';
import SalesScreen from '../../src/screens/SalesScreen';

export default function SalesPage() {
  return (
    <AuthProvider>
      <SalesScreen />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 