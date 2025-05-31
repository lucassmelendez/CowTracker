import React from 'react';
import { View, StyleSheet } from 'react-native';
import VinculacionScreen from '../../src/screens/VinculacionScreen';

export default function VinculacionTab() {
  return (
    <View style={styles.container}>
      <VinculacionScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});