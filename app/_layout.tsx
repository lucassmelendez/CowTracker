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
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#F7FAFC'
      }}>
        <ActivityIndicator size="large" color="#2E8B57" />
        <Text style={{ 
          marginTop: 16, 
          fontSize: 16,
          color: '#4A5568',
          fontWeight: '500'
        }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack 
        screenOptions={{
          headerShown: false, 
          headerStyle: {
            backgroundColor: '#2E8B57',
          },
          headerTitleStyle: {
            fontWeight: '700',
            color: '#ffffff',
            fontSize: 18,
          },
          headerTintColor: '#ffffff',
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
                headerTitle: () => <CustomHeader title="Detalles del Ganado" />,
                presentation: 'card',
                animation: 'slide_from_right',
              }} 
            />
            <Stack.Screen 
              name="add-cattle" 
              options={{ 
                headerShown: true,
                headerTitle: () => <CustomHeader title="Gestionar Ganado" />,
                presentation: 'card',
                animation: 'slide_from_right',
              }} 
            />
            <Stack.Screen 
              name="profile" 
              options={{ 
                headerShown: true,
                headerTitle: () => <CustomHeader title="Mi Perfil" />,
                presentation: 'card',
                animation: 'slide_from_right',
              }} 
            />
            <Stack.Screen 
              name="farms" 
              options={{ 
                headerShown: true,
                headerTitle: () => <CustomHeader title="Mis Granjas" />,
                presentation: 'card',
                animation: 'slide_from_right',
              }} 
            />
            <Stack.Screen 
              name="sales" 
              options={{ 
                headerShown: true,
                headerTitle: () => <CustomHeader title="Ventas" />,
                presentation: 'card',
                animation: 'slide_from_right',
              }} 
            />
            <Stack.Screen 
              name="report" 
              options={{ 
                headerShown: true,
                headerTitle: () => <CustomHeader title="Informe" />,
                presentation: 'card',
                animation: 'slide_from_right',
              }} 
            />
            <Stack.Screen 
              name="vinculacion" 
              options={{ 
                headerShown: true,
                headerTitle: () => <CustomHeader title="Vincular a Finca" />,
                presentation: 'card',
                animation: 'slide_from_right',
              }} 
            />
          </>
        ) : (
          <>
            <Stack.Screen name="index" redirect={true} />
            <Stack.Screen 
              name="login" 
              options={{ 
                headerShown: false,
                presentation: 'card',
                animation: 'fade',
              }} 
            />
            <Stack.Screen 
              name="register" 
              options={{ 
                headerShown: false,
                presentation: 'card',
                animation: 'slide_from_right',
              }} 
            />
          </>
        )}
      </Stack>
      <StatusBar style="light" backgroundColor="#2E8B57" />
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
