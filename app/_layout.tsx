import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '../components/AuthContext';
import { FarmProvider } from '../components/FarmContext';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator } from 'react-native';
import CustomHeader from '../components/CustomHeader';
import { createStyles, tw } from '../styles/tailwind';

function RootLayoutNav() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  
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
                headerTitle: () => <CustomHeader title="Detalles del Ganado" /> 
              }} 
            />
            <Stack.Screen 
              name="add-cattle" 
              options={{ 
                headerShown: true,
                headerTitle: () => <CustomHeader title="Gestionar Ganado" /> 
              }} 
            />
            <Stack.Screen 
              name="profile" 
              options={{ 
                headerShown: true,
                headerTitle: () => <CustomHeader title="Mi Perfil" /> 
              }} 
            />
            <Stack.Screen 
              name="qr-scanner" 
              options={{ 
                headerShown: true,
                headerTitle: () => <CustomHeader title="Escáner QR" /> 
              }} 
            />
            <Stack.Screen 
              name="farms" 
              options={{ 
                headerShown: true,
                headerTitle: () => <CustomHeader title="Mis Granjas" /> 
              }} 
            />
            <Stack.Screen 
              name="sales" 
              options={{ 
                headerShown: true,
                headerTitle: () => <CustomHeader title="Ventas" /> 
              }} 
            />
            <Stack.Screen 
              name="report" 
              options={{ 
                headerShown: true,
                headerTitle: () => <CustomHeader title="Informe" /> 
              }} 
            />
            <Stack.Screen 
              name="vinculacion" 
              options={{ 
                headerShown: true,
                headerTitle: () => <CustomHeader title="Vincular a Finca" /> 
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

export default function RootLayout() {
  return (
    <AuthProvider>
      <FarmProvider>
        <RootLayoutNav />
      </FarmProvider>
    </AuthProvider>
  );
}
