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
      if (!item.farmId) return 'Sin granja asignada';
      
      // Si estamos en modo "granja específica", podemos usar el nombre de la granja seleccionada
      if (selectedFarm && !selectedFarm.isSpecialOption && selectedFarm._id === item.farmId) {
        return selectedFarm.name;
      }
      
      // Si no tenemos el nombre de la granja en los datos del ganado, mostramos el ID
      return item.farmName || `Granja: ${item.farmId}`;
    };

    return (
      <TouchableOpacity 
        style={cattleListStyles.cattleItem}
        onPress={() => router.push({
          pathname: '/(tabs)/cattle-details',
          params: { id: item._id }
        })}
      >
        <View style={cattleListStyles.cattleHeader}>
          <Text style={cattleListStyles.cattleId}>ID: {item.identificationNumber}</Text>
          <View style={[cattleListStyles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={cattleListStyles.statusText}>{formatStatus(item.status)}</Text>
          </View>
        </View>

        <View style={cattleListStyles.cattleBody}>
          <Text style={cattleListStyles.cattleType}>{item.type} - {item.breed}</Text>
          <Text style={cattleListStyles.cattleGender}>{item.gender}</Text>
          <Text style={cattleListStyles.cattleWeight}>{item.weight} kg</Text>
        </View>

        <View style={cattleListStyles.cattleFooter}>
          <View style={[cattleListStyles.healthBadge, { backgroundColor: getHealthStatusColor(item.healthStatus) }]}>
            <Text style={cattleListStyles.healthText}>{formatStatus(item.healthStatus)}</Text>
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