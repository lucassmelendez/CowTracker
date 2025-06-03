import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet
} from 'react-native';
import api from '../../src/services/api';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useFarm } from '../../src/components/FarmContext';
import { useAuth } from '../../src/components/AuthContext';
import { fallbackCattleData, generateFallbackCattleForFarm } from '../../src/utils/fallbackData';

export default function CattleTab() {
  const router = useRouter();
  const { selectedFarm } = useFarm();
  const { userInfo } = useAuth();
  const [cattle, setCattle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

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
        
        try {
          // Primero obtenemos todas las granjas
          const farmsData = await api.farms.getAll();
          
          if (!farmsData || !Array.isArray(farmsData) || farmsData.length === 0) {
            console.warn('No se encontraron granjas disponibles');
            setCattle([]);
            return;
          }
          
          console.log(`Se encontraron ${farmsData.length} granjas`);
          
          // Para cada granja, cargamos su ganado
          const allCattlePromises = farmsData.map(farm => {
            // Verificar que la granja tenga un ID
            const farmId = farm?._id || farm?.id_finca;
            if (!farmId) {
              console.warn('Granja sin ID detectada:', farm);
              return Promise.resolve([]);
            }
            
            return api.farms.getCattle(farmId)
              .then(response => {
                // Manejar diferentes formatos de respuesta
                let cattleItems = [];
                
                if (Array.isArray(response)) {
                  cattleItems = response;
                } else if (response && Array.isArray(response.data)) {
                  cattleItems = response.data;
                } else if (response && typeof response === 'object') {
                  // Intentar extraer datos si es un objeto
                  const possibleArrays = ['data', 'cattle', 'items', 'results'];
                  for (const key of possibleArrays) {
                    if (response[key] && Array.isArray(response[key])) {
                      cattleItems = response[key];
                      break;
                    }
                  }
                }
                
                // Si no hay elementos o no se pudo extraer un array, devolver array vacío
                if (!cattleItems || !Array.isArray(cattleItems)) {
                  console.warn(`No se encontraron datos de ganado para la granja ${farm.name || farm.nombre || farmId}`);
                  return [];
                }
                
                // Añadir nombre de la granja a cada animal
                return cattleItems.map(animal => {
                  if (!animal) return null;
                  
                  // Si el animal ya tiene información de la finca anidada, no es necesario añadirla
                  if (animal.finca && animal.finca.nombre) {
                    return animal;
                  }
                  
                  // Si no tiene la información anidada, la añadimos
                  return {
                    ...animal,
                    farmName: farm.name || farm.nombre || `Granja ${farmId}`,
                    farmId: farmId
                  };
                }).filter(animal => animal !== null); // Eliminar elementos nulos
              })
              .catch(err => {
                console.error(`Error al cargar ganado de granja ${farm.name || farm.nombre || farmId}:`, err);
                return [];
              });
          });

          try {
            // Esperamos que todas las promesas se resuelvan
            const allCattleResults = await Promise.all(allCattlePromises);
            
            // Combinamos todos los resultados
            cattleData = allCattleResults.flat();
            
            // Filtrar datos no válidos
            cattleData = cattleData.filter(animal => animal !== null && typeof animal === 'object');
            
            // Si no obtuvimos resultados, usar datos de respaldo
            if (cattleData.length === 0) {
              console.warn('No se obtuvieron datos de ganado para ninguna granja, usando datos de respaldo');
              cattleData = [];
              
              // Generar datos de respaldo para cada granja
              farmsData.forEach((farm, index) => {
                const farmId = farm?._id || farm?.id_finca || `farm-${index}`;
                const farmName = farm?.name || farm?.nombre || `Granja ${index+1}`;
                
                // Generar algunos datos para cada granja
                const farmCattle = generateFallbackCattleForFarm(farmId, farmName, 3);
                cattleData = [...cattleData, ...farmCattle];
              });
              
              // Mostrar mensaje temporal
              setError('Mostrando datos locales para todas las granjas');
              setTimeout(() => setError(null), 3000);
            }
            
            console.log(`Cargadas ${cattleData.length} cabezas de ganado (todas las granjas)`);
          } catch (promiseError) {
            console.error('Error al procesar promesas de ganado:', promiseError);
            setError('Mostrando datos locales debido a un error de conexión');
            
            // Generar datos de respaldo para cada granja
            cattleData = [];
            farmsData.forEach((farm, index) => {
              const farmId = farm?._id || farm?.id_finca || `farm-${index}`;
              const farmName = farm?.name || farm?.nombre || `Granja ${index+1}`;
              
              // Generar algunos datos para cada granja
              const farmCattle = generateFallbackCattleForFarm(farmId, farmName, 3);
              cattleData = [...cattleData, ...farmCattle];
            });
          }
        } catch (farmsError) {
          console.error('Error al obtener la lista de granjas:', farmsError);
          setError('Mostrando datos locales - No se pudo cargar la lista de granjas');
          
          // Crear algunas granjas de respaldo
          const backupFarms = [
            { _id: 'fallback-farm-1', name: 'Granja Local 1' },
            { _id: 'fallback-farm-2', name: 'Granja Local 2' }
          ];
          
          // Generar datos de respaldo para estas granjas
          cattleData = [];
          backupFarms.forEach(farm => {
            const farmCattle = generateFallbackCattleForFarm(farm._id, farm.name, 4);
            cattleData = [...cattleData, ...farmCattle];
          });
        }
      }
      // Si seleccionó una granja específica
      else if (selectedFarm?._id) {
        try {
          console.log(`Cargando ganado para la granja: ${selectedFarm.name || selectedFarm._id}`);
          
          // Cargamos ganado de esa granja específica
          const response = await api.farms.getCattle(selectedFarm._id);
          
          // Manejar diferentes formatos de respuesta
          let receivedData = [];
          let usedFallbackData = false;
          
          if (Array.isArray(response)) {
            receivedData = response;
          } else if (response && Array.isArray(response.data)) {
            receivedData = response.data;
          } else if (response && typeof response === 'object') {
            // Intentar extraer datos si es un objeto
            const possibleArrays = ['data', 'cattle', 'items', 'results'];
            for (const key of possibleArrays) {
              if (response[key] && Array.isArray(response[key])) {
                receivedData = response[key];
                break;
              }
            }
          }
          
          // Si no hay datos o el array está vacío, usar datos de respaldo
          if (!receivedData || !Array.isArray(receivedData) || receivedData.length === 0) {
            console.warn(`No se pudieron obtener datos reales para la granja ${selectedFarm._id}, usando datos de respaldo`);
            receivedData = generateFallbackCattleForFarm(
              selectedFarm._id, 
              selectedFarm.name || selectedFarm.nombre || `Granja ${selectedFarm._id}`,
              5
            );
            usedFallbackData = true;
            // Mostrar mensaje temporal
            setError(`Mostrando datos locales para "${selectedFarm.name}"`);
            setTimeout(() => setError(null), 3000);
          }
          
          // Filtrar elementos nulos o no válidos
          receivedData = receivedData.filter(item => item !== null && typeof item === 'object');
          
          // Añadimos el nombre de la granja a cada animal (solo si es necesario)
          cattleData = receivedData.map(animal => {
            // Si el animal ya tiene información de la finca anidada, no es necesario añadirla
            if (animal.finca && animal.finca.nombre) {
              return animal;
            }
            // Si no tiene la información anidada, la añadimos
            return {
              ...animal,
              farmName: selectedFarm.name || selectedFarm.nombre || `Granja ${selectedFarm._id}`,
              farmId: selectedFarm._id 
            };
          });
          
          console.log(`Cargadas ${cattleData.length} cabezas de ganado (granja: ${selectedFarm.name || selectedFarm.nombre || selectedFarm._id})${usedFallbackData ? ' - DATOS LOCALES' : ''}`);
        } catch (farmCattleError) {
          console.error(`Error al cargar ganado para la granja ${selectedFarm._id}:`, farmCattleError);
          // Usar datos de respaldo en caso de error
          setError(`Mostrando datos locales debido a un error de conexión`);
          cattleData = generateFallbackCattleForFarm(
            selectedFarm._id, 
            selectedFarm.name || selectedFarm.nombre || `Granja ${selectedFarm._id}`,
            5
          );
        }
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

  const navigateToDetail = (id: string) => {
    router.push(`/cattle/${id}`);
  };

  const navigateToAdd = () => {
    console.log('Navegando a añadir ganado...');
    router.push('/add-cattle');
  };

  const renderCattleItem = ({ item }: { item: any }) => {
    // Función auxiliar para obtener el color del estado de salud
    const getStatusColor = (status: number) => {
      switch (status) {
        case 1: // Saludable
          return '#4CAF50';
        case 2: // Enfermo
          return '#f44336';
        case 3: // En tratamiento
          return '#FF9800';
        default:
          return '#9E9E9E';
      }
    };

    // Función auxiliar para formatear el estado de salud
    const formatStatus = (status: number) => {
      switch (status) {
        case 1:
          return 'Saludable';
        case 2:
          return 'Enfermo';
        case 3:
          return 'En tratamiento';
        default:
          return 'Desconocido';
      }
    };

    // Función auxiliar para formatear el tipo de producción
    const formatProduccion = (id_produccion: number) => {
      switch (id_produccion) {
        case 1:
          return 'Producción de Leche';
        case 2:
          return 'Producción de Carne';
        default:
          return 'Tipo no especificado';
      }
    };

    // Función auxiliar para formatear el género
    const formatGenero = (id_genero: number) => {
      switch (id_genero) {
        case 1:
          return 'Macho';
        case 2:
          return 'Hembra';
        default:
          return 'No especificado';
      }
    };

    return (
      <TouchableOpacity 
        style={styles.cattleItem}
        onPress={() => router.push({
          pathname: '/(tabs)/cattle-details',
          params: { id: item.id_ganado }
        })}
      >
        <View style={styles.cattleHeader}>
          <Text style={styles.cattleId}>
            ID: {item.numero_identificacion || 'No disponible'}
          </Text>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(item.id_estado_salud) }
          ]}>
            <Text style={styles.statusText}>
              {formatStatus(item.id_estado_salud)}
            </Text>
          </View>
        </View>

        <View style={styles.cattleBody}>
          <Text style={styles.cattleTitle}>{item.nombre || 'Sin nombre'}</Text>
          <Text style={styles.cattleType}>
            {formatProduccion(item.id_produccion)}
          </Text>
          <Text style={styles.cattleGender}>
            {formatGenero(item.id_genero)}
          </Text>
          {item.precio_compra && (
            <Text style={styles.cattlePrice}>
              Precio: ${item.precio_compra}
            </Text>
          )}
          {item.nota && (
            <Text style={styles.cattleNotes} numberOfLines={2}>
              Nota: {item.nota}
            </Text>
          )}
        </View>

        <View style={styles.farmInfo}>
          <Text style={styles.farmName}>
            Granja: {item.finca?.nombre || 'No asignada'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing && !dataLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  const getSubtitle = () => {
    if (selectedFarm && selectedFarm._id !== 'all-farms') {
      return `Granja: ${selectedFarm.name}`;
    }
    return null;
  };

  const farmSubtitle = getSubtitle();

  return (
    <View style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>
              Total: {cattle.length} {cattle.length === 1 ? 'animal' : 'animales'}
            </Text>
            {farmSubtitle && (
              <Text style={styles.headerSubtitle}>
                {farmSubtitle}
              </Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={navigateToAdd}
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
            <Text style={styles.emptyText}>
              {selectedFarm && selectedFarm._id !== 'all-farms' 
                ? `No hay ganado en la granja "${selectedFarm.name}"`
                : 'No tienes ganado registrado'
              }
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={navigateToAdd}
            >
              <Text style={styles.emptyButtonText}>Añadir ganado</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={cattle}
            keyExtractor={(item, index) => {
              // Intentar diferentes campos de ID que podrían existir
              return item.id_ganado?.toString() || 
                     item._id?.toString() || 
                     item.id?.toString() || 
                     item.numero_identificacion?.toString() || 
                     `cattle-${index}`;
            }}
            renderItem={renderCattleItem}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#27ae60"]} />
            }
          />
        )}
      </View>
    </View>
  );
}

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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#777777',
    marginTop: 2,
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  list: {
    padding: 10,
  },
  cattleItem: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 10,
    padding: 15,
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
    color: '#333333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  cattleBody: {
    marginBottom: 10,
  },
  cattleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 3,
  },
  cattleType: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 3,
  },
  cattleGender: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 3,
  },
  cattleWeight: {
    fontSize: 14,
    color: '#777777',
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
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  locationText: {
    fontSize: 12,
    color: '#777777',
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#777777',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  farmInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  farmName: {
    fontSize: 14,
    color: '#777777',
    fontStyle: 'italic',
  },
  cattlePrice: {
    fontSize: 14,
    color: '#777777',
  },
  cattleNotes: {
    fontSize: 14,
    color: '#777777',
  },
});
