import React from 'react';
import { StyleSheet } from 'react-native';
import { AuthProvider } from '../../src/components/AuthContext';
import CattleListScreen from '../../src/screens/CattleListScreen';

export default function CattleTab() {
  return (
    <AuthProvider>
      <CattleListScreen />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
