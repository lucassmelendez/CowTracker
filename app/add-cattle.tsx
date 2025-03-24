import React from 'react';
import { StyleSheet } from 'react-native';
import { AuthProvider } from '../src/components/AuthContext';
import AddCattleScreen from '../src/screens/AddCattleScreen';
import { useLocalSearchParams } from 'expo-router';

export default function AddCattlePage() {
  const { id } = useLocalSearchParams();
  
  return (
    <AuthProvider>
      <AddCattleScreen route={{ params: { cattleId: id } }} />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 