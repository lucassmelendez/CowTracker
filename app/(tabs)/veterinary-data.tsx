import React from 'react';
import { View, StyleSheet } from 'react-native';
import VeterinaryDataScreen from '../../src/screens/VeterinaryDataScreen';

export default function VeterinaryDataPage() {
  return (
    <View style={styles.container}>
      <VeterinaryDataScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 