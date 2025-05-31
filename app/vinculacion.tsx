import React from 'react';
import { Stack } from 'expo-router';
import VinculacionScreen from '../src/screens/VinculacionScreen';
import CustomHeader from '../src/components/CustomHeader';

export default function VinculacionPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <CustomHeader title="Vincular a Finca" />,
        }}
      />
      <VinculacionScreen />
    </>
  );
} 