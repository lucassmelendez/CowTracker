import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'expo-router';

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
        title: 'Mi Ganado',
        icon: '🐄',
        route: '/(tabs)/explore',
        description: 'Gestiona todo tu ganado'
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#27ae60',
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  roleText: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
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
    backgroundColor: '#ffffff',
    width: '48%',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  menuDescription: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
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
    color: '#777777',
    textAlign: 'center',
  },
});
