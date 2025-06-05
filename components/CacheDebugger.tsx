import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCacheCleanup } from '../hooks/useCacheCleanup';

interface CacheInfo {
  totalKeys: number;
  userKeys: string[];
  cacheKeys: string[];
  farmKeys: string[];
  otherKeys: string[];
}

const CacheDebugger: React.FC = () => {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const { clearAllUserData, clearSpecificCache } = useCacheCleanup();

  const loadCacheInfo = async () => {
    try {
      setLoading(true);
      const allKeys = await AsyncStorage.getAllKeys();
      
      const userKeys = allKeys.filter(key => 
        key.includes('user_') || key.includes('auth_')
      );
      
      const cacheKeys = allKeys.filter(key => 
        key.includes('cache_')
      );
      
      const farmKeys = allKeys.filter(key => 
        key.includes('farm_') || key.includes('selectedFarm')
      );
      
      const otherKeys = allKeys.filter(key => 
        !key.includes('user_') && 
        !key.includes('auth_') && 
        !key.includes('cache_') && 
        !key.includes('farm_') && 
        !key.includes('selectedFarm')
      );

      setCacheInfo({
        totalKeys: allKeys.length,
        userKeys,
        cacheKeys,
        farmKeys,
        otherKeys
      });
    } catch (error) {
      console.error('Error al cargar información del cache:', error);
      Alert.alert('Error', 'No se pudo cargar la información del cache');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCacheInfo();
  }, []);

  const handleClearAll = () => {
    Alert.alert(
      'Limpiar Todo el Cache',
      '¿Estás seguro de que quieres eliminar todos los datos almacenados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await clearAllUserData();
              await loadCacheInfo();
              Alert.alert('Éxito', 'Cache limpiado completamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo limpiar el cache');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleClearSpecific = (type: string, keys: string[]) => {
    if (keys.length === 0) {
      Alert.alert('Información', `No hay datos de ${type} para limpiar`);
      return;
    }

    Alert.alert(
      `Limpiar ${type}`,
      `¿Quieres eliminar ${keys.length} elementos de ${type}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          onPress: async () => {
            try {
              setLoading(true);
              await AsyncStorage.multiRemove(keys);
              await loadCacheInfo();
              Alert.alert('Éxito', `${type} limpiado`);
            } catch (error) {
              Alert.alert('Error', `No se pudo limpiar ${type}`);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading && !cacheInfo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={styles.loadingText}>Cargando información del cache...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Debug del Cache</Text>
        <TouchableOpacity onPress={loadCacheInfo} disabled={loading}>
          <Ionicons name="refresh" size={24} color="#27ae60" />
        </TouchableOpacity>
      </View>

      {cacheInfo && (
        <>
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              Total de claves almacenadas: {cacheInfo.totalKeys}
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Datos de Usuario ({cacheInfo.userKeys.length})
              </Text>
              <TouchableOpacity
                onPress={() => handleClearSpecific('Datos de Usuario', cacheInfo.userKeys)}
                disabled={loading}
              >
                <Ionicons name="trash" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </View>
            {cacheInfo.userKeys.map((key, index) => (
              <Text key={index} style={styles.keyText}>• {key}</Text>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Cache del Sistema ({cacheInfo.cacheKeys.length})
              </Text>
              <TouchableOpacity
                onPress={() => handleClearSpecific('Cache del Sistema', cacheInfo.cacheKeys)}
                disabled={loading}
              >
                <Ionicons name="trash" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </View>
            {cacheInfo.cacheKeys.slice(0, 5).map((key, index) => (
              <Text key={index} style={styles.keyText}>• {key}</Text>
            ))}
            {cacheInfo.cacheKeys.length > 5 && (
              <Text style={styles.moreText}>... y {cacheInfo.cacheKeys.length - 5} más</Text>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Datos de Granjas ({cacheInfo.farmKeys.length})
              </Text>
              <TouchableOpacity
                onPress={() => handleClearSpecific('Datos de Granjas', cacheInfo.farmKeys)}
                disabled={loading}
              >
                <Ionicons name="trash" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </View>
            {cacheInfo.farmKeys.map((key, index) => (
              <Text key={index} style={styles.keyText}>• {key}</Text>
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Otros Datos ({cacheInfo.otherKeys.length})
              </Text>
              <TouchableOpacity
                onPress={() => handleClearSpecific('Otros Datos', cacheInfo.otherKeys)}
                disabled={loading}
              >
                <Ionicons name="trash" size={20} color="#e74c3c" />
              </TouchableOpacity>
            </View>
            {cacheInfo.otherKeys.slice(0, 3).map((key, index) => (
              <Text key={index} style={styles.keyText}>• {key}</Text>
            ))}
            {cacheInfo.otherKeys.length > 3 && (
              <Text style={styles.moreText}>... y {cacheInfo.otherKeys.length - 3} más</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={handleClearAll}
            disabled={loading}
          >
            <Ionicons name="nuclear" size={20} color="#fff" />
            <Text style={styles.clearAllText}>Limpiar Todo el Cache</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  summary: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27ae60',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  keyText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  moreText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  clearAllButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  clearAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CacheDebugger; 