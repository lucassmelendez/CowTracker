import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  ActivityIndicator,
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { useRouter } from 'expo-router';
import { colors } from '../styles/commonStyles';
import { getShadowStyle } from '../utils/styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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

  const renderFarmItem = ({ item, index }) => {
    const isSelected = selectedFarm && selectedFarm._id === item._id;
    
    return (
      <TouchableOpacity 
        style={[
          styles.farmItem,
          isSelected && styles.selectedFarmItem
        ]} 
        onPress={() => handleSelectFarm(item)}
        activeOpacity={0.8}
      >
        <View style={[
          styles.farmIconContainer,
          isSelected && styles.selectedFarmIconContainer
        ]}>
          <Ionicons 
            name="home" 
            size={24} 
            color={isSelected ? colors.primary : colors.secondary} 
          />
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
          {item.size && (
            <Text style={styles.farmSize}>{item.size} hectáreas</Text>
          )}
        </View>
        
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
          </View>
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
        <Ionicons name="add" size={18} color="#ffffff" />
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
        <Ionicons name="home" size={16} color="#ffffff" />
        <Text style={styles.selectorText} numberOfLines={1}>
          {selectedFarm ? selectedFarm.name : 'Seleccionar granja'}
        </Text>
        <Ionicons name="chevron-down" size={14} color="#ffffff" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
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
            {/* Header del modal */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTop}>
                <View style={styles.iconContainer}>
                  <Ionicons name="home" size={32} color={colors.primary} />
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalTitle}>Seleccionar Granja</Text>
              <Text style={styles.modalSubtitle}>
                Elige la granja con la que quieres trabajar
              </Text>
            </View>
            
            {/* Cuerpo del modal */}
            <View style={styles.modalBody}>
              {farms.length > 0 ? (
                <FlatList
                  data={farms}
                  renderItem={renderFarmItem}
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={styles.farmList}
                  showsVerticalScrollIndicator={false}
                  style={styles.flatList}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="home-outline" size={64} color={colors.textTertiary} />
                  <Text style={styles.emptyStateTitle}>No hay granjas</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Añade tu primera granja para comenzar
                  </Text>
                </View>
              )}
              
              {/* Botón para añadir granja */}
              <TouchableOpacity 
                style={styles.addFarmButton}
                onPress={handleAddFarm}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addFarmButtonText}>Añadir nueva granja</Text>
              </TouchableOpacity>
            </View>
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
    borderRadius: 12,
    minWidth: 140,
    maxWidth: 180,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...getShadowStyle({ 
      height: 2, 
      elevation: 4, 
      opacity: 0.2, 
      radius: 4 
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    width: screenWidth - 40,
    maxWidth: 400,
    height: Math.min(screenHeight * 0.7, 600),
    overflow: 'hidden',
    ...getShadowStyle({ 
      height: 8, 
      elevation: 16, 
      opacity: 0.3, 
      radius: 20 
    }),
  },
  modalHeader: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.borderLight,
    ...getShadowStyle({ 
      height: 2, 
      elevation: 4, 
      opacity: 0.1, 
      radius: 8 
    }),
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  flatList: {
    flex: 1,
    marginBottom: 16,
  },
  farmList: {
    paddingBottom: 8,
  },
  farmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    borderWidth: 2,
    borderColor: colors.borderLight,
    marginBottom: 10,
    ...getShadowStyle({ 
      height: 2, 
      elevation: 4, 
      opacity: 0.08, 
      radius: 8 
    }),
  },
  selectedFarmItem: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    ...getShadowStyle({ 
      height: 4, 
      elevation: 8, 
      opacity: 0.15, 
      radius: 12 
    }),
  },
  farmIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  selectedFarmIconContainer: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  farmInfoContainer: {
    flex: 1,
  },
  farmName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  selectedFarmName: {
    color: colors.primary,
  },
  farmLocation: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  farmSize: {
    fontSize: 11,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  selectedIndicator: {
    marginLeft: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 14,
    marginBottom: 6,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  addFarmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    ...getShadowStyle({ 
      height: 3, 
      elevation: 6, 
      opacity: 0.2, 
      radius: 8 
    }),
  },
  addFarmButtonText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 15,
    marginLeft: 6,
    letterSpacing: 0.3,
  },
});

export default FarmSelector;
