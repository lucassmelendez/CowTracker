import React from 'react';
import { View, StyleSheet } from 'react-native';
import MilkSaleScreen from '../../src/screens/MilkSaleScreen';

export default function MilkSaleTab() {
  return (
    <View style={styles.container}>
      <MilkSaleScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});