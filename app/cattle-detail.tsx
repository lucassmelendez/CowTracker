import React from 'react';
import { StyleSheet } from 'react-native';
import { AuthProvider } from '../src/components/AuthContext';
import CattleDetailScreen from '../src/screens/CattleDetailScreen';
import { useLocalSearchParams } from 'expo-router';

export default function CattleDetailPage() {
  const { id } = useLocalSearchParams();
  
  return (
    <AuthProvider>
      <CattleDetailScreen route={{ params: { cattleId: id } }} />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 