import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../components/AuthContext';
import { useUserFarms, useCacheManager } from '../../hooks/useCachedData';
import { useCustomModal } from '../../components/CustomModal';
import { createStyles, tw } from '../../styles/tailwind';
import api from '../../lib/services/api';

interface CattleFormData {
  identificationNumber: string;
  name: string;
  gender: string;
  weight: string;
  notes: string;
  purchasePrice: string;
  farmId: string;
  healthStatus: string;
  tipoProduccion: string;
}

export default function AddCattlePage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cattleId = params?.id as string || null;
  const isEditMode = !!cattleId;
  
  const { userInfo } = useAuth();
  const { invalidateCache } = useCacheManager();
  const { showSuccess, showError, showConfirm, ModalComponent } = useCustomModal();
  
  // Usar hook para obtener granjas
  const { data: farms, loading: loadingFarms } = useUserFarms();

  // Estados del formulario
  const [formData, setFormData] = useState<CattleFormData>({
    identificationNumber: '',
    name: '',
    gender: '',
    weight: '',
    notes: '',
    purchasePrice: '',
    farmId: '',
    healthStatus: 'Saludable',
    tipoProduccion: 'leche'
  });

  const [loading, setLoading] = useState(false);
  const [loadingCattle, setLoadingCattle] = useState(isEditMode);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Estilos usando Tailwind
  const styles = {
    container: createStyles('flex-1 bg-gray-50'),
    header: createStyles('bg-green-600 pt-12 pb-6 px-5'),
    title: createStyles('text-2xl font-bold text-white text-center'),
    content: createStyles('p-5'),
    section: createStyles('mb-6'),
    sectionTitle: createStyles('text-lg font-bold text-gray-800 mb-3'),
    label: createStyles('text-base font-medium text-gray-700 mb-2'),
    input: createStyles('bg-white border border-gray-300 rounded-lg px-4 py-3 text-base'),
    textArea: createStyles('bg-white border border-gray-300 rounded-lg px-4 py-3 text-base h-24'),
    optionsContainer: createStyles('flex-row flex-wrap'),
    optionButton: createStyles('px-4 py-2 rounded-full border border-gray-300 bg-white mr-2 mb-2'),
    selectedOption: createStyles('bg-green-600 border-green-600'),
    optionText: createStyles('text-sm text-gray-700'),
    selectedOptionText: createStyles('text-white'),
    farmSelector: createStyles('space-y-2'),
    farmOption: createStyles('p-4 border border-gray-300 rounded-lg bg-white'),
    selectedFarm: createStyles('border-green-600 bg-green-50'),
    farmText: createStyles('text-base text-gray-800'),
    selectedFarmText: createStyles('text-green-800 font-medium'),
    buttonsContainer: createStyles('flex-row justify-between mt-6'),
    button: createStyles('flex-1 py-3 rounded-lg mx-1'),
    cancelButton: createStyles('bg-gray-500'),
    saveButton: createStyles('bg-green-600'),
    deleteButton: createStyles('bg-red-600 mt-4'),
    buttonText: createStyles('text-white text-center font-medium text-base'),
    loadingContainer: createStyles('flex-1 justify-center items-center'),
    loadingText: createStyles('text-gray-600 mt-3'),
    modalOverlay: createStyles('flex-1 justify-center items-center bg-black bg-opacity-50'),
    modalContent: createStyles('bg-white rounded-lg p-6 mx-5 w-4/5'),
    modalTitle: createStyles('text-lg font-bold text-center mb-3'),
    modalText: createStyles('text-gray-600 text-center mb-6'),
    modalButtons: createStyles('flex-row justify-between'),
    modalButton: createStyles('flex-1 py-3 rounded-lg mx-1'),
  };

  // Cargar datos del ganado en modo edición
  useEffect(() => {
    const loadCattleData = async () => {
      if (!isEditMode || !cattleId) return;
      
      try {
        setLoadingCattle(true);
        const cattleData = await api.cattle.getById(cattleId);
        
        if (cattleData) {
          setFormData({
            identificationNumber: cattleData.identificationNumber || cattleData.numero_identificacion || '',
            name: cattleData.name || cattleData.nombre || '',
            gender: cattleData.gender || (cattleData.id_genero === 1 ? 'Macho' : cattleData.id_genero === 2 ? 'Hembra' : ''),
            weight: '', // No hay campo de peso en CattleItem
            notes: cattleData.notes || cattleData.nota || '',
            purchasePrice: cattleData.precio_compra?.toString() || '',
            farmId: cattleData.farmId || '',
            healthStatus: cattleData.healthStatus || (cattleData.id_estado_salud === 1 ? 'Saludable' : cattleData.id_estado_salud === 2 ? 'Enfermo' : 'En tratamiento'),
            tipoProduccion: cattleData.id_produccion === 1 ? 'leche' : cattleData.id_produccion === 2 ? 'carne' : 'leche'
          });
        }
      } catch (error) {
        console.error('Error al cargar datos del ganado:', error);
        showError('Error', 'No se pudieron cargar los datos del ganado');
      } finally {
        setLoadingCattle(false);
      }
    };
    
    loadCattleData();
  }, [cattleId, isEditMode]);

  // Establecer granja por defecto
  useEffect(() => {
    if (farms && farms.length > 0 && !formData.farmId && !isEditMode) {
      setFormData(prev => ({ ...prev, farmId: farms[0]._id }));
    }
  }, [farms, formData.farmId, isEditMode]);

  const updateFormData = (field: keyof CattleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    router.back();
  };

  const handleSave = async () => {
    try {
      // Validaciones
      if (!formData.identificationNumber.trim()) {
        showError('Campo requerido', 'Por favor, ingresa un número de identificación');
        return;
      }
      
      if (!formData.name.trim()) {
        showError('Campo requerido', 'Por favor, ingresa un nombre para el ganado');
        return;
      }
      
      if (!formData.farmId) {
        showError('Granja requerida', 'Por favor, selecciona una granja');
        return;
      }

      setLoading(true);

      const cattleData = {
        identificationNumber: formData.identificationNumber.trim(),
        name: formData.name.trim(),
        gender: formData.gender,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        notes: formData.notes.trim(),
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
        healthStatus: formData.healthStatus,
        tipoProduccion: formData.tipoProduccion,
        farmId: formData.farmId
      };

      if (isEditMode) {
        await api.cattle.update(cattleId!, cattleData);
        showSuccess('Éxito', 'Ganado actualizado correctamente', () => {
          invalidateCache('cattle');
          router.back();
        });
      } else {
        await api.cattle.create(cattleData);
        showSuccess('Éxito', 'Ganado registrado correctamente', () => {
          invalidateCache('cattle');
          router.back();
        });
      }
    } catch (error: any) {
      console.error('Error al guardar ganado:', error);
      showError('Error', error.message || 'No se pudo guardar el ganado');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.cattle.delete(cattleId!);
      showSuccess('Éxito', 'Ganado eliminado correctamente', () => {
        invalidateCache('cattle');
        router.back();
      });
    } catch (error: any) {
      console.error('Error al eliminar ganado:', error);
      showError('Error', 'No se pudo eliminar el ganado');
    }
  };

  const confirmDelete = () => {
    setDeleteModalVisible(false);
    showConfirm(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este ganado? Esta acción no se puede deshacer.',
      handleDelete,
      'Eliminar',
      'Cancelar'
    );
  };

  const renderOptionButtons = (options: string[], selectedValue: string, onSelect: (value: string) => void) => (
    <View style={styles.optionsContainer}>
      {options.map(option => (
        <TouchableOpacity
          key={option}
          style={[styles.optionButton, selectedValue === option && styles.selectedOption]}
          onPress={() => onSelect(option)}
        >
          <Text style={[styles.optionText, selectedValue === option && styles.selectedOptionText]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loadingCattle) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tw.colors.primary} />
        <Text style={styles.loadingText}>Cargando datos del ganado...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isEditMode ? 'Editar Ganado' : 'Registrar Nuevo Ganado'}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Información básica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información básica</Text>

          <Text style={styles.label}>Número de Identificación *</Text>
          <TextInput
            style={styles.input}
            value={formData.identificationNumber}
            onChangeText={(value) => updateFormData('identificationNumber', value)}
            placeholder="Número de identificación"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(value) => updateFormData('name', value)}
            placeholder="Nombre del animal"
          />

          <Text style={styles.label}>Género</Text>
          {renderOptionButtons(['Macho', 'Hembra'], formData.gender, (value) => updateFormData('gender', value))}

          <Text style={styles.label}>Estado de Salud</Text>
          {renderOptionButtons(['Saludable', 'Enfermo', 'En tratamiento'], formData.healthStatus, (value) => updateFormData('healthStatus', value))}

          <Text style={styles.label}>Tipo de Producción</Text>
          {renderOptionButtons(['Leche', 'Carne'], formData.tipoProduccion, (value) => updateFormData('tipoProduccion', value.toLowerCase()))}

          <Text style={styles.label}>Peso (kg)</Text>
          <TextInput
            style={styles.input}
            value={formData.weight}
            onChangeText={(value) => updateFormData('weight', value)}
            placeholder="Peso en kilogramos"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Precio de compra</Text>
          <TextInput
            style={styles.input}
            value={formData.purchasePrice}
            onChangeText={(value) => updateFormData('purchasePrice', value)}
            placeholder="Precio de compra"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Notas</Text>
          <TextInput
            style={styles.textArea}
            value={formData.notes}
            onChangeText={(value) => updateFormData('notes', value)}
            placeholder="Información adicional sobre el animal"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Asignación a Granja */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Asignación a Granja</Text>
          <Text style={styles.label}>Granja *</Text>
          
          {loadingFarms ? (
            <View style={createStyles('p-4 items-center')}>
              <ActivityIndicator size="small" color={tw.colors.primary} />
              <Text style={styles.loadingText}>Cargando granjas...</Text>
            </View>
          ) : farms && farms.length > 0 ? (
            <View style={styles.farmSelector}>
              {farms.map((farm) => (
                <TouchableOpacity
                  key={farm._id}
                  style={[styles.farmOption, formData.farmId === farm._id && styles.selectedFarm]}
                  onPress={() => updateFormData('farmId', farm._id)}
                >
                  <Text style={[styles.farmText, formData.farmId === farm._id && styles.selectedFarmText]}>
                    {farm.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={createStyles('p-4 bg-red-50 rounded-lg border border-red-200')}>
              <Text style={createStyles('text-red-700 text-center')}>
                No hay granjas disponibles. Por favor, crea una granja primero.
              </Text>
            </View>
          )}
        </View>

        {/* Botones */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={handleCancel}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.saveButton]} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isEditMode ? 'Actualizar' : 'Guardar'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Botón de eliminar en modo edición */}
        {isEditMode && (
          <TouchableOpacity 
            style={[styles.button, styles.deleteButton]} 
            onPress={() => setDeleteModalVisible(true)}
          >
            <Text style={styles.buttonText}>Eliminar Ganado</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal de confirmación de eliminación */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar eliminación</Text>
            <Text style={styles.modalText}>
              ¿Estás seguro de que quieres eliminar este ganado? Esta acción no se puede deshacer.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, createStyles('bg-gray-500')]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, createStyles('bg-red-600')]}
                onPress={confirmDelete}
              >
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Modal personalizado */}
      <ModalComponent />
    </ScrollView>
  );
}
