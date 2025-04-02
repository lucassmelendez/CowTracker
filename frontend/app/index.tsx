import { Redirect } from 'expo-router';
import { useAuth } from '../src/components/AuthContext';

export default function Index() {
  const { currentUser } = useAuth();
  
  return currentUser ? <Redirect href="/(tabs)" /> : <Redirect href="/login" />;
}