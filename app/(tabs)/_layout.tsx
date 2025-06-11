import React from 'react';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import FarmSelector from '../../components/FarmSelector';
import { useFarm } from '../../components/FarmContext';
import { useRouter } from 'expo-router';

// Header simple solo con título y botón de volver atrás
function SimpleHeader({ title }: { title: string }) {
  const router = useRouter();

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleTitlePress = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.simpleHeaderContainer}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleGoBack}
      >
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleTitlePress} style={styles.simpleTitleContainer}>
        <Text style={styles.simpleHeaderTitle}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
}

function CustomHeader({ title, showBackButton = false }: { title: string; showBackButton?: boolean }) {
  const { selectedFarm, selectFarm } = useFarm();
  const router = useRouter();

  const handleNavigateToProfile = () => {
    router.push('/(tabs)/profile');
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Si no puede ir atrás, navegar a la página principal
      router.replace('/(tabs)');
    }
  };

  const handleTitlePress = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.headerContainer}>
      {showBackButton && (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={handleTitlePress} style={styles.titleContainer}>
        <Text style={[styles.headerTitle, !showBackButton && styles.headerTitleNoBack]}>{title}</Text>
      </TouchableOpacity>
      
      <View style={styles.headerRightContainer}>
        <FarmSelector 
          selectedFarm={selectedFarm} 
          onSelectFarm={selectFarm} 
        />
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={handleNavigateToProfile}
        >
          <Ionicons name="person" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#27ae60',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#ffffff'
        },
        headerBackVisible: false, // Deshabilitar el botón de navegación nativo
        gestureEnabled: false, // Opcional: deshabilitar gestos de navegación
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => <CustomHeader title="AgroControl" />,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => null, // Oculta el botón de navegación en web
        }}
      />
      <Stack.Screen
        name="explore"
        options={{
          headerTitle: () => <CustomHeader title="Ganado" showBackButton={true} />,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => null, // Oculta el botón de navegación en web
        }}
      />
      <Stack.Screen
        name="admin"
        options={{
          headerTitle: () => <CustomHeader title="Administra tus Granjas" showBackButton={true} />,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => null, // Oculta el botón de navegación en web
        }}
      />
      <Stack.Screen
        name="production"
        options={{
          headerTitle: () => <CustomHeader title="Producción" showBackButton={true} />,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => null, // Oculta el botón de navegación en web
        }}
      />
      <Stack.Screen
        name="veterinary-data"
        options={{
          headerTitle: () => <CustomHeader title="Datos Veterinarios" showBackButton={true} />,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => null, // Oculta el botón de navegación en web
        }}
      />
      <Stack.Screen
        name="report"
        options={{
          headerTitle: () => <CustomHeader title="Informes" showBackButton={true} />,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => null, // Oculta el botón de navegación en web
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerTitle: () => <SimpleHeader title="Perfil" />,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => null, // Oculta el botón de navegación en web
        }}
      />
      <Stack.Screen
        name="farms"
        options={{
          headerTitle: () => <SimpleHeader title="Granjas" />,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => null, // Oculta el botón de navegación en web
        }}
      />
      <Stack.Screen
        name="cattle-details"
        options={{
          headerTitle: () => <SimpleHeader title="Detalles del Ganado" />,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => null, // Oculta el botón de navegación en web
        }}
      />
      <Stack.Screen
        name="add-veterinary-record"
        options={{
          headerTitle: () => <SimpleHeader title="Agregar Registro Veterinario" />,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => null, // Oculta el botón de navegación en web
        }}
      />
      <Stack.Screen
        name="vinculacion"
        options={{
          headerTitle: () => <SimpleHeader title="Vincular a Finca" />,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => null, // Oculta el botón de navegación en web
        }}
      />
      <Stack.Screen
        name="issue-report"
        options={{
          headerTitle: () => <SimpleHeader title="Reportar Problema" />,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => null, // Oculta el botón de navegación en web
        }}
      />
      <Stack.Screen
        name="help"
        options={{
          headerTitle: () => <SimpleHeader title="Ayuda" />,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => null, // Oculta el botón de navegación en web
        }}
      />
      <Stack.Screen
        name="qr-scanner"
        options={{
          headerTitle: () => <SimpleHeader title="Escáner QR" />,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => null, // Oculta el botón de navegación en web
        }}
      />
      <Stack.Screen
        name="add-cattle"
        options={{
          headerTitle: () => <SimpleHeader title="Gestionar Ganado" />,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => null, // Oculta el botón de navegación en web
        }}
      />
      <Stack.Screen
        name="milk-sale"
        options={{
          headerTitle: () => <CustomHeader title="Venta de Leche" showBackButton={true} />,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => null, // Oculta el botón de navegación en web
        }}
      />
      <Stack.Screen
        name="cattle-sale"
        options={{
          headerTitle: () => <CustomHeader title="Venta de Ganado" showBackButton={true} />,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => null, // Oculta el botón de navegación en web
        }}
      />
      <Stack.Screen
        name="sales-list"
        options={{
          headerTitle: () => <CustomHeader title="Lista de Ventas" showBackButton={true} />,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => null, // Oculta el botón de navegación en web
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingRight: 5,
  },
  backButton: {
    padding: 8,
    marginLeft: 5,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#ffffff',
  },
  headerTitleNoBack: {
    marginLeft: 5,
  },
  // Estilos para el header simple
  simpleHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingRight: 5,
  },
  simpleTitleContainer: {
    flex: 1,
  },
  simpleHeaderTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#ffffff',
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  profileButton: {
    marginLeft: 10,
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  profileMenuContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 250,
    marginTop: 60,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  profileHeader: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  menuItemText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 15,
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  logoutText: {
    color: '#e74c3c',
  },
});
