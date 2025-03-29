import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getShadowStyle } from '../utils/styles';
import { useAuth } from '../components/AuthContext';
import { 
  getAllFarms, 
  createFarm, 
  updateFarm, 
  addWorkerToFarm, 
  removeWorkerFromFarm, 
  getFarmWorkers,
  addVeterinarianToFarm,
  removeVeterinarianFromFarm,
  getFarmVeterinarians,
  addCattleToFarm,
  removeCattleFromFarm,
  getFarmCattle,
  getUsersByRole
} from '../services/firestore';
import { doc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase';

const FarmsScreen = () => {
  const router = useRouter();
  const { userInfo } = useAuth();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [farmWorkers, setFarmWorkers] = useState([]);
  const [farmVeterinarians, setFarmVeterinarians] = useState([]);
  const [farmCattle, setFarmCattle] = useState([]);
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [availableVeterinarians, setAvailableVeterinarians] = useState([]);
  const [managingStaff, setManagingStaff] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(false);

  useEffect(() => {
    if (userInfo?.uid) {
      loadFarms();
    }
  }, [userInfo]);

  const loadFarms = async () => {
    try {
      const userFarms = await getAllFarms(userInfo.uid);
      setFarms(userFarms);
    } catch (error) {
      console.error('Error al cargar granjas:', error);
      Alert.alert('Error', 'No se pudieron cargar las granjas');
    } finally {
      setLoading(false);
    }
  };

  // Estado para el modal de agregar/editar granja
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmSize, setFarmSize] = useState('');

  const openAddModal = () => {
    setEditingFarm(null);
    setFarmName('');
    setFarmLocation('');
    setFarmSize('');
    setModalVisible(true);
  };

  const openEditModal = (farm) => {
    setEditingFarm(farm);
    setFarmName(farm.name);
    setFarmLocation(farm.location);
    setFarmSize(farm.size);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!farmName || !farmLocation || !farmSize) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    try {
      const farmData = {
        name: farmName,
        location: farmLocation,
        size: farmSize,
        userId: userInfo.uid,
        cattleCount: editingFarm ? editingFarm.cattleCount : 0
      };

      if (editingFarm) {
        await updateFarm(editingFarm._id, farmData);
        Alert.alert('Éxito', 'Granja actualizada correctamente');
      } else {
        await createFarm(farmData);
        Alert.alert('Éxito', 'Granja agregada correctamente');
      }
      
      await loadFarms(); // Recargar las granjas
    } catch (error) {
      console.error('Error al guardar granja:', error);
      Alert.alert('Error', 'No se pudo guardar la granja');
    }
    
    setModalVisible(false);
  };

  // Función para gestionar el personal de una granja
  const handleManageStaff = async (farm) => {
    setSelectedFarm(farm);
    setManagingStaff(true);
    setLoadingStaff(true);
    
    try {
      // Cargar trabajadores actuales de la granja
      const workers = await getFarmWorkers(farm._id);
      setFarmWorkers(workers);
      
      // Cargar veterinarios actuales de la granja
      const vets = await getFarmVeterinarians(farm._id);
      setFarmVeterinarians(vets);
      
      // Cargar ganado actual de la granja
      const cattle = await getFarmCattle(farm._id);
      setFarmCattle(cattle);
      
      // Cargar trabajadores disponibles
      const allWorkers = await getUsersByRole('trabajador');
      setAvailableWorkers(allWorkers.filter(worker => 
        !workers.some(w => w._id === worker._id)
      ));
      
      // Cargar veterinarios disponibles
      const allVets = await getUsersByRole('veterinario');
      setAvailableVeterinarians(allVets.filter(vet => 
        !vets.some(v => v._id === vet._id)
      ));
    } catch (error) {
      console.error('Error al cargar personal de la granja:', error);
      Alert.alert('Error', 'No se pudo cargar el personal de la granja');
    } finally {
      setLoadingStaff(false);
    }
  };
  
  // Función para añadir un trabajador a la granja
  const handleAddWorker = async (workerId) => {
    try {
      await addWorkerToFarm(selectedFarm._id, workerId);
      
      // Actualizar listas
      const worker = availableWorkers.find(w => w._id === workerId);
      setFarmWorkers([...farmWorkers, worker]);
      setAvailableWorkers(availableWorkers.filter(w => w._id !== workerId));
      
      Alert.alert('Éxito', 'Trabajador añadido a la granja correctamente');
    } catch (error) {
      console.error('Error al añadir trabajador:', error);
      Alert.alert('Error', 'No se pudo añadir el trabajador a la granja');
    }
  };
  
  // Función para eliminar un trabajador de la granja
  const handleRemoveWorker = async (workerId) => {
    try {
      await removeWorkerFromFarm(selectedFarm._id, workerId);
      
      // Actualizar listas
      const worker = farmWorkers.find(w => w._id === workerId);
      setAvailableWorkers([...availableWorkers, worker]);
      setFarmWorkers(farmWorkers.filter(w => w._id !== workerId));
      
      Alert.alert('Éxito', 'Trabajador eliminado de la granja correctamente');
    } catch (error) {
      console.error('Error al eliminar trabajador:', error);
      Alert.alert('Error', 'No se pudo eliminar el trabajador de la granja');
    }
  };
  
  // Función para añadir un veterinario a la granja
  const handleAddVeterinarian = async (vetId) => {
    try {
      await addVeterinarianToFarm(selectedFarm._id, vetId);
      
      // Actualizar listas
      const vet = availableVeterinarians.find(v => v._id === vetId);
      setFarmVeterinarians([...farmVeterinarians, vet]);
      setAvailableVeterinarians(availableVeterinarians.filter(v => v._id !== vetId));
      
      Alert.alert('Éxito', 'Veterinario añadido a la granja correctamente');
    } catch (error) {
      console.error('Error al añadir veterinario:', error);
      Alert.alert('Error', 'No se pudo añadir el veterinario a la granja');
    }
  };
  
  // Función para eliminar un veterinario de la granja
  const handleRemoveVeterinarian = async (vetId) => {
    try {
      await removeVeterinarianFromFarm(selectedFarm._id, vetId);
      
      // Actualizar listas
      const vet = farmVeterinarians.find(v => v._id === vetId);
      setAvailableVeterinarians([...availableVeterinarians, vet]);
      setFarmVeterinarians(farmVeterinarians.filter(v => v._id !== vetId));
      
      Alert.alert('Éxito', 'Veterinario eliminado de la granja correctamente');
    } catch (error) {
      console.error('Error al eliminar veterinario:', error);
      Alert.alert('Error', 'No se pudo eliminar el veterinario de la granja');
    }
  };
  
  // Función para ver el ganado de una granja
  const handleViewCattle = (farm) => {
    router.push({
      pathname: '/explore',
      params: { farmId: farm._id }
    });
  };
  
  const handleDelete = async (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de eliminar esta granja?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              const docRef = doc(firestore, FARMS_COLLECTION, id);
              await deleteDoc(docRef);
              await loadFarms(); // Recargar las granjas
              Alert.alert('Éxito', 'Granja eliminada correctamente');
            } catch (error) {
              console.error('Error al eliminar granja:', error);
              Alert.alert('Error', 'No se pudo eliminar la granja');
            }
          }
        }
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  const renderItem = ({ item }) => (
    <View style={styles.farmItem}>
      <View style={styles.cardHeader}>
        <Text style={styles.farmName}>{item.name}</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="create-outline" size={20} color="#27ae60" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={18} color="#555" />
          <Text style={styles.infoText}>{item.location}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="resize-outline" size={18} color="#555" />
          <Text style={styles.infoText}>{item.size}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="browsers-outline" size={18} color="#555" />
          <Text style={styles.infoText}>{item.cattleCount} animales</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Granjas</Text>
        <Text style={styles.subtitle}>Gestiona tus propiedades</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#27ae60" />
          <Text style={styles.loadingText}>Cargando granjas...</Text>
        </View>
      ) : managingStaff ? (
        <View style={styles.staffContainer}>
          <View style={styles.staffHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setManagingStaff(false)}
            >
              <Ionicons name="arrow-back" size={24} color="#27ae60" />
            </TouchableOpacity>
            <Text style={styles.staffTitle}>Gestionar Personal - {selectedFarm?.name}</Text>
          </View>
          
          {loadingStaff ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#27ae60" />
              <Text style={styles.loadingText}>Cargando personal...</Text>
            </View>
          ) : (
            <ScrollView style={styles.staffScrollView}>
              {/* Sección de Trabajadores */}
              <View style={styles.staffSection}>
                <Text style={styles.sectionTitle}>Trabajadores</Text>
                
                {farmWorkers.length > 0 ? (
                  farmWorkers.map(worker => (
                    <View key={worker._id} style={styles.staffCard}>
                      <View style={styles.staffInfo}>
                        <Ionicons name="person" size={20} color="#555" />
                        <Text style={styles.staffName}>{worker.name}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => handleRemoveWorker(worker._id)}
                      >
                        <Ionicons name="close-circle" size={20} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyStaffText}>No hay trabajadores asignados</Text>
                )}
                
                {availableWorkers.length > 0 && (
                  <View style={styles.addStaffSection}>
                    <Text style={styles.addStaffTitle}>Añadir Trabajador:</Text>
                    {availableWorkers.map(worker => (
                      <View key={worker._id} style={styles.staffCard}>
                        <View style={styles.staffInfo}>
                          <Ionicons name="person-add" size={20} color="#555" />
                          <Text style={styles.staffName}>{worker.name}</Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.addStaffButton}
                          onPress={() => handleAddWorker(worker._id)}
                        >
                          <Ionicons name="add-circle" size={20} color="#27ae60" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              
              {/* Sección de Veterinarios */}
              <View style={styles.staffSection}>
                <Text style={styles.sectionTitle}>Veterinarios</Text>
                
                {farmVeterinarians.length > 0 ? (
                  farmVeterinarians.map(vet => (
                    <View key={vet._id} style={styles.staffCard}>
                      <View style={styles.staffInfo}>
                        <Ionicons name="medkit" size={20} color="#555" />
                        <Text style={styles.staffName}>{vet.name}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={() => handleRemoveVeterinarian(vet._id)}
                      >
                        <Ionicons name="close-circle" size={20} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyStaffText}>No hay veterinarios asignados</Text>
                )}
                
                {availableVeterinarians.length > 0 && (
                  <View style={styles.addStaffSection}>
                    <Text style={styles.addStaffTitle}>Añadir Veterinario:</Text>
                    {availableVeterinarians.map(vet => (
                      <View key={vet._id} style={styles.staffCard}>
                        <View style={styles.staffInfo}>
                          <Ionicons name="medkit" size={20} color="#555" />
                          <Text style={styles.staffName}>{vet.name}</Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.addStaffButton}
                          onPress={() => handleAddVeterinarian(vet._id)}
                        >
                          <Ionicons name="add-circle" size={20} color="#27ae60" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              
              {/* Sección de Ganado */}
              <View style={styles.staffSection}>
                <Text style={styles.sectionTitle}>Ganado</Text>
                
                <TouchableOpacity 
                  style={styles.viewCattleButton}
                  onPress={() => handleViewCattle(selectedFarm)}
                >
                  <Text style={styles.viewCattleButtonText}>Ver y Gestionar Ganado</Text>
                  <Ionicons name="arrow-forward" size={16} color="#27ae60" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      ) : (
        <>
          <FlatList
            data={farms}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="leaf-outline" size={60} color="#ddd" />
                <Text style={styles.emptyText}>No tienes granjas registradas</Text>
                <Text style={styles.emptySubtext}>Agrega una nueva granja para comenzar</Text>
              </View>
            }
          />

          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Ionicons name="add" size={30} color="#fff" />
          </TouchableOpacity>
        </>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingFarm ? 'Editar Granja' : 'Agregar Granja'}
            </Text>

            <Text style={styles.label}>Nombre</Text>
            <TextInput 
              style={styles.input}
              value={farmName}
              onChangeText={setFarmName}
              placeholder="Nombre de la granja"
            />

            <Text style={styles.label}>Ubicación</Text>
            <TextInput 
              style={styles.input}
              value={farmLocation}
              onChangeText={setFarmLocation}
              placeholder="Ubicación"
            />

            <Text style={styles.label}>Tamaño</Text>
            <TextInput 
              style={styles.input}
              value={farmSize}
              onChangeText={setFarmSize}
              placeholder="Ej. 150 hectáreas"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Estilos para la gestión de personal
  staffContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  staffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 10,
  },
  staffTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  staffScrollView: {
    flex: 1,
  },
  staffSection: {
    marginVertical: 15,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  staffCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    ...getShadowStyle(2),
  },
  staffInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  staffName: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  removeButton: {
    padding: 5,
  },
  addStaffSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addStaffTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  addStaffButton: {
    padding: 5,
  },
  emptyStaffText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginVertical: 10,
  },
  staffButton: {
    backgroundColor: '#3498db',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#27ae60',
    padding: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginTop: 5,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  farmItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    ...getShadowStyle(),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  farmName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
  },
  infoContainer: {
    marginTop: 5,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#27ae60',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...getShadowStyle({ elevation: 5 }),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#777',
    marginTop: 10,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    ...getShadowStyle({ elevation: 5, radius: 10 }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '48%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    padding: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FarmsScreen;