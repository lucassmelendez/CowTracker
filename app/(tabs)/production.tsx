import React from 'react';
import { View, StyleSheet } from 'react-native';
import ProductionScreen from '../../src/screens/ProductionScreen';

export default function ProductionTab() {
  return (
    <View style={styles.container}>
      <ProductionScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});