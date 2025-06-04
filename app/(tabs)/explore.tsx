import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  StyleSheet
} from 'react-native';
import api from '../../lib/services/api';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useFarm } from '../../components/FarmContext';
import { useAllFarms, useFarmCattle, useAllCattleWithFarmInfo, useCacheManager } from '../../hooks/useCachedData';

interface CattleItem {
  id_ganado?: string | number;
  _id?: string;
  numero_identificacion?: string;
  identificationNumber?: string;
  nombre?: string;
  id_estado_salud?: number;
  id_produccion?: number;
  id_genero?: number;
  precio_compra?: number;
  nota?: string;
  notes?: string;
  finca?: {
    nombre: string;
  };
  farmName?: string;
  farmId?: string;
  // Campos adicionales para compatibilidad con datos de respaldo
  tipo?: string;
  type?: string;
  raza?: string;
  breed?: string;
  genero?: {
    descripcion: string;
  };
  estado_salud?: {
    descripcion: string;
  };
  produccion?: {
    descripcion: string;
  };
}

export default function CattleTab() {
  const router = useRouter();
  const { selectedFarm } = useFarm();
  const [cattle, setCattle] = useState<CattleItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { invalidateCache } = useCacheManager();

  // Determinar si estamos mostrando todas las granjas o una específica
  const isShowingAllFarms = !selectedFarm || selectedFarm._id === 'all-farms';
  const selectedFarmId = isShowingAllFarms ? null : selectedFarm._id;

  // Hooks con caché
  const { 
    data: allFarms, 
    loading: farmsLoading, 
    error: farmsError,
    refresh: refreshFarms 
  } = useAllFarms();

  const { 
    data: allCattleWithFarmInfo, 
    loading: allCattleLoading, 
    error: allCattleError,
    refresh: refreshAllCattle 
  } = useAllCattleWithFarmInfo();

  const { 
    data: farmCattle, 
    loading: farmCattleLoading, 
    error: farmCattleError,
    refresh: refreshFarmCattle 
  } = useFarmCattle(selectedFarmId);

  // Determinar el estado de carga y datos a mostrar
  const loading = isShowingAllFarms ? (farmsLoading || allCattleLoading) : farmCattleLoading;
  const dataError = isShowingAllFarms ? (farmsError || allCattleError) : farmCattleError;

  // Función para limpiar caché corrupto
  const clearCorruptedCache = async () => {
    console.log('Limpiando caché corrupto...');
    await invalidateCache('cattle');
    // Refrescar después de limpiar
    if (isShowingAllFarms) {
      await refreshAllCattle();
    } else {
      await refreshFarmCattle();
    }
  };

  // Actualizar datos cuando cambia la granja seleccionada
  useEffect(() => {
    console.log('Granja seleccionada:', selectedFarm);
    console.log('Es todas las granjas:', isShowingAllFarms);
    console.log('ID de granja seleccionada:', selectedFarmId);
    
    if (isShowingAllFarms) {
      // Mostrar todo el ganado con información de granja
      console.log('Mostrando todo el ganado:', allCattleWithFarmInfo?.length || 0);
      console.log('Datos de todo el ganado:', allCattleWithFarmInfo);
      setCattle(allCattleWithFarmInfo || []);
    } else {
      // Mostrar ganado de la granja específica
      console.log('Mostrando ganado de granja específica:', farmCattle?.length || 0);
      console.log('Datos del ganado de la granja:', farmCattle);
      
      // Verificar si los datos están en formato incorrecto
      if (farmCattle && typeof farmCattle === 'object' && !Array.isArray(farmCattle)) {
        console.log('¡Datos en formato incorrecto detectados! Limpiando caché...');
        clearCorruptedCache();
        return;
      }
      
      setCattle(farmCattle || []);
    }
  }, [selectedFarm, allCattleWithFarmInfo, farmCattle, isShowingAllFarms, selectedFarmId]);

  // Manejar errores
  useEffect(() => {
    if (dataError) {
      setError(dataError);
      console.error('Error en explore:', dataError);
      // Limpiar error después de 3 segundos
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    } else {
      setError(null);
    }
  }, [dataError]);

  // Refrescar datos cuando la pantalla obtiene foco
  useFocusEffect(
    React.useCallback(() => {
      console.log('Pantalla obtuvo foco, refrescando datos...');
      if (isShowingAllFarms) {
        refreshAllCattle();
        refreshFarms();
      } else {
        refreshFarmCattle();
      }
    }, [selectedFarm, isShowingAllFarms, refreshAllCattle, refreshFarms, refreshFarmCattle])
  );

  const onRefresh = async () => {
    console.log('Refrescando manualmente...');
    if (isShowingAllFarms) {
      await Promise.all([refreshAllCattle(), refreshFarms()]);
    } else {
      await refreshFarmCattle();
    }
  };

  const navigateToDetail = (id: string) => {
    router.push(`/cattle-details?id=${id}`);
  };

  const navigateToAdd = () => {
    router.push('/add-cattle');
  };

  const renderCattleItem = ({ item }: { item: CattleItem }) => {
    // Función auxiliar para obtener el color del estado de salud
    const getStatusColor = (status: number) => {
      switch (status) {
        case 1: return '#27ae60'; // Saludable
        case 2: return '#f39c12'; // En tratamiento
        case 3: return '#e74c3c'; // Enfermo
        case 4: return '#95a5a6'; // Muerto
        default: return '#bdc3c7';
      }
    };

    // Función auxiliar para formatear el estado de salud
    const formatStatus = (status: number) => {
      switch (status) {
        case 1: return 'Saludable';
        case 2: return 'En tratamiento';
        case 3: return 'Enfermo';
        case 4: return 'Muerto';
        default: return 'Desconocido';
      }
    };

    // Función auxiliar para formatear el tipo de producción
    const formatProduccion = (id_produccion: number) => {
      switch (id_produccion) {
        case 1: return 'Leche';
        case 2: return 'Carne';
        case 3: return 'Mixto';
        default: return 'No especificado';
      }
    };

    // Función auxiliar para formatear el género
    const formatGenero = (id_genero: number) => {
      switch (id_genero) {
        case 1: return 'Macho';
        case 2: return 'Hembra';
        default: return 'No especificado';
      }
    };

    // Obtener ID del animal
    const animalId = item.id_ganado || item._id;
    
    // Obtener nombre del animal
    const animalName = item.nombre || item.identificationNumber || item.numero_identificacion || `Animal ${animalId}`;
    
    // Obtener nombre de la granja
    const farmName = item.finca?.nombre || item.farmName || 'Granja no especificada';
    
    // Obtener estado de salud
    const healthStatus = item.id_estado_salud || 1;
    const healthStatusText = item.estado_salud?.descripcion || formatStatus(healthStatus);
    
    // Obtener tipo de producción
    const productionType = item.id_produccion || 1;
    const productionText = item.produccion?.descripcion || formatProduccion(productionType);
    
    // Obtener género
    const gender = item.id_genero || 1;
    const genderText = item.genero?.descripcion || formatGenero(gender);

    return (
      <TouchableOpacity 
        style={styles.cattleItem}
        onPress={() => navigateToDetail(animalId?.toString() || '')}
      >
        <View style={styles.cattleHeader}>
          <Text style={styles.cattleName}>{animalName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(healthStatus) }]}>
            <Text style={styles.statusText}>{healthStatusText}</Text>
          </View>
        </View>
        
        <View style={styles.cattleDetails}>
          <Text style={styles.detailText}>Granja: {farmName}</Text>
          <Text style={styles.detailText}>Producción: {productionText}</Text>
          <Text style={styles.detailText}>Género: {genderText}</Text>
          {item.nota && (
            <Text style={styles.notesText} numberOfLines={2}>
              Notas: {item.nota}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getSubtitle = () => {
    if (isShowingAllFarms) {
      return `Mostrando ganado de todas las granjas (${cattle.length} animales)`;
    } else {
      return `Granja: ${selectedFarm?.name || 'Sin seleccionar'} (${cattle.length} animales)`;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={styles.loadingText}>Cargando ganado...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ganado</Text>
        <Text style={styles.subtitle}>{getSubtitle()}</Text>
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>

      <FlatList
        data={cattle}
        renderItem={renderCattleItem}
        keyExtractor={(item) => (item.id_ganado || item._id)?.toString() || Math.random().toString()}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={['#27ae60']}
          />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isShowingAllFarms 
                ? 'No hay ganado registrado en ninguna granja' 
                : `No hay ganado en la granja "${selectedFarm?.name || 'seleccionada'}"`
              }
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={navigateToAdd}>
              <Text style={styles.addButtonText}>Agregar Ganado</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={navigateToAdd}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 5,
  },
  debugText: {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
    fontStyle: 'italic',
  },
  listContainer: {
    padding: 15,
  },
  cattleItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cattleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cattleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cattleDetails: {
    gap: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  notesText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  debugButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
