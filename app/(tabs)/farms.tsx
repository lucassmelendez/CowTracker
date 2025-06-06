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
import api from '../../lib/services/api';

interface Farm {
  _id: string;
  name: string;
  size?: number;
  location?: string;
  cattleCount?: number;
}

export default function FarmsPage() {
  const router = useRouter();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    size: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);

  const [modalMessage, setModalMessage] = useState('');
  const [messageModalVisible, setMessageModalVisible] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [farmToDelete, setFarmToDelete] = useState<string | null>(null);

  const showModal = (message: string) => {
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
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      console.log('Cargando granjas desde FarmsScreen...');
      
      // Usar la API en lugar de Firestore directamente
      const response = await api.farms.getAll();
      
      // Validar la respuesta
      if (!response || !Array.isArray(response)) {
        console.warn('Respuesta de API inválida:', response);
        setErrorMessage('Formato de datos inválido');
        setFarms([]);
        return;
      }
      
      console.log(`Se han cargado ${response.length} granjas`);
      
      // Procesar y validar cada granja
      const processedFarms = response.map((farm: any) => {
        const farmId = farm._id || farm.id_finca || farm.id;
        const farmName = farm.name || farm.nombre;
        
        if (!farmId) {
          console.warn('Granja sin ID encontrada:', farm);
        }
        if (!farmName) {
          console.warn('Granja sin nombre encontrada:', farm);
        }
        
        return {
          ...farm,
          _id: farmId || `temp-${Math.random().toString(36).substring(2, 9)}`,
          name: farmName || 'Granja sin nombre',
          // Asegurar que tenemos todas las propiedades necesarias
          size: farm.size || farm.tamano || 0,
          location: farm.location || farm.ubicacion || 'Ubicación no especificada',
          cattleCount: farm.cattleCount || 0
        };
      });
      
      setFarms(processedFarms);
    } catch (error: any) {
      console.error('Error al obtener granjas:', error);
      setErrorMessage('No se pudieron cargar las granjas: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateFarm = async () => {
    try {
      setErrorMessage('');
      if (!formData.name) {
        setErrorMessage('El nombre de la granja es obligatorio');
        return;
      }

      // Adaptar datos al formato que espera el backend
      const farmData = {
        name: formData.name.trim(), // El backend traducirá esto a nombre
        nombre: formData.name.trim(), // Agregar también nombre para compatibilidad
        size: formData.size ? parseInt(formData.size) : 0, // El backend traducirá esto a tamano
        tamano: formData.size ? parseInt(formData.size) : 0, // Agregar también tamano para compatibilidad
      };

      console.log('Enviando datos de finca:', farmData);

      let response;
      if (editingFarm) {
        // Actualizar granja existente
        console.log(`Actualizando granja con ID: ${editingFarm._id}`);
        response = await api.farms.update(editingFarm._id, farmData);
        showModal('Granja actualizada correctamente');
      } else {
        // Crear nueva granja
        console.log('Creando nueva granja');
        response = await api.farms.create(farmData);
        showModal('Granja creada correctamente');
      }
      
      console.log('Respuesta de la API:', response);

      setModalVisible(false);
      resetForm();
      // Recargar las granjas después de un breve retraso para dar tiempo a que se actualice el backend
      setTimeout(() => {
        loadFarms();
      }, 500);
    } catch (error: any) {
      console.error('Error al crear/actualizar granja:', error);
      const errorMsg = error.message || 'Error al guardar la granja';
      setErrorMessage(errorMsg);
      Alert.alert('Error', errorMsg);
    }
  };

  const handleDeleteFarm = async (farmId: string) => {
    try {
      await api.farms.delete(farmId);
      closeDeleteModal();
      loadFarms();
      showModal('Granja eliminada correctamente');
    } catch (error: any) {
      console.error('Error al eliminar granja:', error);
      Alert.alert('Error', 'No se pudo eliminar la granja');
    }
  };

  const confirmDelete = (farm: Farm) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar la granja "${farm.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => handleDeleteFarm(farm._id)
        }
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      size: ''
    });
    setEditingFarm(null);
  };

  const openEditModal = (farm: Farm) => {
    setEditingFarm(farm);
    setFormData({
      name: farm.name || '',
      size: farm.size?.toString() || ''
    });
    setModalVisible(true);
  };
  
  const handleViewCattle = (farm: Farm) => {
    router.push({
      pathname: '/(tabs)/explore',
      params: { farmId: farm._id }
    });
  };

  const openDeleteModal = (farmId: string) => {
    setFarmToDelete(farmId);
    setDeleteModalVisible(true);
  };

  const renderItem = ({ item }: { item: Farm }) => (
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
            onPress={() => openDeleteModal(item._id)}
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
          <Text style={styles.infoText}>{item.size} hectáreas</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="browsers-outline" size={18} color="#555" />
          <Text style={styles.infoText}>{item.cattleCount || 0} animales</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => handleViewCattle(item)}
        >
          <Ionicons name="eye-outline" size={16} color="#fff" />
          <Text style={styles.buttonText}>Ver Ganado</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    header: {
      backgroundColor: '#27ae60',
      padding: 20,
      paddingTop: 40,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    subtitle: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.8)',
      marginTop: 5,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: '#777777',
      marginTop: 10,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: 18,
      color: '#777777',
      textAlign: 'center',
      marginTop: 10,
    },
    emptySubtext: {
      fontSize: 16,
      color: '#777777',
      textAlign: 'center',
      marginTop: 5,
    },
    listContainer: {
      padding: 10,
      paddingBottom: 80,
    },
    farmItem: {
      backgroundColor: '#ffffff',
      borderRadius: 10,
      marginHorizontal: 10,
      marginVertical: 6,
      padding: 15,
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
      color: '#333333',
    },
    actionsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      marginLeft: 10,
      padding: 5,
    },
    infoContainer: {
      marginTop: 5,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 5,
    },
    infoText: {
      fontSize: 14,
      color: '#777777',
      marginLeft: 8,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 10,
    },
    viewButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#3498db',
      padding: 10,
      borderRadius: 8,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 12,
      marginLeft: 5,
    },
    addButton: {
      position: 'absolute',
      right: 20,
      bottom: 20,
      backgroundColor: '#27ae60',
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 20,
    },
    modalContent: {
      backgroundColor: '#ffffff',
      borderRadius: 10,
      padding: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333333',
      marginBottom: 20,
      textAlign: 'center',
    },
    modalText: {
      fontSize: 16,
      color: '#333333',
      textAlign: 'center',
      marginVertical: 15,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333333',
      marginBottom: 5,
    },
    input: {
      borderWidth: 1,
      borderColor: '#dddddd',
      borderRadius: 5,
      padding: 10,
      marginBottom: 15,
      fontSize: 16,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    saveButton: {
      flex: 1,
      backgroundColor: '#27ae60',
      padding: 12,
      borderRadius: 5,
      alignItems: 'center',
      marginLeft: 5,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: '#f5f5f5',
      padding: 12,
      borderRadius: 5,
      alignItems: 'center',
      marginRight: 5,
      borderWidth: 1,
      borderColor: '#dddddd',
    },
    saveButtonText: {
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    cancelButtonText: {
      color: '#333333',
      fontSize: 16,
    },
    confirmButton: {
      flex: 1,
      backgroundColor: '#e74c3c',
      padding: 12,
      borderRadius: 5,
      alignItems: 'center',
      marginLeft: 5,
    },
    confirmButtonText: {
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalButton: {
      backgroundColor: '#27ae60',
      padding: 12,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 10,
      width: '100%',
    },
    modalButtonText: {
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    errorContainer: {
      backgroundColor: '#ffebee',
      padding: 10,
      margin: 10,
      borderRadius: 5,
      borderLeftWidth: 4,
      borderLeftColor: '#e74c3c',
    },
    errorText: {
      color: '#e74c3c',
      fontSize: 14,
    },
  });

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
      ) : (
        <>
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

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

          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={30} color="#fff" />
          </TouchableOpacity>
        </>
      )}

      {/* Modal para agregar/editar granja */}
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
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Nombre de la granja"
            />

            <Text style={styles.label}>Tamaño</Text>
            <TextInput 
              style={styles.input}
              value={formData.size}
              onChangeText={(text) => setFormData({ ...formData, size: text })}
              placeholder="Ej. 150 hectáreas"
              keyboardType="numeric"
            />

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                  setErrorMessage('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleCreateFarm}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de mensaje */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={messageModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={closeDeleteModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar eliminación</Text>
            <Text style={styles.modalText}>
              ¿Estás seguro de que deseas eliminar esta granja?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeDeleteModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  if (farmToDelete) {
                    handleDeleteFarm(farmToDelete);
                  }
                }}
              >
                <Text style={styles.confirmButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
} 