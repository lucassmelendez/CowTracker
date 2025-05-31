import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CattleListScreen from '../screens/CattleListScreen';
import CattleDetailScreen from '../screens/CattleDetailScreen';
import AddCattleScreen from '../screens/AddCattleScreen';
import SalesScreen from '../screens/SalesScreen';
import FarmsScreen from '../screens/FarmsScreen';
import VinculacionScreen from '../screens/VinculacionScreen';
import AdminScreen from '../screens/AdminScreen';

import { useAuth } from '../components/AuthContext';

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#27ae60',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const AppStack = () => {
  const { hasRole, isAdmin, isVeterinario } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#27ae60',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'GanadoApp' }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Mi Perfil' }}
      />
      {(isVeterinario() || hasRole('user')) && (
        <Stack.Screen 
          name="Vinculacion" 
          component={VinculacionScreen} 
          options={{ title: 'Vincular a Finca' }}
        />
      )}
      {hasRole('user') && (
        <>
          <Stack.Screen 
            name="CattleList" 
            component={CattleListScreen} 
            options={{ title: 'Mi Ganado' }}
          />
          <Stack.Screen 
            name="CattleDetail" 
            component={CattleDetailScreen} 
            options={{ title: 'Detalles del Ganado' }}
          />
          <Stack.Screen 
            name="AddCattle" 
            component={AddCattleScreen} 
            options={{ title: 'Agregar Ganado' }}
          />
          <Stack.Screen 
            name="Sales" 
            component={SalesScreen} 
            options={{ title: 'Ventas' }}
          />
          <Stack.Screen 
            name="Farms" 
            component={FarmsScreen} 
            options={{ title: 'Mis Granjas' }}
          />
        </>
      )}
      {isAdmin() && (
        <Stack.Screen 
          name="Admin" 
          component={AdminScreen} 
          options={{ title: 'Administración' }}
        />
      )}
    </Stack.Navigator>
  );
};

const Navigation = () => {
  const { isLoading, userToken, currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace('/login');
    }
  }, [currentUser, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Navigation;