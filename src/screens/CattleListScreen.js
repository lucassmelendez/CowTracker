import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { getAllCattle } from '../services/api';
import { useRouter } from 'expo-router';

const CattleListScreen = () => {
  const router = useRouter();
  const [cattle, setCattle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadCattle = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCattle();
      setCattle(data);
    } catch (error) {
      setError('Error al cargar el ganado: ' + error);
      Alert.alert('Error', 'No se pudo cargar el listado de ganado');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCattle();
    setRefreshing(false);
  };

  useEffect(() => {
    loadCattle();

    // Actualizar la lista cuando la pantalla vuelve a estar en foco
    const unsubscribe = router.addListener('focus', () => {
      loadCattle();
    });

    return unsubscribe;
  }, [router]);

  const renderCattleItem = ({ item }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'activo':
          return '#27ae60';
        case 'vendido':
          return '#3498db';
        case 'fallecido':
          return '#e74c3c';
        default:
          return '#7f8c8d';
      }
    };

    const getHealthStatusColor = (status) => {
      switch (status) {
        case 'saludable':
          return '#27ae60';
        case 'enfermo':
          return '#e74c3c';
        case 'en tratamiento':
          return '#f39c12';
        case 'en cuarentena':
          return '#9b59b6';
        default:
          return '#7f8c8d';
      }
    };

    return (
      <TouchableOpacity 
        style={styles.cattleItem}
        onPress={() => router.push('/cattle-detail?id=' + item._id)}
      >
        <View style={styles.cattleHeader}>
          <Text style={styles.cattleId}>ID: {item.identificationNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.cattleBody}>
          <Text style={styles.cattleType}>{item.type} - {item.breed}</Text>
          <Text style={styles.cattleGender}>{item.gender}</Text>
          <Text style={styles.cattleWeight}>{item.weight} kg</Text>
        </View>

        <View style={styles.cattleFooter}>
          <View style={[styles.healthBadge, { backgroundColor: getHealthStatusColor(item.healthStatus) }]}>
            <Text style={styles.healthText}>{item.healthStatus}</Text>
          </View>
          <Text style={styles.locationText}>
            {item.location && item.location.farm ? item.location.farm.name : 'Sin granja asignada'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const handleAddCattle = () => {
    console.log('Navegando a agregar ganado');
    router.push('/add-cattle');
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Total: {cattle.length} {cattle.length === 1 ? 'animal' : 'animales'}
        </Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddCattle}
        >
          <Text style={styles.addButtonText}>+ Añadir</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadCattle}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : cattle.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tienes ganado registrado</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={handleAddCattle}
          >
            <Text style={styles.emptyButtonText}>Añadir ganado</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cattle}
          keyExtractor={(item) => item._id}
          renderItem={renderCattleItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#27ae60']} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: 10,
  },
  cattleItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cattleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cattleId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  cattleBody: {
    marginBottom: 10,
  },
  cattleType: {
    fontSize: 15,
    marginBottom: 2,
    color: '#34495e',
  },
  cattleGender: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  cattleWeight: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  cattleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  healthText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  locationText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default CattleListScreen; 