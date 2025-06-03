import React, { useEffect } from 'react';
import { Stack, Redirect, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '../src/components/AuthContext';
import { FarmProvider } from '../src/components/FarmContext';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator } from 'react-native';
import CustomHeader from '../src/components/CustomHeader';

function RootLayoutNav() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !currentUser) {
      console.log('No hay usuario activo, redirigiendo a login...');
      try {
        // Usar timeout para evitar problemas con el ciclo de rendering
        setTimeout(() => {
          router.replace('/login');
        }, 100);
      } catch (e) {
        console.error('Error al redirigir a login:', e);
      }
    }
  }, [currentUser, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={{ marginTop: 10 }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack 
        screenOptions={{
          headerShown: false, 
          headerStyle: {
            backgroundColor: '#27ae60',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
            height: 70
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
              name="cattle-detail" 
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
    </>
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
