import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerStyle: {
        backgroundColor: '#27ae60',
      },
      headerTintColor: '#fff',
      tabBarActiveTintColor: '#27ae60'
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Mi Ganado',
          tabBarIcon: ({ color, size }) => <Ionicons name="ios-list" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
