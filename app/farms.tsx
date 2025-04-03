import React from 'react';
import { View } from 'react-native';
import FarmsScreen from '../src/screens/FarmsScreen';
import CustomHeader from '../src/components/CustomHeader';

export default function FarmsPage() {
  return (
    <View style={{ flex: 1 }}>
      <FarmsScreen />
    </View>
  );
} 