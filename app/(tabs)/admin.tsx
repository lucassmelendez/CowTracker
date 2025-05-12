import { View } from 'react-native';
import { Stack } from 'expo-router';
import AdminScreen from '../../src/screens/AdminScreen';

export default function Admin() {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerTitle: 'Administración' }} />
      <AdminScreen />
    </View>
  );
} 