import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '../components/AuthContext';
import { FarmProvider } from '../components/FarmContext';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import CustomHeader from '../components/CustomHeader';
import { createStyles, tw } from '../styles/tailwind';
import { Ionicons } from '@expo/vector-icons';
import { registerForPushNotificationsAsync } from '../lib/services/notificationService';

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
    <View style={simpleHeaderStyles.simpleHeaderContainer}>
      <TouchableOpacity 
        style={simpleHeaderStyles.backButton}
        onPress={handleGoBack}
      >
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleTitlePress} style={simpleHeaderStyles.simpleTitleContainer}>
        <Text style={simpleHeaderStyles.simpleHeaderTitle}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
}

function RootLayoutNav() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  
  // Solicitar permisos para notificaciones al iniciar la app
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  // Eliminamos la redirección automática aquí para evitar conflictos
  // El index.tsx se encargará de las redirecciones

  const styles = {
    loadingContainer: createStyles(tw.loadingContainer),
    loadingText: createStyles(tw.loadingText),
    container: createStyles(tw.container),
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tw.colors.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack 
        screenOptions={{
          headerShown: false, 
          headerStyle: {
            backgroundColor: tw.colors.primary,
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#ffffff'
          },
          headerBackVisible: false, // Deshabilitar el botón de navegación nativo
          gestureEnabled: false, // Opcional: deshabilitar gestos de navegación
        }}
      >
        {currentUser ? (
          <>
            <Stack.Screen name="index" redirect={true} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen 
              name="cattle-details" 
              options={{ 
                headerShown: true,
                headerTitle: () => <CustomHeader title="Detalles del Ganado" />,
                headerBackVisible: false,
                gestureEnabled: false,
              }} 
            />

            <Stack.Screen 
              name="profile" 
              options={{ 
                headerShown: true,
                headerTitle: () => <CustomHeader title="Mi Perfil" />,
                headerBackVisible: false,
                gestureEnabled: false,
              }} 
            />

            <Stack.Screen 
              name="farms" 
              options={{ 
                headerShown: true,
                headerTitle: () => <CustomHeader title="Granjas" />,
                headerBackVisible: false,
                gestureEnabled: false,
              }} 
            />
            <Stack.Screen 
              name="sales" 
              options={{ 
                headerShown: true,
                headerTitle: () => <CustomHeader title="Ventas" />,
                headerBackVisible: false,
                gestureEnabled: false,
              }} 
            />
            <Stack.Screen 
              name="report" 
              options={{ 
                headerShown: true,
                headerTitle: () => <CustomHeader title="Informe" />,
                headerBackVisible: false,
                gestureEnabled: false,
              }} 
            />
            <Stack.Screen 
              name="vinculacion" 
              options={{ 
                headerShown: true,
                headerTitle: () => <CustomHeader title="Vincular a Finca" />,
                headerBackVisible: false,
                gestureEnabled: false,
              }} 
            />
          </>
        ) : (
          <>
            <Stack.Screen name="index" redirect={true} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
          </>
        )}
      </Stack>
      <StatusBar style="dark" />
    </View>
  );
}

const simpleHeaderStyles = StyleSheet.create({
  simpleHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  simpleTitleContainer: {
    flex: 1,
  },
  simpleHeaderTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#ffffff',
  },
});

export default function RootLayout() {
  return (
    <AuthProvider>
      <FarmProvider>
        <RootLayoutNav />
      </FarmProvider>
    </AuthProvider>
  );
}
