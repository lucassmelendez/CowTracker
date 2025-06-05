import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../components/AuthContext';
import { createStyles, tw } from '../styles/tailwind';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setLocalError('Por favor complete todos los campos');
      return;
    }

    if (!validateEmail(email)) {
      setLocalError('Por favor ingrese un email válido');
      return;
    }

    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLocalError('');
    
    try {
      await login(email, password);
      // La navegación se maneja automáticamente en _layout.tsx
    } catch (error: any) {
      console.error('Error en login:', error);
      setLocalError(error.message || 'Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    }
  };

  const navigateToRegister = () => {
    router.push('/register');
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (localError || error) {
      setLocalError('');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (localError || error) {
      setLocalError('');
    }
  };

  const styles = {
    container: createStyles(tw.container),
    scrollView: createStyles(tw.scrollContainer),
    logoContainer: createStyles(tw.logoContainer),
    logoEmoji: createStyles(tw.logoEmoji),
    title: createStyles(tw.title),
    subtitle: createStyles(tw.subtitle),
    formContainer: createStyles(tw.formContainer),
    label: createStyles(tw.label),
    input: createStyles(tw.input),
    loginButton: createStyles(tw.primaryButton),
    loginButtonDisabled: createStyles(`${tw.primaryButton} ${tw.primaryButtonDisabled}`),
    loginButtonText: createStyles(tw.primaryButtonText),
    registerButton: createStyles(tw.secondaryButton),
    registerButtonText: createStyles(tw.secondaryButtonText),
    errorText: createStyles(tw.errorText),
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🐄</Text>
          <Text style={styles.title}>Agro Control</Text>
          <Text style={styles.subtitle}>Gestión Inteligente de Ganado</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su email"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese su contraseña"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={handleLogin}
            returnKeyType="done"
          />

          {(localError || error) && (
            <Text style={styles.errorText}>{localError || error}</Text>
          )}

          <TouchableOpacity 
            style={loading ? styles.loginButtonDisabled : styles.loginButton} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={navigateToRegister}
          >
            <Text style={styles.registerButtonText}>Crear Cuenta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}