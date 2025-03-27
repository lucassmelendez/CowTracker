import { Redirect } from 'expo-router';
import { useAuth } from '../src/components/AuthContext';

export default function Index() {
  const { currentUser } = useAuth();
  
  // Redirigir según el estado de autenticación
  return currentUser ? <Redirect href="/(tabs)" /> : <Redirect href="/login" />;
}