import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import CattleListScreen from '../../src/screens/CattleListScreen';

export default function CattleTab() {
  useEffect(() => {
    console.log('Cargando pantalla de lista de ganado en (tabs)/explore.tsx');
  }, []);
  
  return (
    <View style={styles.container}>
      <CattleListScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
