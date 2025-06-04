import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../lib/config/api';

export default function VinculacionTab() {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [fincasVinculadas, setFincasVinculadas] = useState<any[]>([]);
  const [loadingFincas, setLoadingFincas] = useState(true);

  useEffect(() => {
    cargarFincasVinculadas();
  }, []);

  const cargarFincasVinculadas = async () => {
    try {
      setLoadingFincas(true);
      const response = await api.farms.getAll();
      const fincasData = Array.isArray(response) ? response : [];
      setFincasVinculadas(fincasData);
    } catch (error) {
      console.error('Error al cargar fincas vinculadas:', error);
      Alert.alert('Error', 'No se pudieron cargar las fincas vinculadas');
    } finally {
      setLoadingFincas(false);
    }
  };

  const handleVerificarCodigo = async () => {
    if (!codigo || codigo.trim().length < 6) {
      Alert.alert('Error', 'Por favor ingresa un código válido de 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/vincular/verificar', {
        codigo: codigo.trim().toUpperCase()
      });
      
      if (response && (response.data?.success || (response as any).success)) {
        Alert.alert(
          'Vinculación exitosa',
          'Has sido vinculado correctamente a la finca',
          [
            {
              text: 'Continuar',
              onPress: () => {
                cargarFincasVinculadas(); // Recargar la lista de fincas
                setCodigo(''); // Limpiar el código
              }
            }
          ]
        );
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error: any) {
      console.error('Error al verificar código:', error);
      let mensaje = 'No se pudo verificar el código. Inténtalo de nuevo.';
      
      if (error?.message && typeof error.message === 'string') {
        if (error.message.includes('inválido') || error.message.includes('expirado')) {
          mensaje = 'El código ingresado es inválido o ha expirado.';
        } else if (error.message.includes('rol')) {
          mensaje = 'Tu rol de usuario no es compatible con este código de vinculación.';
        }
        
        if (error?.data && error.data.message) {
          mensaje += `\n\nDetalles: ${error.data.message}`;
        }
      }
      
      Alert.alert('Error', mensaje);
    } finally {
      setLoading(false);
    }
  };

  const renderFinca = ({ item }: { item: any }) => (
    <View style={styles.fincaCard}>
      <View style={styles.fincaInfo}>
        <Ionicons name="business" size={24} color="#27ae60" />
        <View style={styles.fincaTexts}>
          <Text style={styles.fincaName}>{item.name}</Text>
          <Text style={styles.fincaLocation}>{item.location || 'Ubicación no especificada'}</Text>
        </View>
      </View>
      <View style={styles.fincaStatus}>
        <Ionicons name="checkmark-circle" size={24} color="#2ecc71" />
        <Text style={styles.statusText}>Vinculada</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
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
            Como veterinario, podrás acceder a todas las vacas registradas en esta finca.
          </Text>
        </View>

        <View style={[styles.card, styles.fincasCard]}>
          <Text style={styles.sectionTitle}>Fincas Vinculadas</Text>
          
          {loadingFincas ? (
            <ActivityIndicator size="large" color="#27ae60" style={styles.loadingFincas} />
          ) : fincasVinculadas.length > 0 ? (
            <FlatList
              data={fincasVinculadas}
              renderItem={renderFinca}
              keyExtractor={(item) => item._id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="information-circle" size={50} color="#777777" />
              <Text style={styles.emptyText}>No tienes fincas vinculadas</Text>
              <Text style={styles.emptySubtext}>
                Ingresa un código de vinculación para comenzar a trabajar con una finca
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  fincasCard: {
    padding: 15
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15
  },
  inputContainer: {
    marginBottom: 20
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 18,
    letterSpacing: 3,
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    minHeight: 50
  },
  disabledButton: {
    backgroundColor: '#7f8c8d',
    opacity: 0.7
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  infoText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  fincaCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  fincaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  fincaTexts: {
    marginLeft: 10,
    flex: 1
  },
  fincaName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50'
  },
  fincaLocation: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2
  },
  fincaStatus: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusText: {
    marginLeft: 5,
    color: '#2ecc71',
    fontSize: 14
  },
  loadingFincas: {
    marginVertical: 20
  },
  emptyState: {
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginTop: 10
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 5
  }
});