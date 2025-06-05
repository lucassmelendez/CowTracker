import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './AuthContext';
import { useRouter } from 'expo-router';
import { useUserFarms, useAllFarms } from '../hooks/useCachedData';

interface Farm {
  _id: string;
  name: string;
  location?: string;
  id_finca?: string;
}

interface FarmSelectorProps {
  onSelectFarm: (farm: Farm) => void;
  selectedFarm: Farm | null;
}

interface RenderFarmItemProps {
  item: Farm;
}

const FarmSelector: React.FC<FarmSelectorProps> = ({ onSelectFarm, selectedFarm }) => {
  const { userInfo } = useAuth();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  
  // Usar hooks con caché
  const { 
    data: userFarms, 
    loading: userFarmsLoading, 
    error: userFarmsError,
    refresh: refreshUserFarms 
  } = useUserFarms();
  
  const { 
    data: allFarms, 
    loading: allFarmsLoading, 
    error: allFarmsError,
    refresh: refreshAllFarms 
  } = useAllFarms();

  // Determinar qué granjas mostrar y el estado de carga
  const farms = userFarms && userFarms.length > 0 ? userFarms : (allFarms || []);
  const loading = userFarmsLoading || allFarmsLoading;
  const error = userFarmsError || allFarmsError;

  // Refrescar datos cuando se abre el modal
  useEffect(() => {
    if (modalVisible && userInfo?.uid) {
      refreshUserFarms();
      refreshAllFarms();
    }
  }, [modalVisible, userInfo?.uid, refreshUserFarms, refreshAllFarms]);

  // Efecto adicional para refrescar automáticamente cuando cambian los datos
  useEffect(() => {
    console.log('FarmSelector - Datos de granjas actualizados');
    console.log('FarmSelector - Granjas de usuario:', userFarms?.length || 0);
    console.log('FarmSelector - Todas las granjas:', allFarms?.length || 0);
    
    // Si no hay granja seleccionada y hay granjas disponibles, seleccionar la primera
    if (!selectedFarm && farms && farms.length > 0) {
      console.log('FarmSelector - Seleccionando primera granja automáticamente:', farms[0]);
      onSelectFarm(farms[0]);
    }
  }, [userFarms, allFarms, farms, selectedFarm, onSelectFarm]);

  const handleSelectFarm = (farm: Farm): void => {
    onSelectFarm(farm);
    setModalVisible(false);
  };

  const handleAddFarm = (): void => {
    setModalVisible(false);
    router.push('/farms');
  };

  const handleRefresh = async (): Promise<void> => {
    await Promise.all([refreshUserFarms(), refreshAllFarms()]);
  };

  const renderFarmItem = ({ item }: RenderFarmItemProps) => {
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
          <Ionicons name="leaf" size={24} color="#27ae60" />
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
          <Ionicons name="checkmark-circle" size={24} color="#27ae60" />
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
      <TouchableOpacity style={styles.selectorButton} onPress={handleRefresh}>
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
      >
        <Ionicons name="leaf" size={18} color="#ffffff" />
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
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text style={styles.addFarmText}>Añadir nueva granja</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    maxWidth: 220,
    minHeight: 44,
  },
  selectorText: {
    color: '#ffffff',
    marginHorizontal: 8,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  refreshButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
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
    borderColor: '#27ae60',
  },
  farmIconContainer: {
    width: 44,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  farmInfoContainer: {
    flex: 1,
  },
  farmName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  selectedFarmName: {
    color: '#27ae60',
  },
  farmLocation: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  addFarmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 15,
  },
  addFarmText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addFarmButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 8,
    fontSize: 15,
  },
});

export default FarmSelector; 