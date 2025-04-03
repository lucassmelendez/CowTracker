import React from 'react';
import { StyleSheet } from 'react-native';
import { AuthProvider } from '../../src/components/AuthContext';
import ProfileScreen from '../../src/screens/ProfileScreen';

export default function ProfilePage() {
  return (
    <AuthProvider>
      <ProfileScreen />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 