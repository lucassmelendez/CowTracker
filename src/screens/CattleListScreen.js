import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import api from '../services/api';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { cattleListStyles } from '../styles/cattleListStyles';
import { colors } from '../styles/commonStyles';
import { useFarm } from '../components/FarmContext';
import { useAuth } from '../components/AuthContext';
import { fallbackCattleData, generateFallbackCattleForFarm } from '../utils/fallbackData';

const CattleListScreen = () => {
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
          }        } catch (farmsError) {
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
      }      // Si seleccionó una granja específica
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

  const navigateToDetail = (id) => {
    router.push(`/cattle/${id}`);
  };

  const navigateToAdd = () => {
    console.log('Navegando a añadir ganado...');
    router.push('/add-cattle');
  };

  const renderCattleItem = ({ item }) => {
    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case 'activo':
          return colors.primary;
        case 'vendido':
          return colors.secondary;
        case 'fallecido':
          return colors.error;
        default:
          return colors.textLight;
      }
    };

    const getHealthStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case 'saludable':
          return colors.primary;
        case 'enfermo':
          return colors.error;
        case 'en tratamiento':
          return colors.warning;
        case 'en cuarentena':
          return colors.info;
        default:
          return colors.textLight;
      }
    };

    const formatStatus = (status) => {
      if (!status) return 'No disponible';
      return status.charAt(0).toUpperCase() + status.slice(1);
    };

    // Buscar el nombre de la granja si existe
    const getFarmName = () => {
      if (!item.farmId && !item.id_finca) return 'Sin granja asignada';
      
      // Si estamos en modo "granja específica", podemos usar el nombre de la granja seleccionada
      if (selectedFarm && !selectedFarm.isSpecialOption && 
          (selectedFarm._id === item.farmId || selectedFarm._id === item.id_finca)) {
        return selectedFarm.name;
      }
      
      // Si tenemos datos de finca anidados del modelo de Supabase
      if (item.finca && item.finca.nombre) {
        return item.finca.nombre;
      }
      
      // Compatibilidad con el modelo anterior
      return item.farmName || `Granja: ${item.farmId || item.id_finca}`;
    };

    return (
      <TouchableOpacity 
        style={cattleListStyles.cattleItem}
        onPress={() => router.push({
          pathname: '/(tabs)/cattle-details',
          params: { id: item._id || item.id_ganado }
        })}
      >
        <View style={cattleListStyles.cattleHeader}>
          <Text style={cattleListStyles.cattleId}>
            ID: {item.identificationNumber || item.numero_identificacion}
          </Text>
          <View style={[
            cattleListStyles.statusBadge, 
            { backgroundColor: getStatusColor(item.status || (item.estado_salud?.descripcion)) }
          ]}>
            <Text style={cattleListStyles.statusText}>
              {formatStatus(item.status || (item.estado_salud?.descripcion))}
            </Text>
          </View>
        </View>

        <View style={cattleListStyles.cattleBody}>
          <Text style={cattleListStyles.cattleTitle}>{item.nombre || 'Sin nombre'}</Text>
          <Text style={cattleListStyles.cattleType}>
            {item.type || 'Tipo no especificado'} - {item.breed || 'Raza no especificada'}
          </Text>
          <Text style={cattleListStyles.cattleGender}>
            {item.gender || (item.genero?.descripcion) || 'Género no especificado'}
          </Text>
          <Text style={cattleListStyles.cattleWeight}>
            {item.weight || 'Peso no disponible'} {item.weight ? 'kg' : ''}
          </Text>
        </View>

        <View style={cattleListStyles.cattleFooter}>
          <View style={[
            cattleListStyles.healthBadge, 
            { backgroundColor: getHealthStatusColor(item.healthStatus || item.estado_salud?.descripcion) }
          ]}>
            <Text style={cattleListStyles.healthText}>
              {formatStatus(item.healthStatus || (item.estado_salud?.descripcion) || 'No disponible')}
            </Text>
          </View>
          <Text style={cattleListStyles.locationText}>{getFarmName()}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing && !dataLoaded) {
    return (
      <View style={cattleListStyles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
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
    <View style={cattleListStyles.container}>
      <View style={cattleListStyles.header}>
        <View style={cattleListStyles.headerTextContainer}>
          <Text style={cattleListStyles.headerTitle}>
            Total: {cattle.length} {cattle.length === 1 ? 'animal' : 'animales'}
          </Text>
          {farmSubtitle && (
            <Text style={cattleListStyles.headerSubtitle}>
              {farmSubtitle}
            </Text>
          )}
        </View>
        <TouchableOpacity 
          style={cattleListStyles.addButton}
          onPress={navigateToAdd}
        >
          <Text style={cattleListStyles.addButtonText}>+ Añadir</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={cattleListStyles.errorContainer}>
          <Text style={cattleListStyles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={cattleListStyles.retryButton}
            onPress={loadCattle}
          >
            <Text style={cattleListStyles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : cattle.length === 0 ? (
        <View style={cattleListStyles.emptyContainer}>
          <Text style={cattleListStyles.emptyText}>
            {selectedFarm && selectedFarm._id !== 'all-farms' 
              ? `No hay ganado en la granja "${selectedFarm.name}"`
              : 'No tienes ganado registrado'
            }
          </Text>
          <TouchableOpacity
            style={cattleListStyles.emptyButton}
            onPress={navigateToAdd}
          >
            <Text style={cattleListStyles.emptyButtonText}>Añadir ganado</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cattle}
          keyExtractor={(item) => item._id}
          renderItem={renderCattleItem}
          contentContainerStyle={cattleListStyles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        />
      )}
    </View>
  );
};

export default CattleListScreen;