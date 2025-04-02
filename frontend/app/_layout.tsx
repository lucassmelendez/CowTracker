import React, { useEffect } from 'react';
import { Stack, Redirect, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '../src/components/AuthContext';
import { FarmProvider } from '../src/components/FarmContext';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator } from 'react-native';

function RootLayoutNav() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      
      router.replace('/login');
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
        }}
      >
        {currentUser ? (
          <>
            <Stack.Screen name="index" redirect={true} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="cattle-detail" options={{ title: 'Detalles del Ganado', headerShown: true }} />
            <Stack.Screen name="add-cattle" options={{ title: 'Gestionar Ganado', headerShown: true }} />
            <Stack.Screen name="profile" options={{ title: 'Mi Perfil', headerShown: true }} />
            <Stack.Screen name="farms" options={{ title: 'Mis Granjas', headerShown: true }} />
            <Stack.Screen name="sales" options={{ title: 'Ventas', headerShown: true }} />
            <Stack.Screen name="report" options={{ title: 'Informe', headerShown: true }} />
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
