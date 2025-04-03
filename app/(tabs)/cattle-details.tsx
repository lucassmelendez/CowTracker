import React from 'react';
import { View, StyleSheet } from 'react-native';
import CattleDetailScreen from '../../src/screens/CattleDetailScreen';
import { useLocalSearchParams } from 'expo-router';

export default function CattleDetailPage() {
  const params = useLocalSearchParams();
  console.log('Parámetros recibidos:', params);
  
  return (
    <View style={styles.container}>
      <CattleDetailScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 