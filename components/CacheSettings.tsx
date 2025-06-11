import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCacheManager } from '../hooks/useCachedData';
import { useCustomModal } from './CustomModal';

interface CacheStatsDisplay {
  memorySize: number;
  totalKeys: number;
}

const CacheSettings: React.FC = () => {
  const [stats, setStats] = useState<CacheStatsDisplay>({ memorySize: 0, totalKeys: 0 });
  const [loading, setLoading] = useState(false);
  const { clearAllCache, invalidateCache, cleanupExpiredCache, getCacheStats } = useCacheManager();
  const { showSuccess, showError, showConfirm, ModalComponent } = useCustomModal();

  useEffect(() => {
    updateStats();
  }, []);

  const updateStats = () => {
    const currentStats = getCacheStats();
    setStats(currentStats);
  };

  const handleClearAllCache = () => {
    showConfirm(
      'Limpiar Todo el Caché',
      '¿Estás seguro de que quieres eliminar todos los datos del caché? Esto hará que la aplicación vuelva a cargar todos los datos desde el servidor.',
      async () => {
        setLoading(true);
        try {
          await clearAllCache();
          updateStats();
          showSuccess('Éxito', 'Caché limpiado completamente');
        } catch (error) {
          showError('Error', 'No se pudo limpiar el caché');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleInvalidateSpecific = (pattern: string, description: string) => {
    showConfirm(
      `Limpiar ${description}`,
      `¿Quieres eliminar los datos de ${description.toLowerCase()} del caché?`,
      async () => {
        setLoading(true);
        try {
          await invalidateCache(pattern);
          updateStats();
          showSuccess('Éxito', `Caché de ${description.toLowerCase()} limpiado`);
        } catch (error) {
          showError('Error', `No se pudo limpiar el caché de ${description.toLowerCase()}`);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  const handleCleanupExpired = async () => {
    setLoading(true);
    try {
      await cleanupExpiredCache();
      updateStats();
      showSuccess('Éxito', 'Elementos expirados eliminados del caché');
    } catch (error) {
      showError('Error', 'No se pudieron eliminar los elementos expirados');
    } finally {
      setLoading(false);
    }
  };

  const cacheActions = [
    {
      title: 'Granjas',
      description: 'Limpiar datos de granjas',
      pattern: 'farms',
      icon: 'business' as const,
      color: '#27ae60',
    },
    {
      title: 'Ganado',
      description: 'Limpiar datos de ganado',
      pattern: 'cattle',
      icon: 'paw' as const,
      color: '#3498db',
    },
    {
      title: 'Usuarios',
      description: 'Limpiar datos de usuarios',
      pattern: 'users',
      icon: 'people' as const,
      color: '#9b59b6',
    },
    {
      title: 'Registros Médicos',
      description: 'Limpiar registros médicos',
      pattern: 'medical',
      icon: 'medical' as const,
      color: '#e74c3c',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestión de Caché</Text>
        <Text style={styles.subtitle}>
          Administra los datos almacenados localmente para mejorar el rendimiento
        </Text>
      </View>

      {/* Estadísticas del Caché */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estadísticas</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="layers" size={24} color="#3498db" />
            <View style={styles.statText}>
              <Text style={styles.statValue}>{stats.memorySize}</Text>
              <Text style={styles.statLabel}>Elementos en memoria</Text>
            </View>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="key" size={24} color="#27ae60" />
            <View style={styles.statText}>
              <Text style={styles.statValue}>{stats.totalKeys}</Text>
              <Text style={styles.statLabel}>Claves totales</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={updateStats}>
          <Ionicons name="refresh" size={16} color="#666" />
          <Text style={styles.refreshText}>Actualizar estadísticas</Text>
        </TouchableOpacity>
      </View>

      {/* Acciones Específicas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Limpiar por Categoría</Text>
        <Text style={styles.sectionDescription}>
          Limpia datos específicos del caché para forzar una actualización desde el servidor
        </Text>
        {cacheActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionItem}
            onPress={() => handleInvalidateSpecific(action.pattern, action.title)}
            disabled={loading}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
              <Ionicons name={action.icon} size={20} color="#fff" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Acciones Generales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mantenimiento</Text>
        
        <TouchableOpacity
          style={[styles.maintenanceButton, styles.cleanupButton]}
          onPress={handleCleanupExpired}
          disabled={loading}
        >
          <Ionicons name="trash" size={20} color="#f39c12" />
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonTitle, { color: '#f39c12' }]}>
              Limpiar Expirados
            </Text>
            <Text style={styles.buttonDescription}>
              Elimina solo los elementos que han expirado
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.maintenanceButton, styles.clearAllButton]}
          onPress={handleClearAllCache}
          disabled={loading}
        >
          <Ionicons name="nuclear" size={20} color="#e74c3c" />
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonTitle, { color: '#e74c3c' }]}>
              Limpiar Todo
            </Text>
            <Text style={styles.buttonDescription}>
              Elimina completamente todos los datos del caché
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Información */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            • El caché mejora el rendimiento almacenando datos localmente
          </Text>
          <Text style={styles.infoText}>
            • Los datos se actualizan automáticamente cuando expiran
          </Text>
          <Text style={styles.infoText}>
            • Limpiar el caché fuerza la recarga desde el servidor
          </Text>
          <Text style={styles.infoText}>
            • Los datos se mantienen entre sesiones de la aplicación
          </Text>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#27ae60" />
          <Text style={styles.loadingText}>Procesando...</Text>
        </View>
      )}
      <ModalComponent />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  statText: {
    marginLeft: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  refreshText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
  },
  maintenanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  cleanupButton: {
    backgroundColor: '#fff8f0',
    borderColor: '#f39c12',
  },
  clearAllButton: {
    backgroundColor: '#fdf2f2',
    borderColor: '#e74c3c',
  },
  buttonContent: {
    marginLeft: 15,
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  buttonDescription: {
    fontSize: 14,
    color: '#666',
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default CacheSettings; 