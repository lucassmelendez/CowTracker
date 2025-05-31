import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../components/AuthContext';
import { useRouter } from 'expo-router';
import { colors } from '../styles/commonStyles';
import { getShadowStyle } from '../utils/styles';
import api from '../services/api';

const VinculacionScreen = () => {
  const { userInfo } = useAuth();
  const router = useRouter();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerificarCodigo = async () => {
    if (!codigo || codigo.trim().length < 6) {
      Alert.alert('Error', 'Por favor ingresa un código válido de 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      console.log("Enviando código para verificación:", codigo.trim().toUpperCase());
      
      const response = await api.post('/vincular/verificar', {
        codigo: codigo.trim().toUpperCase()
      });
      
      console.log("Respuesta completa de verificación:", JSON.stringify(response));

      if (response && response.data && response.data.success) {
        Alert.alert(
          'Vinculación exitosa',
          'Has sido vinculado correctamente a la finca',
          [
            {
              text: 'Continuar',
              onPress: () => {
                router.push('/(tabs)');
              }
            }
          ]
        );
      } else if (response && response.success) {
        Alert.alert(
          'Vinculación exitosa',
          'Has sido vinculado correctamente a la finca',
          [
            {
              text: 'Continuar',
              onPress: () => {
                router.push('/(tabs)');
              }
            }
          ]
        );
      } else {
        console.error("Respuesta inesperada:", response);
        throw new Error(`No se pudo completar la vinculación: ${JSON.stringify(response)}`);
      }
    } catch (error) {
      console.error('Error al verificar código:', error);
      let mensaje = 'No se pudo verificar el código. Inténtalo de nuevo.';
      
      if (error.message && typeof error.message === 'string') {
        if (error.message.includes('inválido') || error.message.includes('expirado')) {
          mensaje = 'El código ingresado es inválido o ha expirado.';
        } else if (error.message.includes('rol')) {
          mensaje = 'Tu rol de usuario no es compatible con este código de vinculación.';
        }
        
        // Añadir detalles adicionales si están disponibles
        if (error.data && error.data.message) {
          mensaje += `\n\nDetalles: ${error.data.message}`;
        }
      }
      
      Alert.alert('Error', mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Vincular a Finca</Text>
        <Text style={styles.subtitle}>
          Ingresa el código de vinculación que te proporcionó el administrador de la finca
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Código de 6 caracteres"
            value={codigo}
            onChangeText={setCodigo}
            autoCapitalize="characters"
            maxLength={6}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleVerificarCodigo}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verificar Código</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.infoText}>
          {userInfo?.role === 'veterinario'
            ? 'Como veterinario, podrás acceder a todas las vacas registradas en esta finca.'
            : 'Como trabajador, podrás acceder a los datos de la finca y su ganado.'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    ...getShadowStyle()
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 30
  },
  inputContainer: {
    marginBottom: 20
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 18,
    letterSpacing: 3,
    textAlign: 'center'
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    minHeight: 50
  },
  disabledButton: {
    backgroundColor: colors.textLight,
    opacity: 0.7
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold'
  },
  infoText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic'
  }
});

export default VinculacionScreen; 