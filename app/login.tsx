import React from 'react';
import { StyleSheet } from 'react-native';
import LoginScreen from '../src/screens/LoginScreen';

export default function LoginPage() {
  return <LoginScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});