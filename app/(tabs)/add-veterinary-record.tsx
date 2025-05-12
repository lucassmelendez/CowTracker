import React from 'react';
import { View, StyleSheet } from 'react-native';
import AddVeterinaryRecordScreen from '../../src/screens/AddVeterinaryRecordScreen';
import { useLocalSearchParams } from 'expo-router';

export default function AddVeterinaryRecordPage() {
  const params = useLocalSearchParams();
  const cattleId = params?.id;
  
  return (
    <View style={styles.container}>
      <AddVeterinaryRecordScreen cattleId={cattleId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 