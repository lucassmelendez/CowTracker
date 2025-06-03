import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../components/AuthContext';
import { useRouter } from 'expo-router';
import { homeStyles } from '../styles/homeStyles';

const HomeScreenAdmin = () => {
  const { userInfo, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('HomeScreenAdmin montado - Mostrando menús para administrador');
  }, []);

  const adminMenuItems = [
    {
      id: 'admin',
      title: 'Administrador',
      icon: '👨‍💼',
      route: '/(tabs)/admin',
      description: 'Gestionar trabajadores y veterinarios'
    },
    {
      id: 'cattle',
      title: 'Mi Ganado',
      icon: '🐄',
      route: '/(tabs)/explore',
      description: 'Gestiona todo tu ganado'
    },
    {
      id: 'informe',
      title: 'Informes',
      icon: '📊',
      route: '/(tabs)/report',
      description: 'Generar informes de ganado'
    },
    {
      id: 'production',
      title: 'Producción',
      icon: '🥩',
      route: '/(tabs)/production',
      description: 'Gestionar producción'
    },
    {
      id: 'qr',
      title: 'Escanear QR',
      icon: '📷',
      route: '/qr-scanner',
      description: 'Escanear códigos QR'
    },
    {
      id: 'issue',
      title: 'Reportar Problema',
      icon: '🔔',
      route: '/(tabs)/issue-report',
      description: 'Reportar problemas o sugerencias'
    },
    {
      id: 'help',
      title: 'Ayuda',
      icon: '🆘',
      route: '/(tabs)/help',
      description: 'Ayuda y soporte'
    },
  ];

  const navigateTo = (route) => {
    console.log('Navegando a:', route);
    router.push(route);
  };

  return (
    <View style={homeStyles.container}>
      <ScrollView style={homeStyles.menuContainer}>
        <View style={homeStyles.menuGrid}>
          {adminMenuItems.map((item) => (
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

export default HomeScreenAdmin;