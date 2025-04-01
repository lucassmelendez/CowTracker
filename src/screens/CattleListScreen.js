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
import { getAllCattle } from '../services';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { cattleListStyles } from '../styles/cattleListStyles';
import { colors } from '../styles/commonStyles';

const CattleListScreen = () => {
  const router = useRouter();
  const [cattle, setCattle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const loadCattle = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCattle();
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
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadCattle();
      return () => {
      };
    }, [])
  );

  const renderCattleItem = ({ item }) => {
    const getStatusColor = (status) => {
      switch (status) {
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
      switch (status) {
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
            <Text style={cattleListStyles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={cattleListStyles.cattleBody}>
          <Text style={cattleListStyles.cattleType}>{item.type} - {item.breed}</Text>
          <Text style={cattleListStyles.cattleGender}>{item.gender}</Text>
          <Text style={cattleListStyles.cattleWeight}>{item.weight} kg</Text>
        </View>

        <View style={cattleListStyles.cattleFooter}>
          <View style={[cattleListStyles.healthBadge, { backgroundColor: getHealthStatusColor(item.healthStatus) }]}>
            <Text style={cattleListStyles.healthText}>{item.healthStatus}</Text>
          </View>
          <Text style={cattleListStyles.locationText}>
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

  if (loading && !refreshing && !dataLoaded) {
    return (
      <View style={cattleListStyles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={cattleListStyles.container}>
      <View style={cattleListStyles.header}>
        <Text style={cattleListStyles.headerTitle}>
          Total: {cattle.length} {cattle.length === 1 ? 'animal' : 'animales'}
        </Text>
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
          <Text style={cattleListStyles.emptyText}>No tienes ganado registrado</Text>
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