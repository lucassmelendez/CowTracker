import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import HomeScreen from '../../src/screens/HomeScreen';

export default function TabOneScreen() {
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
