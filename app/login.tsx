import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../components/AuthContext';

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
            style={[
              styles.loginButton,
              loading && styles.loginButtonDisabled
            ]} 
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f9f9f9',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#27ae60',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  loginButtonDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#ecf0f1',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    borderColor: '#95a5a6',
    borderWidth: 1,
  },
  registerButtonText: {
    color: '#95a5a6',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 14,
  },
});