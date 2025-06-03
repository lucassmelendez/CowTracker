import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../components/AuthContext';
import { useRouter } from 'expo-router';
import { homeStyles } from '../styles/homeStyles';

const HomeScreenVeterinario = () => {
  const { userInfo, isVeterinario } = useAuth();
  const router = useRouter();
  const [pressedItem, setPressedItem] = useState(null);

  useEffect(() => {
    console.log('HomeScreenVeterinario montado - Mostrando menús para veterinario');
  }, []);

  const veterinarioMenuItems = [
    {
      id: 'vet',
      title: 'Datos Veterinarios',
      icon: 'medical',
      iconColor: '#4299E1',
      route: '/(tabs)/veterinary-data',
      description: 'Datos veterinarios y medicamentos',
      category: 'main'
    },
    {
      id: 'vincular',
      title: 'Vincular a Finca',
      icon: 'link',
      iconColor: '#48BB78',
      route: '/vinculacion',
      description: 'Vincular con código de finca',
      category: 'main'
    },
    {
      id: 'qr',
      title: 'Escanear QR',
      icon: 'qr-code',
      iconColor: '#ED8936',
      route: '/qr-scanner',
      description: 'Escanear códigos QR',
      category: 'tools'
    },
    {
      id: 'issue',
      title: 'Reportar Problema',
      icon: 'alert-circle',
      iconColor: '#F56565',
      route: '/(tabs)/issue-report',
      description: 'Reportar problemas o sugerencias',
      category: 'support'
    },
    {
      id: 'help',
      title: 'Ayuda',
      icon: 'help-circle',
      iconColor: '#4299E1',
      route: '/(tabs)/help',
      description: 'Ayuda y soporte',
      category: 'support'
    },
  ];

  const navigateTo = (route) => {
    console.log('Navegando a:', route);
    router.push(route);
  };

  const handlePressIn = (itemId) => {
    setPressedItem(itemId);
  };

  const handlePressOut = () => {
    setPressedItem(null);
  };

  const getMenuItemStyle = (item) => {
    const baseStyle = [homeStyles.menuItem];
    
    if (item.category === 'main') {
      baseStyle.push(homeStyles.veterinaryMenuItem);
    }
    
    if (pressedItem === item.id) {
      baseStyle.push(homeStyles.menuItemPressed);
    }
    
    return baseStyle;
  };

  return (
    <View style={homeStyles.container}>
      <View style={homeStyles.header}>
        <View style={homeStyles.welcomeContainer}>
          <Text style={homeStyles.welcomeText}>
            ¡Bienvenido, {userInfo?.primer_nombre || userInfo?.name || 'Veterinario'}!
          </Text>
          <Text style={homeStyles.roleText}>Panel Veterinario</Text>
        </View>
        
        <View style={homeStyles.statsContainer}>
          <View style={homeStyles.statItem}>
            <Text style={homeStyles.statValue}>6</Text>
            <Text style={homeStyles.statLabel}>Consultas</Text>
          </View>
          <View style={homeStyles.statItem}>
            <Text style={homeStyles.statValue}>2</Text>
            <Text style={homeStyles.statLabel}>Granjas</Text>
          </View>
          <View style={homeStyles.statItem}>
            <Text style={homeStyles.statValue}>4</Text>
            <Text style={homeStyles.statLabel}>Tratamientos</Text>
          </View>
        </View>
      </View>
      
      <ScrollView style={homeStyles.menuContainer} showsVerticalScrollIndicator={false}>
        <Text style={homeStyles.menuTitle}>Gestión Veterinaria</Text>
        
        <View style={homeStyles.menuGrid}>
          {veterinarioMenuItems.map((item) => (
            <Pressable
              key={item.id}
              style={getMenuItemStyle(item)}
              onPress={() => navigateTo(item.route)}
              onPressIn={() => handlePressIn(item.id)}
              onPressOut={handlePressOut}
              android_ripple={{ color: 'rgba(66, 153, 225, 0.1)' }}
            >
              <View style={homeStyles.menuItemGradient} />
              
              <View style={homeStyles.menuIconContainer}>
                <Ionicons 
                  name={item.icon} 
                  size={24} 
                  color={item.iconColor}
                  style={homeStyles.menuIcon}
                />
              </View>
              
              <Text style={homeStyles.menuTitle}>{item.title}</Text>
              <Text style={homeStyles.menuDescription}>{item.description}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreenVeterinario;