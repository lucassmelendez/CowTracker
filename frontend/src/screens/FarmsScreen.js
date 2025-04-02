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
} from '../services/services';
import { deleteFarm } from '../services/services';
import { farmsStyles } from '../styles/farmsStyles';

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

  const [modalVisible, setModalVisible] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmSize, setFarmSize] = useState('');

  const [modalMessage, setModalMessage] = useState('');
  const [messageModalVisible, setMessageModalVisible] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [farmToDelete, setFarmToDelete] = useState(null);

  const showModal = (message) => {
    setModalMessage(message);
    setMessageModalVisible(true);
  };

  const closeModal = () => {
    setMessageModalVisible(false);
    setModalMessage('');
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setFarmToDelete(null);
  };

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
      showModal('Error: No se pudieron cargar las granjas');
    } finally {
      setLoading(false);
    }
  };

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
      showModal('Error: Por favor, completa todos los campos');
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
        showModal('Éxito: Granja actualizada correctamente');
      } else {
        await createFarm(farmData);
        showModal('Éxito: Granja agregada correctamente');
      }
      
      await loadFarms(); // Recargar las granjas
    } catch (error) {
      console.error('Error al guardar granja:', error);
      showModal('Error: No se pudo guardar la granja');
    }
    
    setModalVisible(false);
  };

  const handleManageStaff = async (farm) => {
    setSelectedFarm(farm);
    setManagingStaff(true);
    setLoadingStaff(true);
    
    try {
      const workers = await getFarmWorkers(farm._id);
      setFarmWorkers(workers);
      
      const vets = await getFarmVeterinarians(farm._id);
      setFarmVeterinarians(vets);
      
      const cattle = await getFarmCattle(farm._id);
      setFarmCattle(cattle);
      
      const allWorkers = await getUsersByRole('trabajador');
      setAvailableWorkers(allWorkers.filter(worker => 
        !workers.some(w => w._id === worker._id)
      ));
      
      const allVets = await getUsersByRole('veterinario');
      setAvailableVeterinarians(allVets.filter(vet => 
        !vets.some(v => v._id === vet._id)
      ));
    } catch (error) {
      console.error('Error al cargar personal de la granja:', error);
      showModal('Error: No se pudo cargar el personal de la granja');
    } finally {
      setLoadingStaff(false);
    }
  };
  
  const handleAddWorker = async (workerId) => {
    try {
      await addWorkerToFarm(selectedFarm._id, workerId);
      
      const worker = availableWorkers.find(w => w._id === workerId);
      setFarmWorkers([...farmWorkers, worker]);
      setAvailableWorkers(availableWorkers.filter(w => w._id !== workerId));
      
      showModal('Éxito: Trabajador añadido a la granja correctamente');
    } catch (error) {
      console.error('Error al añadir trabajador:', error);
      showModal('Error: No se pudo añadir el trabajador a la granja');
    }
  };
  
  const handleRemoveWorker = async (workerId) => {
    try {
      await removeWorkerFromFarm(selectedFarm._id, workerId);
      
      const worker = farmWorkers.find(w => w._id === workerId);
      setAvailableWorkers([...availableWorkers, worker]);
      setFarmWorkers(farmWorkers.filter(w => w._id !== workerId));
      
      showModal('Éxito: Trabajador eliminado de la granja correctamente');
    } catch (error) {
      console.error('Error al eliminar trabajador:', error);
      showModal('Error: No se pudo eliminar el trabajador de la granja');
    }
  };
  
  const handleAddVeterinarian = async (vetId) => {
    try {
      await addVeterinarianToFarm(selectedFarm._id, vetId);
      
      const vet = availableVeterinarians.find(v => v._id === vetId);
      setFarmVeterinarians([...farmVeterinarians, vet]);
      setAvailableVeterinarians(availableVeterinarians.filter(v => v._id !== vetId));
      
      showModal('Éxito: Veterinario añadido a la granja correctamente');
    } catch (error) {
      console.error('Error al añadir veterinario:', error);
      showModal('Error: No se pudo añadir el veterinario a la granja');
    }
  };
  
  const handleRemoveVeterinarian = async (vetId) => {
    try {
      await removeVeterinarianFromFarm(selectedFarm._id, vetId);
      
      const vet = farmVeterinarians.find(v => v._id === vetId);
      setAvailableVeterinarians([...availableVeterinarians, vet]);
      setFarmVeterinarians(farmVeterinarians.filter(v => v._id !== vetId));
      
      showModal('Éxito: Veterinario eliminado de la granja correctamente');
    } catch (error) {
      console.error('Error al eliminar veterinario:', error);
      showModal('Error: No se pudo eliminar el veterinario de la granja');
    }
  };
  
  const handleViewCattle = (farm) => {
    router.push({
      pathname: '/explore',
      params: { farmId: farm._id }
    });
  };
  
  const handleDelete = async () => {
    try {
      setDeleteModalVisible(false);
      setLoading(true);
      await deleteFarm(farmToDelete);
      await loadFarms();
    } catch (error) {
      console.error('Error al eliminar granja:', error);
      showModal('Error: No se pudo eliminar la granja');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (farmId) => {
    setFarmToDelete(farmId);
    setDeleteModalVisible(true);
  };

  const handleBack = () => {
    router.back();
  };

  const renderItem = ({ item }) => (
    <View style={farmsStyles.farmItem}>
      <View style={farmsStyles.cardHeader}>
        <Text style={farmsStyles.farmName}>{item.name}</Text>
        <View style={farmsStyles.actionsContainer}>
          <TouchableOpacity 
            style={farmsStyles.actionButton} 
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="create-outline" size={20} color="#27ae60" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={farmsStyles.actionButton} 
            onPress={() => openDeleteModal(item._id)}
          >
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={farmsStyles.infoContainer}>
        <View style={farmsStyles.infoItem}>
          <Ionicons name="location-outline" size={18} color="#555" />
          <Text style={farmsStyles.infoText}>{item.location}</Text>
        </View>
        <View style={farmsStyles.infoItem}>
          <Ionicons name="resize-outline" size={18} color="#555" />
          <Text style={farmsStyles.infoText}>{item.size}</Text>
        </View>
        <View style={farmsStyles.infoItem}>
          <Ionicons name="browsers-outline" size={18} color="#555" />
          <Text style={farmsStyles.infoText}>{item.cattleCount} animales</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={farmsStyles.container}>
      <View style={farmsStyles.header}>
        <Text style={farmsStyles.title}>Mis Granjas</Text>
        <Text style={farmsStyles.subtitle}>Gestiona tus propiedades</Text>
      </View>

      {loading ? (
        <View style={farmsStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#27ae60" />
          <Text style={farmsStyles.loadingText}>Cargando granjas...</Text>
        </View>
      ) : managingStaff ? (
        <View style={farmsStyles.staffContainer}>
          <View style={farmsStyles.staffHeader}>
            <TouchableOpacity 
              style={farmsStyles.backButton}
              onPress={() => setManagingStaff(false)}
            >
              <Ionicons name="arrow-back" size={24} color="#27ae60" />
            </TouchableOpacity>
            <Text style={farmsStyles.staffTitle}>Gestionar Personal - {selectedFarm?.name}</Text>
          </View>
          
          {loadingStaff ? (
            <View style={farmsStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#27ae60" />
              <Text style={farmsStyles.loadingText}>Cargando personal...</Text>
            </View>
          ) : (
            <ScrollView style={farmsStyles.staffScrollView}>
              <View style={farmsStyles.staffSection}>
                <Text style={farmsStyles.sectionTitle}>Trabajadores</Text>
                
                {farmWorkers.length > 0 ? (
                  farmWorkers.map(worker => (
                    <View key={worker._id} style={farmsStyles.staffCard}>
                      <View style={farmsStyles.staffInfo}>
                        <Ionicons name="person" size={20} color="#555" />
                        <Text style={farmsStyles.staffName}>{worker.name}</Text>
                      </View>
                      <TouchableOpacity 
                        style={farmsStyles.removeButton}
                        onPress={() => handleRemoveWorker(worker._id)}
                      >
                        <Ionicons name="close-circle" size={20} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={farmsStyles.emptyStaffText}>No hay trabajadores asignados</Text>
                )}
                
                {availableWorkers.length > 0 && (
                  <View style={farmsStyles.addStaffSection}>
                    <Text style={farmsStyles.addStaffTitle}>Añadir Trabajador:</Text>
                    {availableWorkers.map(worker => (
                      <View key={worker._id} style={farmsStyles.staffCard}>
                        <View style={farmsStyles.staffInfo}>
                          <Ionicons name="person-add" size={20} color="#555" />
                          <Text style={farmsStyles.staffName}>{worker.name}</Text>
                        </View>
                        <TouchableOpacity 
                          style={farmsStyles.addStaffButton}
                          onPress={() => handleAddWorker(worker._id)}
                        >
                          <Ionicons name="add-circle" size={20} color="#27ae60" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              
              <View style={farmsStyles.staffSection}>
                <Text style={farmsStyles.sectionTitle}>Veterinarios</Text>
                
                {farmVeterinarians.length > 0 ? (
                  farmVeterinarians.map(vet => (
                    <View key={vet._id} style={farmsStyles.staffCard}>
                      <View style={farmsStyles.staffInfo}>
                        <Ionicons name="medkit" size={20} color="#555" />
                        <Text style={farmsStyles.staffName}>{vet.name}</Text>
                      </View>
                      <TouchableOpacity 
                        style={farmsStyles.removeButton}
                        onPress={() => handleRemoveVeterinarian(vet._id)}
                      >
                        <Ionicons name="close-circle" size={20} color="#e74c3c" />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={farmsStyles.emptyStaffText}>No hay veterinarios asignados</Text>
                )}
                
                {availableVeterinarians.length > 0 && (
                  <View style={farmsStyles.addStaffSection}>
                    <Text style={farmsStyles.addStaffTitle}>Añadir Veterinario:</Text>
                    {availableVeterinarians.map(vet => (
                      <View key={vet._id} style={farmsStyles.staffCard}>
                        <View style={farmsStyles.staffInfo}>
                          <Ionicons name="medkit" size={20} color="#555" />
                          <Text style={farmsStyles.staffName}>{vet.name}</Text>
                        </View>
                        <TouchableOpacity 
                          style={farmsStyles.addStaffButton}
                          onPress={() => handleAddVeterinarian(vet._id)}
                        >
                          <Ionicons name="add-circle" size={20} color="#27ae60" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View style={farmsStyles.staffSection}>
                <Text style={farmsStyles.sectionTitle}>Ganado</Text>
                
                <TouchableOpacity 
                  style={farmsStyles.viewCattleButton}
                  onPress={() => handleViewCattle(selectedFarm)}
                >
                  <Text style={farmsStyles.viewCattleButtonText}>Ver y Gestionar Ganado</Text>
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
            contentContainerStyle={farmsStyles.listContainer}
            ListEmptyComponent={
              <View style={farmsStyles.emptyContainer}>
                <Ionicons name="leaf-outline" size={60} color="#ddd" />
                <Text style={farmsStyles.emptyText}>No tienes granjas registradas</Text>
                <Text style={farmsStyles.emptySubtext}>Agrega una nueva granja para comenzar</Text>
              </View>
            }
          />

          <TouchableOpacity style={farmsStyles.addButton} onPress={openAddModal}>
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
        <View style={farmsStyles.modalContainer}>
          <View style={farmsStyles.modalContent}>
            <Text style={farmsStyles.modalTitle}>
              {editingFarm ? 'Editar Granja' : 'Agregar Granja'}
            </Text>

            <Text style={farmsStyles.label}>Nombre</Text>
            <TextInput 
              style={farmsStyles.input}
              value={farmName}
              onChangeText={setFarmName}
              placeholder="Nombre de la granja"
            />

            <Text style={farmsStyles.label}>Ubicación</Text>
            <TextInput 
              style={farmsStyles.input}
              value={farmLocation}
              onChangeText={setFarmLocation}
              placeholder="Ubicación"
            />

            <Text style={farmsStyles.label}>Tamaño</Text>
            <TextInput 
              style={farmsStyles.input}
              value={farmSize}
              onChangeText={setFarmSize}
              placeholder="Ej. 150 hectáreas"
            />

            <View style={farmsStyles.modalButtons}>
              <TouchableOpacity 
                style={farmsStyles.cancelButton} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={farmsStyles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={farmsStyles.saveButton}
                onPress={handleSave}
              >
                <Text style={farmsStyles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={messageModalVisible}
        onRequestClose={closeModal}
      >
        <View style={farmsStyles.modalOverlay}>
          <View style={farmsStyles.modalContent}>
            <Text style={farmsStyles.modalText}>{modalMessage}</Text>
            <TouchableOpacity style={farmsStyles.modalButton} onPress={closeModal}>
              <Text style={farmsStyles.modalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={closeDeleteModal}
      >
        <View style={farmsStyles.modalOverlay}>
          <View style={farmsStyles.modalContent}>
            <Text style={farmsStyles.modalTitle}>Confirmar eliminación</Text>
            <Text style={farmsStyles.modalText}>
              ¿Estás seguro de que deseas eliminar esta granja?
            </Text>
            <View style={farmsStyles.modalButtons}>
              <TouchableOpacity
                style={farmsStyles.cancelButton}
                onPress={closeDeleteModal}
              >
                <Text style={farmsStyles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={farmsStyles.confirmButton}
                onPress={handleDelete}
              >
                <Text style={farmsStyles.confirmButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FarmsScreen;