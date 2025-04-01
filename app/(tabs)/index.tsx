import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import HomeScreen from '../../src/screens/HomeScreen';

export default function TabOneScreen() {
  useEffect(() => {
    console.log('Cargando pantalla de inicio en (tabs)/index.tsx');
  }, []);

  return (
    <View style={styles.container}>
      <HomeScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
