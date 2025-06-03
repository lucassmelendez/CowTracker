import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../components/AuthContext';
import { useRouter } from 'expo-router';
import { homeStyles } from '../styles/homeStyles';

const HomeScreenAdmin = () => {
  const { userInfo, isAdmin } = useAuth();
  const router = useRouter();
  const [pressedItem, setPressedItem] = useState(null);

  useEffect(() => {
    console.log('HomeScreenAdmin montado - Mostrando menús para administrador');
  }, []);

  const adminMenuItems = [
    {
      id: 'admin',
      title: 'Administrador',
      icon: 'people',
      iconColor: '#FF6B6B',
      route: '/(tabs)/admin',
      description: 'Gestionar trabajadores y veterinarios',
      category: 'admin'
    },
    {
      id: 'cattle',
      title: 'Mi Ganado',
      icon: 'paw',
      iconColor: '#2E8B57',
      route: '/(tabs)/explore',
      description: 'Gestiona todo tu ganado',
      category: 'main'
    },
    {
      id: 'informe',
      title: 'Informes',
      icon: 'bar-chart',
      iconColor: '#4A90E2',
      route: '/(tabs)/report',
      description: 'Generar informes de ganado',
      category: 'main'
    },
    {
      id: 'production',
      title: 'Producción',
      icon: 'nutrition',
      iconColor: '#48BB78',
      route: '/(tabs)/production',
      description: 'Gestionar producción',
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
    
    if (item.category === 'admin') {
      baseStyle.push(homeStyles.adminMenuItem);
    }
    
    if (pressedItem === item.id) {
      baseStyle.push(homeStyles.menuItemPressed);
    }
    
    return baseStyle;
  };

  return (
    <View style={homeStyles.container}>
      {/* Header mejorado */}
      <View style={homeStyles.header}>
        <View style={homeStyles.welcomeContainer}>
          <Text style={homeStyles.welcomeText}>
            ¡Bienvenido, {userInfo?.primer_nombre || userInfo?.name || 'Administrador'}!
          </Text>
          <Text style={homeStyles.roleText}>Panel de Administración</Text>
        </View>
        
        {/* Estadísticas rápidas */}
        <View style={homeStyles.statsContainer}>
          <View style={homeStyles.statItem}>
            <Text style={homeStyles.statValue}>12</Text>
            <Text style={homeStyles.statLabel}>Ganado</Text>
          </View>
          <View style={homeStyles.statItem}>
            <Text style={homeStyles.statValue}>3</Text>
            <Text style={homeStyles.statLabel}>Granjas</Text>
          </View>
          <View style={homeStyles.statItem}>
            <Text style={homeStyles.statValue}>5</Text>
            <Text style={homeStyles.statLabel}>Usuarios</Text>
          </View>
        </View>
      </View>

      {/* Contenido principal */}
      <ScrollView style={homeStyles.menuContainer} showsVerticalScrollIndicator={false}>
        <Text style={homeStyles.menuTitle}>Gestión Principal</Text>
        
        <View style={homeStyles.menuGrid}>
          {adminMenuItems.map((item) => (
            <Pressable
              key={item.id}
              style={getMenuItemStyle(item)}
              onPress={() => navigateTo(item.route)}
              onPressIn={() => handlePressIn(item.id)}
              onPressOut={handlePressOut}
              android_ripple={{ color: 'rgba(46, 139, 87, 0.1)' }}
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

export default HomeScreenAdmin;