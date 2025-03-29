import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, StyleSheet } from 'react-native';
import FarmSelector from '../../src/components/FarmSelector';
import { useFarm } from '../../src/components/FarmContext';

// Custom header component with farm selector
function CustomHeader({ title }: { title: string }) {
  const { selectedFarm, selectFarm } = useFarm();

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
      <FarmSelector 
        selectedFarm={selectedFarm} 
        onSelectFarm={selectFarm} 
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#27ae60',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#ffffff'
        },
        tabBarActiveTintColor: '#27ae60'
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          headerTitle: () => <CustomHeader title="CowTracker" />,
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Mi Ganado',
          headerTitle: () => <CustomHeader title="Mi Ganado" />,
          tabBarIcon: ({ color, size }) => <Ionicons name="list" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#ffffff',
  },
});
