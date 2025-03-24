import React from 'react';
import { StyleSheet } from 'react-native';
import { AuthProvider } from '../src/components/AuthContext';
import FarmsScreen from '../src/screens/FarmsScreen';

export default function FarmsPage() {
  return (
    <AuthProvider>
      <FarmsScreen />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 