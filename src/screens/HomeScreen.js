import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useAuth } from '../components/AuthContext';
import { useRouter } from 'expo-router';
import { getShadowStyle } from '../utils/styles';

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
      route: '/farms',  //cambiar esta logica cuando se creee el infome
      description: 'Generar infomes de ganado',
    },
    {
      id: 'sales',
      title: 'Ventas',
      icon: '💰',
      route: '/sales',
      description: 'Historial y registro de ventas',
    },
    {
      id: 'qr',
      title: 'Escanear QR',
      icon: '📷',
      route: '/qr-scanner',
      description: 'Escanear códigos QR',
    },
  ];

  const navigateTo = (route) => {
    console.log('Navegando a:', route);
    Alert.alert("Navegación", `Intentando navegar a: ${route}`);
    router.push(route);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.menuContainer}>
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => navigateTo(item.route)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Resumen</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Cabezas de ganado</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Granjas</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>$0</Text>
              <Text style={styles.statLabel}>Ventas totales</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Ventas pendientes</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  menuContainer: {
    flex: 1,
    padding: 15,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  menuItem: {
    backgroundColor: 'white',
    width: '48%',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    ...getShadowStyle(),
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  menuDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    ...getShadowStyle(),
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default HomeScreen;