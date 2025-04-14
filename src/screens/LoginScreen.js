import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useAuth } from '../components/AuthContext';
import { useRouter } from 'expo-router';
import { loginStyles } from '../styles/loginStyles';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  const navigateToRegister = () => {
    console.log('Navegando a registro');
    router.push('/register');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={loginStyles.container}
    >
      <ScrollView contentContainerStyle={loginStyles.scrollView}>
        <View style={loginStyles.logoContainer}>
          <Text style={loginStyles.logoEmoji}>🐄</Text>
          <Text style={loginStyles.title}>AGROCONTROL</Text>
          <Text style={loginStyles.subtitle}>Gestión de ganado y granjas</Text>
        </View>

        <View style={loginStyles.formContainer}>
          <Text style={loginStyles.label}>Email</Text>
          <TextInput
            style={loginStyles.input}
            placeholder="usuario@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={loginStyles.label}>Contraseña</Text>
          <TextInput
            style={loginStyles.input}
            placeholder="********"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error && <Text style={loginStyles.errorText}>{error}</Text>}

          <TouchableOpacity 
            style={loginStyles.loginButton} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={loginStyles.loginButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={loginStyles.registerButton}
            onPress={navigateToRegister}
          >
            <Text style={loginStyles.registerButtonText}>¿No tienes cuenta? Regístrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;