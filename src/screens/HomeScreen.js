import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../components/AuthContext';
import { useRouter } from 'expo-router';
import { homeStyles } from '../styles/homeStyles';

const HomeScreen = () => {
  const { userInfo, isVeterinario } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('HomeScreen montado - Mostrando los menús');
  }, []);

  const allMenuItems = [
    {
      id: 'admin',
      title: 'Administrador',
      icon: '👨‍💼',
      route: '/(tabs)/admin',
      description: 'Gestionar trabajadores y veterinarios',
      roles: ['admin']
    },
    {
      id: 'cattle',
      title: 'Mi Ganado',
      icon: '🐄',
      route: '/(tabs)/explore',
      description: 'Gestiona todo tu ganado',
      roles: ['admin', 'trabajador']
    },
    {
      id: 'informe',
      title: 'Informes',
      icon: '📊',
      route: '/(tabs)/report',
      description: 'Generar informes de ganado',
      roles: ['admin', 'trabajador']
    },
    {
      id: 'vet',
      title: 'Datos veterinarios',
      icon: '💊',
      route: '/(tabs)/veterinary-data',
      description: 'Datos veterinarios y medicamentos',
      roles: ['veterinario']
    },
    {
      id: 'vincular',
      title: 'Vincular a Finca',
      icon: '🔗',
      route: '/vinculacion',
      description: 'Vincular con código de finca',
      roles: ['veterinario']
    },
    {
      id: 'qr',
      title: 'Escanear QR',
      icon: '📷',
      route: '/qr-scanner',
      description: 'Escanear códigos QR',
      roles: ['admin', 'trabajador', 'veterinario']
    },
    {
      id: 'production',
      title: 'Produccion',
      icon: '🥩',
      route: '/(tabs)/production',
      description: 'Gestionar produccion',
      roles: ['admin', 'trabajador']
    },
    {
      id: 'issue',
      title: 'Reportar Problema',
      icon: '🔔',
      route: '/(tabs)/issue-report',
      description: 'Reportar problemas o sugerencias',
      roles: ['admin', 'trabajador', 'veterinario']
    },
    {
      id: 'help',
      title: 'Ayuda',
      icon: '🆘',
      route: '/(tabs)/help',
      description: 'Ayuda y soporte',
      roles: ['admin', 'trabajador', 'veterinario']
    },
  ];

  // Filtrar menú según el rol del usuario
  const menuItems = allMenuItems.filter(item => {
    if (isVeterinario()) {
      return item.roles.includes('veterinario');
    }
    // Aquí puedes agregar más condiciones para otros roles
    return true; // Por defecto mostrar todo
  });

  const navigateTo = (route) => {
    console.log('Navegando a:', route);
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
      </ScrollView>
    </View>
  );
};

export default HomeScreen;