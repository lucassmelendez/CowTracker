import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../components/AuthContext';
import { useFarm } from '../components/FarmContext';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../styles/commonStyles';

const VeterinaryDataScreen = () => {
  const [cattle, setCattle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { selectedFarm } = useFarm();

  useFocusEffect(
    React.useCallback(() => {
      loadCattle();
      return () => {}; // Cleanup function
    }, [selectedFarm])
  );

  const loadCattle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let cattleData = [];
      
      // Si seleccionó la opción "Todas las granjas"
      if (!selectedFarm || selectedFarm?._id === 'all-farms') {
        console.log('Cargando ganado de todas las granjas...');
        
        // Primero obtenemos todas las granjas
        const farmsData = await api.farms.getAll();
        console.log(`Se encontraron ${farmsData.length} granjas`);
        
        // Para cada granja, cargamos su ganado
        const allCattlePromises = farmsData.map(farm => 
          api.farms.getCattle(farm._id)
            .then(cattle => {
              // Añadimos el nombre de la granja a cada animal
              return cattle.map(animal => ({
                ...animal,
                farmName: farm.name
              }));
            })
            .catch(err => {
              console.error(`Error al cargar ganado de granja ${farm.name}:`, err);
              return [];
            })
        );
        
        // Esperamos que todas las promesas se resuelvan
        const allCattleResults = await Promise.all(allCattlePromises);
        
        // Combinamos todos los resultados
        cattleData = allCattleResults.flat();
        console.log(`Cargadas ${cattleData.length} cabezas de ganado (todas las granjas)`);
      }
      // Si seleccionó una granja específica
      else if (selectedFarm?._id) {
        // Cargamos ganado de esa granja específica
        cattleData = await api.farms.getCattle(selectedFarm._id);
        // Añadimos el nombre de la granja a cada animal
        cattleData = cattleData.map(animal => ({
          ...animal,
          farmName: selectedFarm.name
        }));
        console.log(`Cargadas ${cattleData.length} cabezas de ganado (granja: ${selectedFarm.name})`);
      }
      
      setCattle(cattleData);
      setDataLoaded(true);
    } catch (err) {
      console.error('Error cargando ganado:', err);
      setError('Error al cargar el ganado');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCattle();
  };

  const navigateToAddVeterinaryRecord = (cattleId) => {
    router.push(`/add-veterinary-record?id=${cattleId}`);
  };

  const navigateToCattleDetail = (cattleId) => {
    router.push({
      pathname: '/(tabs)/cattle-details',
      params: { id: cattleId }
    });
  };

  const renderCattleItem = ({ item }) => {
    // Función para obtener el nombre de la granja
    const getFarmName = () => {
      if (!item.farmId) return 'Sin granja asignada';
      
      // Si tenemos el nombre de la granja en los datos del ganado, lo mostramos
      if (item.farmName) return item.farmName;
      
      // Si estamos en modo "granja específica", podemos usar el nombre de la granja seleccionada
      if (selectedFarm && !selectedFarm.isSpecialOption && selectedFarm._id === item.farmId) {
        return selectedFarm.name;
      }
      
      return `Granja: ${item.farmId}`;
    };

    return (
      <TouchableOpacity
        style={styles.cattleCard}
        onPress={() => navigateToCattleDetail(item._id)}
      >
        <View style={styles.cattleHeader}>
          <Text style={styles.cattleIdentifier}>
            {item.identificationNumber || 'Sin ID'}
          </Text>
          <Text style={styles.cattleName}>
            {item.name || 'Sin nombre'}
          </Text>
        </View>

        <View style={styles.cattleInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Raza:</Text>
            <Text style={styles.infoValue}>{item.breed || 'No especificada'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Género:</Text>
            <Text style={styles.infoValue}>
              {item.gender ? (item.gender === 'macho' ? 'Macho' : 'Hembra') : 'No especificado'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estado de salud:</Text>
            <Text style={styles.infoValue}>{item.healthStatus || 'No especificado'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Granja:</Text>
            <Text style={styles.infoValue}>{getFarmName()}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addRecordButton}
          onPress={() => navigateToAddVeterinaryRecord(item._id)}
        >
          <Ionicons name="medical" size={16} color="#fff" />
          <Text style={styles.addRecordButtonText}>Agregar registro veterinario</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const getSubtitle = () => {
    if (selectedFarm && selectedFarm._id !== 'all-farms') {
      return `Granja: ${selectedFarm.name}`;
    }
    return "Seleccione un ganado para ver o agregar registros veterinarios";
  };

  if (loading && !refreshing && !dataLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando ganado...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={50} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCattle}>
          <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cattle.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="information-circle" size={50} color={colors.textLight} />
        <Text style={styles.emptyText}>
          {selectedFarm && selectedFarm._id !== 'all-farms' 
            ? `No hay ganado en la granja "${selectedFarm.name}"`
            : 'No tienes ganado registrado'
          }
        </Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/add-cattle')}
        >
          <Text style={styles.addButtonText}>Agregar ganado</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Registros Veterinarios</Text>
        <Text style={styles.subtitle}>
          {getSubtitle()}
        </Text>
      </View>
      
      <FlatList
        data={cattle}
        renderItem={renderCattleItem}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[colors.primary]} 
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  header: {
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 5,
  },
  listContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  addButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cattleCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cattleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cattleIdentifier: {
    fontSize: 14,
    color: colors.textLight,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 10,
  },
  cattleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  cattleInfo: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textLight,
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  addRecordButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
  },
  addRecordButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default VeterinaryDataScreen; 