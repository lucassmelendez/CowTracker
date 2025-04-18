import React from 'react';
import { View, StyleSheet } from 'react-native';
import CattleSaleScreen from '../../src/screens/CattleSaleScreen';

export default function CattleSaleTab() {
  return (
    <View style={styles.container}>
      <CattleSaleScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});