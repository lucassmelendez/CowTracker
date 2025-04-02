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
import { getAllCattle } from '../services/firestore';
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

  const loadCattle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userInfo?.uid) {
        setError('No se pudo obtener información del usuario');
        setLoading(false);
        return;
      }
      
      let data;
      if (!selectedFarm || selectedFarm._id === 'all-farms') {
        // Cargar todo el ganado si no hay granja seleccionada o si es "Todas las granjas"
        data = await getAllCattle(userInfo.uid);
      } else if (selectedFarm._id === 'no-farm') {
        // Cargar ganado sin granja asignada
        data = await getAllCattle(userInfo.uid, null, true);
      } else {
        // Cargar ganado específico de la granja seleccionada
        data = await getAllCattle(userInfo.uid, selectedFarm._id);
      }
      
      setCattle(data || []); 
      setDataLoaded(true);
    } catch (error) {
      console.error('Error cargando ganado:', error);
      setError('Error al cargar el ganado: ' + error);
      setCattle([]);
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
  }, [selectedFarm]); // Cargar cuando cambie la granja seleccionada

  useFocusEffect(
    React.useCallback(() => {
      loadCattle();
      return () => {};
    }, [selectedFarm, userInfo])
  );

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
          pathname: '/cattle-detail',
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

  const handleAddCattle = () => {
    console.log('Navegando a agregar ganado');
    router.push('/add-cattle');
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
      if (selectedFarm._id === 'no-farm') {
        return 'Ganado sin granja asignada';
      } else {
        return `Granja: ${selectedFarm.name}`;
      }
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
          onPress={handleAddCattle}
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
              ? (selectedFarm._id === 'no-farm' 
                  ? 'No hay ganado sin granja asignada' 
                  : `No hay ganado en la granja "${selectedFarm.name}"`)
              : 'No tienes ganado registrado'
            }
          </Text>
          <TouchableOpacity
            style={cattleListStyles.emptyButton}
            onPress={handleAddCattle}
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