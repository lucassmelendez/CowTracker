import { useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import HelpScreen from '../../src/screens/HelpScreen';

export default function Help() {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerTitle: 'Ayuda y Soporte' }} />
      <HelpScreen />
    </View>
  );
} 