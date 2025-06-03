import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { useRouter } from 'expo-router';
import { colors } from '../styles/commonStyles';
import { getShadowStyle } from '../utils/styles';

const FarmSelector = ({ onSelectFarm, selectedFarm }) => {
  const { userInfo } = useAuth();
  const router = useRouter();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    console.log('FarmSelector - userInfo actualizado:', 
      userInfo ? `uid: ${userInfo.uid ? 'Sí' : 'No'}, token: ${userInfo.token ? 'Sí' : 'No'}` : 'No hay userInfo');
    
    if (userInfo && userInfo.token) {
      setLoading(true);
      loadFarms();
    } else {
      if (retryCount < 3) {
        const timer = setTimeout(() => {
          console.log(`FarmSelector - Reintentando carga (${retryCount + 1}/3)`);
          setRetryCount(prev => prev + 1);
        }, 1000);
        
        return () => clearTimeout(timer);
      } else if (retryCount === 3) {
        setLoading(false);
        setError('Fallo al cargar granjas');
      }
    }
  }, [userInfo, retryCount]);

  useEffect(() => {
    if (modalVisible && userInfo?.uid) {
      loadFarms();
    }
  }, [modalVisible]);

  const loadFarms = async () => {
    try {
      if (!loading) setLoading(true);
      setError(null);
      
      console.log('FarmSelector - Iniciando carga de granjas para usuario:', userInfo?.uid);
      
      const farmsData = await api.farms.getUserFarms();
      
      console.log('FarmSelector - Granjas recibidas:', farmsData ? farmsData.length : 0);
      
      if (!farmsData || farmsData.length === 0) {
        console.log('FarmSelector - No hay granjas, intentando con getAll');
        const allFarmsData = await api.farms.getAll();
        setFarms(allFarmsData || []);
        
        if (!selectedFarm && allFarmsData && allFarmsData.length > 0) {
          console.log('FarmSelector - Seleccionando granja por defecto:', allFarmsData[0].name);
          onSelectFarm(allFarmsData[0]);
        }
      } else {
        setFarms(farmsData);
        
        if (!selectedFarm && farmsData.length > 0) {
          console.log('FarmSelector - Seleccionando granja por defecto:', farmsData[0].name);
          onSelectFarm(farmsData[0]);
        }
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
          <Ionicons name="business" size={24} color={colors.secondary} />
        </View>
        <View style={styles.farmInfoContainer}>
          <Text style={[
            styles.farmName, 
            isSelected && styles.selectedFarmName
          ]}>
            {item.name}
          </Text>
          {item.location && (
            <Text style={styles.farmLocation}>{item.location}</Text>
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
        activeOpacity={0.8}
      >
        <Ionicons name="business" size={16} color="#ffffff" />
        <Text style={styles.selectorText} numberOfLines={1}>
          {selectedFarm ? selectedFarm.name : 'Seleccionar granja'}
        </Text>
        <Ionicons name="chevron-down" size={14} color="#ffffff" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Granja</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={farms}
              renderItem={renderFarmItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.farmList}
              showsVerticalScrollIndicator={false}
              style={styles.flatList}
            />
            
            <TouchableOpacity 
              style={styles.addFarmButton}
              onPress={handleAddFarm}
              activeOpacity={0.8}
            >
              <Text style={styles.addFarmButtonText}>Añadir nueva granja</Text>
              <Ionicons name="add-circle" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
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
    minWidth: 140,
    maxWidth: 180,
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
    }),
  },
  selectorText: {
    color: '#ffffff',
    marginHorizontal: 6,
    fontSize: 13,
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
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'android' ? 20 : 0,
    ...Platform.select({
      android: {
        elevation: 10,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  flatList: {
    maxHeight: 300,
  },
  farmList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  farmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    ...Platform.select({
      android: {
        elevation: 1,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
    }),
  },
  selectedFarmItem: {
    backgroundColor: '#e8f5e8',
    borderWidth: 2,
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
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
    }),
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
  addFarmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 10,
    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
    }),
  },
  addFarmButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 8,
    fontSize: 15,
  },
});

export default FarmSelector;
