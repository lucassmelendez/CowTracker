import { View } from 'react-native';
import { Stack } from 'expo-router';
import IssueReportScreen from '../../src/screens/IssueReportScreen';

export default function IssueReport() {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerTitle: 'Reportar Problema' }} />
      <IssueReportScreen />
    </View>
  );
} 