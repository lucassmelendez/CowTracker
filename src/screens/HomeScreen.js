import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../components/AuthContext';
import { useRouter } from 'expo-router';
import { homeStyles } from '../styles/homeStyles';

const HomeScreen = () => {
  const { userData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('HomeScreen montado - Mostrando los menús');
  }, []);

  const menuItems = [
    {
      id: 'cattle',
      title: 'Mi Ganado',
      icon: '🐄',
      route: '/(tabs)/explore',
      description: 'Gestiona todo tu ganado',
    },
    {
      id: 'informe',
      title: 'Informe',
      icon: '📖',
      route: '/(tabs)/report',
      description: 'Generar infomes de ganado',
    },
    {
      id: 'vet',
      title: 'Datos veterinarios',
      icon: '💊',
      route: '/(tabs)/explore',
      description: 'Datos veterinarios y medicamentos',
    },
    {
      id: 'qr',
      title: 'Escanear QR',
      icon: '📷',
      route: '/qr-scanner',
      description: 'Escanear códigos QR',
    },
    {
      id: 'sales',
      title: 'Ventas',
      icon: '💰',
      route: '/(tabs)/sales',
      description: 'Gestionar ventas',
    },
    {
      id: 'production',
      title: 'Produccion',
      icon: '🥩',
      route: '/(tabs)/production',
      description: 'Gestionar produccion',
    },
  ];

  const navigateTo = (route) => {
    console.log('Navegando a:', route);
    Alert.alert("Navegación", `Intentando navegar a: ${route}`);
    router.push(route);
  };

  return (
    <View style={homeStyles.container}>
      <ScrollView style={homeStyles.menuContainer}>
        <View style={homeStyles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={homeStyles.menuItem}
              onPress={() => navigateTo(item.route)}
            >
              <Text style={homeStyles.menuIcon}>{item.icon}</Text>
              <Text style={homeStyles.menuTitle}>{item.title}</Text>
              <Text style={homeStyles.menuDescription}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={homeStyles.statsContainer}>
          <Text style={homeStyles.statsTitle}>Resumen</Text>
          <View style={homeStyles.statsRow}>
            <View style={homeStyles.statItem}>
              <Text style={homeStyles.statValue}>0</Text>
              <Text style={homeStyles.statLabel}>Cabezas de ganado</Text>
            </View>
            <View style={homeStyles.statItem}>
              <Text style={homeStyles.statValue}>0</Text>
              <Text style={homeStyles.statLabel}>Granjas</Text>
            </View>
          </View>
          <View style={homeStyles.statsRow}>
            <View style={homeStyles.statItem}>
              <Text style={homeStyles.statValue}>$0</Text>
              <Text style={homeStyles.statLabel}>Ventas totales</Text>
            </View>
            <View style={homeStyles.statItem}>
              <Text style={homeStyles.statValue}>0</Text>
              <Text style={homeStyles.statLabel}>Ventas pendientes</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;