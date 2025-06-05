import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'expo-router';
import { createStyles, tw } from '../../styles/tailwind';

export default function TabOneScreen() {
  const { isAdmin, isTrabajador, isVeterinario, userInfo } = useAuth();
  const router = useRouter();

  const getRoleFromToken = () => {
    try {
      if (!userInfo?.token) return null;

      const payload = userInfo.token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      
      return decodedPayload.user_metadata?.role;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  };

  const determineRole = () => {
    if (!userInfo) {
      return 'trabajador';
    }

    const tokenRole = getRoleFromToken();
    if (tokenRole === 'veterinario') {
      return 'veterinario';
    }
    if (tokenRole === 'trabajador') {
      return 'trabajador';
    }
    if (tokenRole === 'admin') {
      return 'admin';
    }

    if (userInfo.rol?.nombre_rol === 'veterinario') {
      return 'veterinario';
    }
    if (userInfo.rol?.nombre_rol === 'trabajador' || userInfo.rol?.nombre_rol === 'user') {
      return 'trabajador';
    }
    if (userInfo.rol?.nombre_rol === 'admin') {
      return 'admin';
    }

    if (userInfo.id_rol === 3) {
      return 'veterinario';
    }
    if (userInfo.id_rol === 2) {
      return 'trabajador';
    }
    if (userInfo.id_rol === 1) {
      return 'admin';
    }

    // Verificar usando las funciones del contexto
    if (isVeterinario()) {
      return 'veterinario';
    }
    if (isTrabajador()) {
      return 'trabajador';
    }
    if (isAdmin()) {
      return 'admin';
    }

    if (userInfo.rol?.nombre_rol === 'user') {
      return 'trabajador';
    }

    return 'admin';
  };

  const role = determineRole();

  const navigateTo = (route: any) => {
    router.push(route);
  };

  const styles = {
    container: createStyles(tw.container),
    header: createStyles(`${tw.header} p-5 pt-10 items-center`),
    welcomeText: createStyles('text-xl font-bold text-white mb-1'),
    roleText: createStyles('text-sm text-white opacity-90'),
    menuContainer: createStyles('flex-1 p-4'),
    menuGrid: createStyles('flex-row flex-wrap justify-between mb-5'),
    menuItem: createStyles('bg-white w-48% p-5 rounded-lg mb-4 items-center shadow-sm'),
    menuIcon: createStyles('text-3xl mb-2'),
    menuTitle: createStyles('text-lg font-bold text-gray-800 mb-1'),
    menuDescription: createStyles('text-xs text-gray-600 text-center'),
    statsContainer: createStyles('bg-white rounded-lg p-4 mb-5 shadow-sm'),
    statsTitle: createStyles('text-lg font-bold text-gray-800 mb-4'),
    statsRow: createStyles('flex-row justify-between mb-4'),
    statItem: createStyles('w-48% bg-gray-50 p-4 rounded-lg items-center'),
    statValue: createStyles('text-xl font-bold text-green-600 mb-1'),
    statLabel: createStyles('text-xs text-gray-600 text-center'),
  };

  // Componente HomeScreenAdmin
  const HomeScreenAdmin = () => {
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
        id: 'vet',
        title: 'Datos Veterinarios',
        icon: '💊',
        route: '/(tabs)/veterinary-data',
        description: 'Datos veterinarios y medicamentos'
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
        route: '/(tabs)/qr-scanner',
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

    return (
      <View style={styles.container}>     
        <ScrollView style={styles.menuContainer}>
          <View style={styles.menuGrid}>
            {adminMenuItems.map((item) => (
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
        </ScrollView>
      </View>
    );
  };

  // Componente HomeScreenTrabajador
  const HomeScreenTrabajador = () => {
    const trabajadorMenuItems = [
      {
        id: 'cattle',
        title: 'Ganado',
        icon: '🐄',
        route: '/(tabs)/explore',
        description: 'Gestiona todo el ganado'
      },
      {
        id: 'production',
        title: 'Producción',
        icon: '🥩',
        route: '/(tabs)/production',
        description: 'Gestionar producción'
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
        route: '/(tabs)/qr-scanner',
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

    return (
      <View style={styles.container}>      
        <ScrollView style={styles.menuContainer}>
          <View style={styles.menuGrid}>
            {trabajadorMenuItems.map((item) => (
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
        </ScrollView>
      </View>
    );
  };

  // Componente HomeScreenVeterinario
  const HomeScreenVeterinario = () => {
    const veterinarioMenuItems = [
      {
        id: 'cattle',
        title: 'Ganado',
        icon: '🐄',
        route: '/(tabs)/explore',
        description: 'Gestiona todo el ganado'
      },
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
        route: '/(tabs)/qr-scanner',
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

    return (
      <View style={styles.container}>       
        <ScrollView style={styles.menuContainer}>
          <View style={styles.menuGrid}>
            {veterinarioMenuItems.map((item) => (
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
        </ScrollView>
      </View>
    );
  };

  // Función para renderizar el componente correspondiente según el rol
  const renderHomeScreen = () => {
    switch (role) {
      case 'veterinario':
        return <HomeScreenVeterinario />;
      case 'trabajador':
        return <HomeScreenTrabajador />;
      case 'admin':
      default:
        return <HomeScreenAdmin />;
    }
  };

  return (
    <View style={styles.container}>
      {renderHomeScreen()}
    </View>
  );
}
