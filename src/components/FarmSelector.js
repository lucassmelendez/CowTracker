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
import { getAllFarms } from '../services/firestore';
import { useRouter } from 'expo-router';

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

  const loadFarms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const farmsData = await getAllFarms(userInfo.uid);
      setFarms(farmsData || []);
      
      if (!selectedFarm && farmsData && farmsData.length > 0) {
        onSelectFarm(farmsData[0]);
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

  const renderFarmItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.farmItem} 
      onPress={() => handleSelectFarm(item)}
    >
      <Text style={styles.farmName}>{item.name}</Text>
      <Text style={styles.farmLocation}>{item.location}</Text>
    </TouchableOpacity>
  );

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
        <Text style={styles.selectorText}>Añadir granja</Text>
        <Ionicons name="add-circle" size={16} color="#ffffff" />
      </TouchableOpacity>
    );
  }

  return (
    <View>
      <TouchableOpacity 
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectorText} numberOfLines={1}>
          {selectedFarm ? selectedFarm.name : 'Seleccionar granja'}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#ffffff" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
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
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginLeft: 10,
    maxWidth: 150,
  },
  selectorText: {
    color: '#ffffff',
    marginRight: 5,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  errorText: {
    color: '#ffffff',
    marginRight: 5,
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
    borderRadius: 10,
    width: '80%',
    maxHeight: '70%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  farmList: {
    flexGrow: 1,
  },
  farmItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  farmName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  farmLocation: {
    fontSize: 14,
    color: '#666',
  },
  addFarmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  addFarmButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 5,
  },
});

export default FarmSelector;
