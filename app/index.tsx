import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../components/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading) {
      console.log('Index: Estado de autenticación:', !!currentUser);
      if (currentUser) {
        console.log('Navegando a tabs desde index...');
        router.replace('/(tabs)');
      } else {
        console.log('Navegando a login desde index...');
        router.replace('/login');
      }
    }
  }, [currentUser, loading, router]);
  
  // Mostrar loading mientras se verifica la autenticación o se navega
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#27ae60" />
    </View>
  );
}