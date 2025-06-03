import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../components/AuthContext';
import { useRouter } from 'expo-router';
import { homeStyles } from '../styles/homeStyles';
import CustomHomeHeader from '../components/CustomHomeHeader';

const HomeScreenVeterinario = () => {
  const { userInfo, isVeterinario } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('HomeScreenVeterinario montado - Mostrando menús para veterinario');
  }, []);

  const veterinarioMenuItems = [
    {
      id: 'vet',
      title: 'Datos Veterinarios',
      icon: '💊',
      route: '/(tabs)/veterinary-data',
      description: 'Datos veterinarios y medicamentos'
    },
    {
      id: 'vincular',
      title: 'Vincular a Finca',
      icon: '🔗',
      route: '/vinculacion',
      description: 'Vincular con código de finca'
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
      <CustomHomeHeader 
        title="AgroControl"
        userName={userInfo?.primer_nombre || 'Veterinario'}
        userRole="Panel de Veterinario"
      />
      
      <ScrollView style={homeStyles.menuContainer}>
        <View style={homeStyles.menuGrid}>
          {veterinarioMenuItems.map((item) => (
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

export default HomeScreenVeterinario;