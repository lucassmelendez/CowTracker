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
    <View style={styles.farmCard}>
      {/* Header de la card con gradiente */}
      <View style={styles.cardHeader}>
        <View style={styles.farmTitleContainer}>
          <Text style={styles.farmName}>{item.name}</Text>
          <View style={styles.statusIndicator}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Activa</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.viewCattleButton}
          onPress={() => handleViewCattle(item)}
        >
          <Ionicons name="eye-outline" size={16} color="#059669" />
        </TouchableOpacity>
      </View>

      {/* Estadísticas en grid */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
            <Ionicons name="resize-outline" size={20} color="#2563eb" />
          </View>
          <Text style={styles.statValue}>{item.size || 0}</Text>
          <Text style={styles.statLabel}>Hectáreas</Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#fed7aa' }]}>
            <Ionicons name="browsers-outline" size={20} color="#ea580c" />
          </View>
          <Text style={styles.statValue}>{item.cattleCount || 0}</Text>
          <Text style={styles.statLabel}>Animales</Text>
        </View>
      </View>

      {/* Información adicional */}
      {item.location && (
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
      )}

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="create-outline" size={16} color="#ffffff" />
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => confirmDelete(item)}
        >
          <Ionicons name="trash-outline" size={16} color="#ffffff" />
          <Text style={styles.buttonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f8fafc',
    },
    header: {
      backgroundColor: '#059669',
      paddingTop: 50,
      paddingBottom: 30,
      paddingHorizontal: 20,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    headerLeft: {
      flex: 1,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: 5,
    },
    subtitle: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.9)',
    },
    headerIcon: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 50,
      padding: 15,
    },
    statsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    headerStat: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 12,
      padding: 15,
      flex: 1,
      marginHorizontal: 5,
    },
    headerStatLabel: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 14,
      marginBottom: 5,
    },
    headerStatValue: {
      color: '#ffffff',
      fontSize: 24,
      fontWeight: 'bold',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#ffffff',
      margin: 20,
      borderRadius: 16,
      padding: 40,
    },
    loadingText: {
      fontSize: 16,
      color: '#6b7280',
      marginTop: 15,
      fontWeight: '500',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyCard: {
      backgroundColor: '#ffffff',
      borderRadius: 20,
      padding: 40,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    emptyIconContainer: {
      backgroundColor: '#f0fdf4',
      borderRadius: 50,
      padding: 20,
      marginBottom: 20,
    },
    emptyText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#374151',
      textAlign: 'center',
      marginBottom: 10,
    },
    emptySubtext: {
      fontSize: 16,
      color: '#6b7280',
      textAlign: 'center',
      lineHeight: 24,
    },
    listContainer: {
      padding: 15,
      paddingBottom: 100,
    },
    farmCard: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      marginBottom: 15,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 1,
      borderColor: '#f1f5f9',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    farmTitleContainer: {
      flex: 1,
    },
    farmName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: 8,
    },
    statusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#10b981',
      marginRight: 6,
    },
    statusText: {
      fontSize: 14,
      color: '#10b981',
      fontWeight: '600',
    },
    viewCattleButton: {
      backgroundColor: '#f0fdf4',
      borderRadius: 8,
      padding: 8,
      borderWidth: 1,
      borderColor: '#bbf7d0',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: '#f8fafc',
      borderRadius: 12,
      padding: 15,
      marginHorizontal: 5,
    },
    statIcon: {
      borderRadius: 25,
      padding: 10,
      marginBottom: 8,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: '#6b7280',
      fontWeight: '500',
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f8fafc',
      borderRadius: 8,
      padding: 12,
      marginBottom: 20,
    },
    locationText: {
      fontSize: 14,
      color: '#6b7280',
      marginLeft: 8,
      flex: 1,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    editButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#059669',
      padding: 12,
      borderRadius: 10,
      marginRight: 8,
    },
    deleteButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#dc2626',
      padding: 12,
      borderRadius: 10,
      marginLeft: 8,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 6,
    },
    addButton: {
      position: 'absolute',
      right: 20,
      bottom: 20,
      backgroundColor: '#059669',
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      backgroundColor: '#ffffff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 25,
      maxHeight: '80%',
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: '#d1d5db',
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 20,
    },
    modalHeader: {
      alignItems: 'center',
      marginBottom: 25,
    },
    modalIconContainer: {
      backgroundColor: '#f0fdf4',
      borderRadius: 50,
      padding: 15,
      marginBottom: 15,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: 8,
    },
    modalSubtitle: {
      fontSize: 16,
      color: '#6b7280',
      textAlign: 'center',
    },
    formContainer: {
      marginBottom: 25,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 8,
    },
    inputContainer: {
      backgroundColor: '#f8fafc',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      paddingHorizontal: 15,
      paddingVertical: 12,
      marginBottom: 20,
    },
    input: {
      fontSize: 16,
      color: '#1f2937',
    },
    errorContainer: {
      backgroundColor: '#fef2f2',
      borderRadius: 8,
      padding: 12,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#fecaca',
    },
    errorText: {
      color: '#dc2626',
      fontSize: 14,
      textAlign: 'center',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    cancelButton: {
      flex: 1,
      backgroundColor: '#f8fafc',
      padding: 15,
      borderRadius: 12,
      alignItems: 'center',
      marginRight: 10,
      borderWidth: 1,
      borderColor: '#e5e7eb',
    },
    saveButton: {
      flex: 1,
      backgroundColor: '#059669',
      padding: 15,
      borderRadius: 12,
      alignItems: 'center',
      marginLeft: 10,
    },
    cancelButtonText: {
      color: '#374151',
      fontSize: 16,
      fontWeight: '600',
    },
    saveButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    messageModalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 20,
    },
    messageModalContent: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: 25,
      alignItems: 'center',
      maxWidth: 300,
      width: '100%',
    },
    messageIconContainer: {
      backgroundColor: '#f0fdf4',
      borderRadius: 50,
      padding: 15,
      marginBottom: 15,
    },
    messageText: {
      fontSize: 16,
      color: '#374151',
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 24,
    },
    messageButton: {
      backgroundColor: '#059669',
      paddingHorizontal: 30,
      paddingVertical: 12,
      borderRadius: 10,
      width: '100%',
    },
    messageButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      {/* Header mejorado */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Mis Granjas</Text>
            <Text style={styles.subtitle}>Gestiona y supervisa tus propiedades</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="leaf" size={28} color="#ffffff" />
          </View>
        </View>
        
        {/* Estadísticas rápidas */}
        <View style={styles.statsHeader}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatLabel}>Total Granjas</Text>
            <Text style={styles.headerStatValue}>{farms?.length || 0}</Text>
          </View>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatLabel}>Total Animales</Text>
            <Text style={styles.headerStatValue}>
              {farms?.reduce((total, farm) => total + (farm.cattleCount || 0), 0) || 0}
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
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
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyCard}>
                  <View style={styles.emptyIconContainer}>
                    <Ionicons name="leaf-outline" size={48} color="#059669" />
                  </View>
                  <Text style={styles.emptyText}>¡Comienza tu aventura!</Text>
                  <Text style={styles.emptySubtext}>
                    Agrega tu primera granja y comienza a gestionar tu ganado de manera profesional.
                  </Text>
                </View>
              </View>
            }
          />

          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={28} color="#ffffff" />
          </TouchableOpacity>
        </>
      )}

      {/* Modal mejorado para agregar/editar granja */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Ionicons 
                  name={editingFarm ? "create-outline" : "add-outline"} 
                  size={28} 
                  color="#059669" 
                />
              </View>
              <Text style={styles.modalTitle}>
                {editingFarm ? 'Editar Granja' : 'Nueva Granja'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {editingFarm 
                  ? 'Actualiza la información de tu granja' 
                  : 'Completa los datos para crear tu granja'
                }
              </Text>
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Nombre de la granja *</Text>
              <View style={styles.inputContainer}>
                <TextInput 
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Ej. Granja San José"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <Text style={styles.label}>Tamaño (hectáreas)</Text>
              <View style={styles.inputContainer}>
                <TextInput 
                  style={styles.input}
                  value={formData.size}
                  onChangeText={(text) => setFormData({ ...formData, size: text })}
                  placeholder="Ej. 150"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
              </View>

              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}
            </ScrollView>

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
                <Text style={styles.saveButtonText}>
                  {editingFarm ? 'Actualizar' : 'Crear Granja'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de mensaje mejorado */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={messageModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.messageModalContainer}>
          <View style={styles.messageModalContent}>
            <View style={styles.messageIconContainer}>
              <Ionicons name="checkmark-circle-outline" size={32} color="#059669" />
            </View>
            <Text style={styles.messageText}>{modalMessage}</Text>
            <TouchableOpacity style={styles.messageButton} onPress={closeModal}>
              <Text style={styles.messageButtonText}>Perfecto</Text>
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
        <View style={styles.messageModalContainer}>
          <View style={styles.messageModalContent}>
            <View style={[styles.messageIconContainer, { backgroundColor: '#fef2f2' }]}>
              <Ionicons name="alert-circle-outline" size={32} color="#dc2626" />
            </View>
            <Text style={styles.modalTitle}>Confirmar eliminación</Text>
            <Text style={styles.messageText}>
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
                style={[styles.saveButton, { backgroundColor: '#dc2626' }]}
                onPress={() => {
                  if (farmToDelete) {
                    handleDeleteFarm(farmToDelete);
                  }
                }}
              >
                <Text style={styles.saveButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
} 