import React from 'react';
import { Stack } from 'expo-router';
import CustomHeader from '../../src/components/CustomHeader.js';

export default function TabLayout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#27ae60',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#ffffff'
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => <CustomHeader title="AgroControl" />,
        }}
      />
      <Stack.Screen
        name="explore"
        options={{
          headerTitle: () => <CustomHeader title="Mi Ganado" />,
        }}
      />
      <Stack.Screen
        name="admin"
        options={{
          headerTitle: () => <CustomHeader title="Administración" />,
        }}
      />
      <Stack.Screen
        name="production"
        options={{
          headerTitle: () => <CustomHeader title="Producción" />,
        }}
      />
      <Stack.Screen
        name="veterinary-data"
        options={{
          headerTitle: () => <CustomHeader title="Datos Veterinarios" />,
        }}
      />
      <Stack.Screen
        name="report"
        options={{
          headerTitle: () => <CustomHeader title="Informes" />,
        }}
      />
      <Stack.Screen
        name="sales"
        options={{
          headerTitle: () => <CustomHeader title="Ventas" />,
        }}
      />
    </Stack>
  );
}
