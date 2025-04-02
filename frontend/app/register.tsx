import React from 'react';
import { StyleSheet } from 'react-native';
import RegisterScreen from '../src/screens/RegisterScreen';

export default function RegisterPage() {
  return <RegisterScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});