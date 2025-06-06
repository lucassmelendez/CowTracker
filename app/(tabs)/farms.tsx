import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUserFarms, useCacheManager } from '../../hooks/useCachedData';
import { useUserRefresh } from '../../hooks/useUserRefresh';
import { useAuth } from '../../components/AuthContext';
import PremiumUpgradeModal from '../../components/PremiumUpgradeModal';
import api from '../../lib/services/api';
import { createStyles } from '../../styles/tailwind';
import { useCustomModal } from '../../components/CustomModal';

interface Farm {
  _id: string;
  name: string;
  size?: number;
  location?: string;
  cattleCount?: number;
}

export default function FarmsPage() {
  const router = useRouter();
  const { isAdmin, userInfo } = useAuth();
  
  // Hook para modales personalizados
  const { showSuccess, showError, showConfirm, ModalComponent } = useCustomModal();
  
  // Hook para refrescar automáticamente la información del usuario
  useUserRefresh({
    intervalMs: 30000, // Refrescar cada 30 segundos
    enableAutoRefresh: true
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    size: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);

  const [modalMessage, setModalMessage] = useState('');
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Usar hooks con caché
  const { 
    data: farms, 
    loading: farmsLoading, 
    error: farmsError,
    refresh: refreshFarms 
  } = useUserFarms();

  const { invalidateCache } = useCacheManager();
  const loading = farmsLoading;

  const showModal = (message: string) => {
    setModalMessage(message);
    setMessageModalVisible(true);
  };

  const closeModal = () => {
    setMessageModalVisible(false);
    setModalMessage('');
  };

  useEffect(() => {
    refreshFarms();
  }, []);

  const handleCreateFarm = async () => {
    try {
      setErrorMessage('');
      if (!formData.name) {
        setErrorMessage('El nombre de la granja es obligatorio');
        return;
      }

      // Verificar límite de granjas para usuarios no premium
      if (!editingFarm) { // Solo validar al crear, no al editar
        const isPremium = userInfo?.id_premium === 2 || userInfo?.id_premium === 3; // 2 = Premium, 3 = Empleado
        
        if (!isPremium && farms && farms.length >= 1) {
          setShowPremiumModal(true);
          return;
        }
      }

      const farmData = {
        name: formData.name.trim(),
        nombre: formData.name.trim(),
        size: formData.size ? parseInt(formData.size) : 0,
        tamano: formData.size ? parseInt(formData.size) : 0,
      };

      if (editingFarm) {
        await api.farms.update(editingFarm._id, farmData);
        showModal('Granja actualizada correctamente');
      } else {
        await api.farms.create(farmData);
        showModal('Granja creada correctamente');
      }
      
      setModalVisible(false);
      resetForm();
      
      await invalidateCache('farms');
      await invalidateCache('cattle');
      await refreshFarms();
    } catch (error: any) {
      console.error('Error al crear/actualizar granja:', error);
      const errorMsg = error.message || 'Error al guardar la granja';
      setErrorMessage(errorMsg);
      showError('Error', errorMsg);
    }
  };

  const handleDeleteFarm = async (farmId: string) => {
    try {
      await api.farms.delete(farmId);
      showModal('Granja eliminada correctamente');
      
      await invalidateCache('farms');
      await invalidateCache('cattle');
      await refreshFarms();
    } catch (error: any) {
      console.error('Error al eliminar granja:', error);
      showError('Error', 'No se pudo eliminar la granja');
    }
  };

  const confirmDelete = (farm: Farm) => {
    showConfirm(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar la granja "${farm.name}"?`,
      () => handleDeleteFarm(farm._id),
      'Eliminar',
      'Cancelar'
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

  const renderItem = ({ item }: { item: Farm }) => (
    <View style={createStyles('bg-white rounded-lg mx-4 my-2 p-4 shadow-sm')}>
      <View style={createStyles('flex-row justify-between items-center mb-3')}>
        <Text style={createStyles('text-lg font-bold text-gray-800')}>{item.name}</Text>
        {isAdmin() && (
          <View style={createStyles('flex-row items-center')}>
            <TouchableOpacity 
              style={createStyles('p-2 ml-2')} 
              onPress={() => openEditModal(item)}
            >
              <Ionicons name="create-outline" size={20} color="#16a34a" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={createStyles('p-2 ml-2')} 
              onPress={() => confirmDelete(item)}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={createStyles('mb-4')}>
        {item.location && (
          <View style={createStyles('flex-row items-center mb-2')}>
            <Ionicons name="location-outline" size={16} color="#6b7280" />
            <Text style={createStyles('text-sm text-gray-600 ml-2')}>{item.location}</Text>
          </View>
        )}
        <View style={createStyles('flex-row items-center mb-2')}>
          <Ionicons name="resize-outline" size={16} color="#6b7280" />
          <Text style={createStyles('text-sm text-gray-600 ml-2')}>{item.size || 0} hectáreas</Text>
        </View>
        <View style={createStyles('flex-row items-center mb-2')}>
          <Ionicons name="browsers-outline" size={16} color="#6b7280" />
          <Text style={createStyles('text-sm text-gray-600 ml-2')}>{item.cattleCount || 0} animales</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={createStyles('flex-row items-center justify-center bg-blue-500 py-3 px-4 rounded-lg')}
        onPress={() => handleViewCattle(item)}
      >
        <Ionicons name="eye-outline" size={16} color="#ffffff" />
        <Text style={createStyles('text-white text-sm font-medium ml-2')}>Ver Ganado</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={createStyles('flex-1 bg-gray-50')}>
      {/* Header */}
      <View style={createStyles('bg-green-600 pt-10 pb-6 px-5')}>
        <Text style={createStyles('text-2xl font-bold text-white mb-1')}>Granjas</Text>
        <Text style={createStyles('text-base text-white opacity-90')}>
          Gestiona tus granjas y visualiza el ganado
        </Text>
      </View>

      {loading ? (
        <View style={createStyles('flex-1 justify-center items-center')}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={createStyles('text-gray-600 mt-3')}>Cargando granjas...</Text>
        </View>
      ) : (
        <>
          {errorMessage ? (
            <View style={createStyles('bg-red-50 border-l-4 border-red-500 p-4 mx-4 mt-4')}>
              <Text style={createStyles('text-red-700 text-sm')}>{errorMessage}</Text>
            </View>
          ) : null}

          <FlatList
            data={farms}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            contentContainerStyle={createStyles('py-4')}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={createStyles('flex-1 justify-center items-center py-20')}>
                <Ionicons name="leaf-outline" size={64} color="#d1d5db" />
                <Text style={createStyles('text-xl text-gray-500 mt-4 text-center')}>
                  No tienes granjas registradas
                </Text>
                <Text style={createStyles('text-base text-gray-400 mt-2 text-center')}>
                  {(userInfo?.id_premium === 2 || userInfo?.id_premium === 3)
                    ? 'Agrega una nueva granja para comenzar'
                    : 'Agrega tu primera granja (máximo 1 para usuarios no premium)'
                  }
                </Text>
              </View>
            }
          />

          {/* Botón flotante para agregar - Solo para administradores */}
          {isAdmin() && (
            <TouchableOpacity 
              style={createStyles('absolute bottom-5 right-5 bg-green-600 w-14 h-14 rounded-full justify-center items-center shadow-lg')}
              onPress={() => {
                const isPremium = userInfo?.id_premium === 2 || userInfo?.id_premium === 3; // 2 = Premium, 3 = Empleado
                if (!isPremium && farms && farms.length >= 1) {
                  setShowPremiumModal(true);
                } else {
                  setModalVisible(true);
                }
              }}
            >
              <Ionicons name="add" size={28} color="#ffffff" />
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Modal para agregar/editar granja */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={createStyles('flex-1 justify-center bg-black bg-opacity-50 px-5')}>
          <View style={createStyles('bg-white rounded-lg p-6')}>
            <Text style={createStyles('text-xl font-bold text-gray-800 mb-6 text-center')}>
              {editingFarm ? 'Editar Granja' : 'Agregar Granja'}
            </Text>

            <Text style={createStyles('text-base font-medium text-gray-700 mb-2')}>Nombre</Text>
            <TextInput 
              style={createStyles('border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base')}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Nombre de la granja"
              placeholderTextColor="#9ca3af"
            />

            <Text style={createStyles('text-base font-medium text-gray-700 mb-2')}>Tamaño (hectáreas)</Text>
            <TextInput 
              style={createStyles('border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base')}
              value={formData.size}
              onChangeText={(text) => setFormData({ ...formData, size: text })}
              placeholder="Ej. 150"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />

            {errorMessage ? (
              <Text style={createStyles('text-red-500 text-sm text-center mb-4')}>{errorMessage}</Text>
            ) : null}

            <View style={createStyles('flex-row justify-between')}>
              <TouchableOpacity 
                style={createStyles('flex-1 bg-gray-100 py-3 px-4 rounded-lg mr-2 border border-gray-300')}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                  setErrorMessage('');
                }}
              >
                <Text style={createStyles('text-gray-700 text-center font-medium')}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={createStyles('flex-1 bg-green-600 py-3 px-4 rounded-lg ml-2')}
                onPress={handleCreateFarm}
              >
                <Text style={createStyles('text-white text-center font-medium')}>Guardar</Text>
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
        <View style={createStyles('flex-1 justify-center items-center bg-black bg-opacity-50 px-5')}>
          <View style={createStyles('bg-white rounded-lg p-6 max-w-sm w-full')}>
            <Text style={createStyles('text-base text-gray-800 text-center mb-6')}>{modalMessage}</Text>
            <TouchableOpacity 
              style={createStyles('bg-green-600 py-3 px-4 rounded-lg')} 
              onPress={closeModal}
            >
              <Text style={createStyles('text-white text-center font-medium')}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Premium */}
      <PremiumUpgradeModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        title="¡Actualiza tu cuenta a Premium!"
        subtitle="Los usuarios no premium solo pueden tener máximo 1 granja. Actualiza a premium para agregar granjas ilimitadas."
      />
      
      {/* Modal personalizado */}
      <ModalComponent />
    </View>
  );
} 