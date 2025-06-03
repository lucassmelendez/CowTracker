import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../../src/components/AuthContext';
import { useRouter } from 'expo-router';
import { homeStyles } from '../../src/styles/homeStyles';

export default function TabOneScreen() {
  const { isAdmin, isTrabajador, isVeterinario, userInfo } = useAuth();
  const router = useRouter();

  console.log('=== TabOneScreen DEBUG ===');
  console.log('userInfo completo:', JSON.stringify(userInfo, null, 2));
  console.log('userInfo.id_rol:', userInfo?.id_rol);
  console.log('userInfo.rol:', userInfo?.rol);
  console.log('userInfo.role:', userInfo?.role);
  console.log('userInfo.rol?.nombre_rol:', userInfo?.rol?.nombre_rol);
  console.log('userInfo.rol?.id_rol:', userInfo?.rol?.id_rol);
  console.log('isAdmin():', isAdmin());
  console.log('isTrabajador():', isTrabajador());
  console.log('isVeterinario():', isVeterinario());
  console.log('=== FIN DEBUG ===');

  // Función para extraer el rol del token JWT
  const getRoleFromToken = () => {
    try {
      if (!userInfo?.token) return null;
      
      // Decodificar el JWT (solo la parte del payload)
      const payload = userInfo.token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      
      console.log('🔍 Rol extraído del token JWT:', decodedPayload.user_metadata?.role);
      return decodedPayload.user_metadata?.role;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  };

  // Lógica más robusta para determinar el rol
  const determineRole = () => {
    if (!userInfo) {
      console.log('❌ No hay userInfo');
      return 'admin'; // default
    }

    // NUEVO: Verificar por el rol en el token JWT
    const tokenRole = getRoleFromToken();
    if (tokenRole === 'veterinario') {
      console.log('✅ Detectado veterinario por token JWT');
      return 'veterinario';
    }
    if (tokenRole === 'trabajador') {
      console.log('✅ Detectado trabajador por token JWT');
      return 'trabajador';
    }
    if (tokenRole === 'admin') {
      console.log('✅ Detectado admin por token JWT');
      return 'admin';
    }

    // Verificar por el campo 'role' que está presente en userInfo
    if (userInfo.role === 'veterinario') {
      console.log('✅ Detectado veterinario por userInfo.role === "veterinario"');
      return 'veterinario';
    }
    if (userInfo.role === 'trabajador') {
      console.log('✅ Detectado trabajador por userInfo.role === "trabajador"');
      return 'trabajador';
    }
    if (userInfo.role === 'admin') {
      console.log('✅ Detectado admin por userInfo.role === "admin"');
      return 'admin';
    }

    // Verificar por id_rol directo
    if (userInfo.id_rol === 3) {
      console.log('✅ Detectado veterinario por id_rol === 3');
      return 'veterinario';
    }
    if (userInfo.id_rol === 2) {
      console.log('✅ Detectado trabajador por id_rol === 2');
      return 'trabajador';
    }
    if (userInfo.id_rol === 1) {
      console.log('✅ Detectado admin por id_rol === 1');
      return 'admin';
    }

    // Verificar por nombre_rol en el objeto rol
    if (userInfo.rol?.nombre_rol === 'veterinario') {
      console.log('✅ Detectado veterinario por rol.nombre_rol');
      return 'veterinario';
    }
    if (userInfo.rol?.nombre_rol === 'user' || userInfo.rol?.nombre_rol === 'trabajador') {
      console.log('✅ Detectado trabajador por rol.nombre_rol');
      return 'trabajador';
    }
    if (userInfo.rol?.nombre_rol === 'admin') {
      console.log('✅ Detectado admin por rol.nombre_rol');
      return 'admin';
    }

    // Verificar usando las funciones del contexto
    if (isVeterinario()) {
      console.log('✅ Detectado veterinario por función isVeterinario()');
      return 'veterinario';
    }
    if (isTrabajador()) {
      console.log('✅ Detectado trabajador por función isTrabajador()');
      return 'trabajador';
    }
    if (isAdmin()) {
      console.log('✅ Detectado admin por función isAdmin()');
      return 'admin';
    }

    // Si el role es "user" pero no se detectó como trabajador, podría ser admin por defecto
    if (userInfo.role === 'user') {
      console.log('⚠️ userInfo.role es "user", asumiendo admin por defecto');
      return 'admin';
    }

    console.log('⚠️ No se pudo determinar el rol, usando admin por defecto');
    return 'admin';
  };

  const role = determineRole();

  const navigateTo = (route: any) => {
    console.log('Navegando a:', route);
    router.push(route);
  };

  // Componente HomeScreenAdmin
  const HomeScreenAdmin = () => {
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

    return (
      <View style={homeStyles.container}>
        <View style={homeStyles.header}>
          <Text style={homeStyles.welcomeText}>
            Bienvenido, {userInfo?.primer_nombre || 'Ganadero'}
          </Text>
          <Text style={homeStyles.roleText}>Panel de Administrador</Text>
        </View>
        
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

  // Componente HomeScreenTrabajador
  const HomeScreenTrabajador = () => {
    useEffect(() => {
      console.log('HomeScreenTrabajador montado - Mostrando menús para trabajador');
    }, []);

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
      <View style={homeStyles.container}>
        <View style={homeStyles.header}>
          <Text style={homeStyles.welcomeText}>
            Bienvenido, {userInfo?.primer_nombre || 'Trabajador'}
          </Text>
          <Text style={homeStyles.roleText}>Panel de Trabajador</Text>
        </View>
        
        <ScrollView style={homeStyles.menuContainer}>
          <View style={homeStyles.menuGrid}>
            {trabajadorMenuItems.map((item) => (
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

  // Componente HomeScreenVeterinario
  const HomeScreenVeterinario = () => {
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

    return (
      <View style={homeStyles.container}>
        <View style={homeStyles.header}>
          <Text style={homeStyles.welcomeText}>
            Bienvenido, {userInfo?.primer_nombre || 'Veterinario'}
          </Text>
          <Text style={homeStyles.roleText}>Panel de Veterinario</Text>
        </View>
        
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

  // Función para renderizar el componente correspondiente según el rol
  const renderHomeScreen = () => {
    switch (role) {
      case 'veterinario':
        console.log('🏥 Renderizando HomeScreenVeterinario');
        return <HomeScreenVeterinario />;
      case 'trabajador':
        console.log('👷 Renderizando HomeScreenTrabajador');
        return <HomeScreenTrabajador />;
      case 'admin':
      default:
        console.log('👨‍💼 Renderizando HomeScreenAdmin');
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
});
