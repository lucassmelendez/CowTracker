import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../src/components/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator } from 'react-native';

function RootLayoutNav() {
  const { isLoading, userToken } = useAuth();

  // Mostrar indicador de carga mientras se verifica la autenticación
  if (isLoading) {
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
          headerStyle: {
            backgroundColor: '#27ae60',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {userToken ? (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="cattle-detail" options={{ title: 'Detalles del Ganado' }} />
            <Stack.Screen name="add-cattle" options={{ title: 'Gestionar Ganado' }} />
            <Stack.Screen name="profile" options={{ title: 'Mi Perfil' }} />
            <Stack.Screen name="farms" options={{ title: 'Mis Granjas' }} />
            <Stack.Screen name="sales" options={{ title: 'Ventas' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
          </>
        )}
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
