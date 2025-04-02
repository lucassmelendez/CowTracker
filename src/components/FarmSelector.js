import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  ActivityIndicator,
  Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { useRouter } from 'expo-router';
import { colors } from '../styles/commonStyles';
import { getShadowStyle } from '../utils/styles';

const ALL_FARMS_OPTION = {
  _id: 'all-farms',
  name: 'Todas las granjas',
  isSpecialOption: true
};

const FarmSelector = ({ onSelectFarm, selectedFarm }) => {
  const { userInfo } = useAuth();
  const router = useRouter();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userInfo?.uid) {
      loadFarms();
    }
  }, [userInfo]);

  useEffect(() => {
    if (modalVisible && userInfo?.uid) {
      loadFarms();
    }
  }, [modalVisible]);

  const loadFarms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const farmsData = await api.farms.getAll();
      
      const farmsWithOptions = [
        ALL_FARMS_OPTION,
        ...farmsData || []
      ];
      
      setFarms(farmsWithOptions);
      
      if (!selectedFarm && farmsWithOptions.length > 0) {
        onSelectFarm(farmsWithOptions[0]);
      }
    } catch (err) {
      console.error('Error loading farms:', err);
      setError('No se pudieron cargar las granjas');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFarm = (farm) => {
    onSelectFarm(farm);
    setModalVisible(false);
  };

  const handleAddFarm = () => {
    setModalVisible(false);
    router.push('/farms');
  };

  const renderFarmItem = ({ item }) => {
    const isSelected = selectedFarm && selectedFarm._id === item._id;
    
    return (
      <TouchableOpacity 
        style={[
          styles.farmItem,
          isSelected && styles.selectedFarmItem
        ]} 
        onPress={() => handleSelectFarm(item)}
      >
        <View style={styles.farmIconContainer}>
          {item.isSpecialOption ? (
            item._id === 'all-farms' ? (
              <Ionicons name="apps" size={24} color={colors.primary} />
            ) : (
              <Ionicons name="business" size={24} color={colors.secondary} />
            )
          ) : (
            <Ionicons name="business" size={24} color={colors.secondary} />
          )}
        </View>
        <View style={styles.farmInfoContainer}>
          <Text style={[
            styles.farmName, 
            isSelected && styles.selectedFarmName
          ]}>
            {item.name}
          </Text>
          {item.location && !item.isSpecialOption && (
            <Text style={styles.farmLocation}>{item.location}</Text>
          )}
          {item.isSpecialOption && item._id === 'all-farms' && (
            <Text style={styles.farmDescription}>Mostrar todo el ganado</Text>
          )}
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#ffffff" />
      </View>
    );
  }

  if (error) {
    return (
      <TouchableOpacity style={styles.selectorButton} onPress={loadFarms}>
        <Ionicons name="alert-circle" size={18} color="#ffffff" />
        <Text style={styles.errorText}>Error</Text>
        <Ionicons name="refresh" size={16} color="#ffffff" />
      </TouchableOpacity>
    );
  }

  if (farms.length === 0) {
    return (
      <TouchableOpacity 
        style={styles.selectorButton}
        onPress={handleAddFarm}
      >
        <Ionicons name="add-circle" size={18} color="#ffffff" />
        <Text style={styles.selectorText}>Añadir granja</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons 
          name={selectedFarm?.isSpecialOption ? 
            (selectedFarm._id === 'all-farms' ? 'apps' : 'business') : 
            'business'
          } 
          size={18} 
          color="#ffffff" 
        />
        <Text style={styles.selectorText} numberOfLines={1}>
          {selectedFarm ? selectedFarm.name : 'Seleccionar granja'}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#ffffff" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Granja</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={farms}
              renderItem={renderFarmItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.farmList}
              showsVerticalScrollIndicator={false}
            />
            
            <TouchableOpacity 
              style={styles.addFarmButton}
              onPress={handleAddFarm}
            >
              <Text style={styles.addFarmButtonText}>Añadir nueva granja</Text>
              <Ionicons name="add-circle" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    marginLeft: 10,
    padding: 5,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 180,
    maxWidth: 220,
    ...getShadowStyle({ height: 1, elevation: 3, opacity: 0.2, radius: 2 }),
  },
  selectorText: {
    color: '#ffffff',
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  errorText: {
    color: '#ffffff',
    marginHorizontal: 5,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '85%',
    maxHeight: '70%',
    padding: 20,
    ...getShadowStyle({ height: 5, elevation: 5, opacity: 0.25, radius: 10 }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  farmList: {
    flexGrow: 1,
  },
  farmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  selectedFarmItem: {
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  farmIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    ...getShadowStyle({ height: 1, elevation: 2, opacity: 0.15, radius: 2 }),
  },
  farmInfoContainer: {
    flex: 1,
  },
  farmName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  selectedFarmName: {
    color: colors.primary,
  },
  farmLocation: {
    fontSize: 14,
    color: colors.textLight,
  },
  farmDescription: {
    fontSize: 13,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  addFarmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 15,
    ...getShadowStyle({ height: 2, elevation: 3, opacity: 0.2, radius: 4 }),
  },
  addFarmButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 8,
    fontSize: 15,
  },
});

export default FarmSelector;
