import { Redirect } from 'expo-router';

export default function Index() {
  // Redirigir a la pestaña de inicio
  return <Redirect href="/(tabs)" />;
} 