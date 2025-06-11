import React, { useState, useEffect} from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  Modal,
  StyleSheet,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useCustomModal } from '../../components/CustomModal';
import { useAuth } from '../../components/AuthContext';
import { useFarm } from '../../components/FarmContext';

interface Ganado {
  id_ganado: number;
  nombre: string;
  numero_identificacion: string;
  id_produccion: number;
}

export default function CattleSaleTab() {
  const router = useRouter();
  const { showSuccess, ModalComponent } = useCustomModal();
  const { userInfo } = useAuth();
  const { selectedFarm } = useFarm();
  
  const [formData, setFormData] = useState({
    date: new Date(),
    customer: '',
    selectedCattle: [] as number[],
    totalAmount: '',
    notes: ''
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [ganados, setGanados] = useState<Ganado[]>([]);
  const [loadingGanados, setLoadingGanados] = useState(false);
  const [showCattleSelector, setShowCattleSelector] = useState(false);
  
  // Estados para validación de campos numéricos
  const [totalAmountError, setTotalAmountError] = useState(false);
  const [validationModalVisible, setValidationModalVisible] = useState(false);

  // Cargar ganados cuando se selecciona una granja
  useEffect(() => {
    if (selectedFarm?.id_finca) {
      loadGanados();
    }
  }, [selectedFarm]);

  const loadGanados = async () => {
    if (!selectedFarm?.id_finca) return;
    
    setLoadingGanados(true);
    try {
      const response = await fetch(`https://ct-backend-gray.vercel.app/api/farms/${selectedFarm.id_finca}/cattle`, {
        headers: {
          'Authorization': `Bearer ${userInfo?.token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        // El backend devuelve una estructura con { data: [...], success: true, ... }
        const allGanados = result.data || [];
        // Para venta de ganado, solo mostrar ganado con id_produccion = 2 (ganado para venta)
        const ganadosVenta = allGanados.filter((ganado: Ganado) => ganado.id_produccion === 2);
        setGanados(ganadosVenta);
      } else {
        console.error('Error al cargar ganados:', response.status);
        setGanados([]);
      }
    } catch (error) {
      console.error('Error al cargar ganados:', error);
      setGanados([]);
    } finally {
      setLoadingGanados(false);
    }
  };

  // Función de validación numérica
  const validateNumericInput = (text: string) => {
    // Permitir números enteros y decimales (con punto o coma)
    return /^[0-9]*[.,]?[0-9]*$/.test(text);
  };

  const handleTotalAmountChange = (text: string) => {
    // Validar entrada numérica
    if (text.trim() !== '') {
      setTotalAmountError(!validateNumericInput(text));
    } else {
      setTotalAmountError(false);
    }
    
    setFormData({ ...formData, totalAmount: text });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || formData.date;
    setShowDatePicker(Platform.OS === 'ios');
    setFormData({ ...formData, date: currentDate });
  };

  const toggleCattleSelection = (ganadoId: number) => {
    const currentSelection = [...formData.selectedCattle];
    const index = currentSelection.indexOf(ganadoId);
    
    if (index > -1) {
      currentSelection.splice(index, 1);
    } else {
      currentSelection.push(ganadoId);
    }
    
    setFormData({ ...formData, selectedCattle: currentSelection });
  };

  const getSelectedCattleNames = () => {
    return ganados
      .filter(g => formData.selectedCattle.includes(g.id_ganado))
      .map(g => g.nombre)
      .join(', ');
  };

  const handleSave = async () => {
    // Verificar si hay errores de validación numérica O campos vacíos
    const hasValidationErrors = totalAmountError;
    const hasEmptyFields = !formData.customer || !formData.totalAmount || formData.selectedCattle.length === 0;
    
    if (hasValidationErrors || hasEmptyFields) {
      setValidationModalVisible(true);
      return;
    }

    try {
      // Preparar datos para venta de ganado usando la nueva API
      const ventaData = {
        cantidad: formData.selectedCattle.length, // Cantidad = número de ganado seleccionado
        precio_unitario: parseFloat(formData.totalAmount) / formData.selectedCattle.length, // Precio unitario promedio
        total: parseFloat(formData.totalAmount),
        comprador: formData.customer,
        ganados: formData.selectedCattle // IDs de ganado seleccionado
      };

      // Llamar a la API del backend
      const response = await fetch(`https://ct-backend-gray.vercel.app/api/ventas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify(ventaData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error al guardar venta de ganado:', errorData);
        return;
      }

      const result = await response.json();
      console.log('Venta de ganado creada:', result);

      showSuccess('Éxito', 'Venta de ganado registrada correctamente', () => {
        // Reset form
        setFormData({
          date: new Date(),
          customer: '',
          selectedCattle: [],
          totalAmount: '',
          notes: ''
        });
        router.back();
      });
    } catch (err) {
      console.error('Excepción al guardar venta de ganado:', err);
    }
  };

  const renderCattleItem = ({ item }: { item: Ganado }) => {
    const isSelected = formData.selectedCattle.includes(item.id_ganado);
    
    return (
      <TouchableOpacity
        style={[styles.cattleItem, isSelected && styles.cattleItemSelected]}
        onPress={() => toggleCattleSelection(item.id_ganado)}
      >
        <View style={styles.cattleItemContent}>
          <View style={styles.cattleInfo}>
            <Text style={[styles.cattleName, isSelected && styles.cattleNameSelected]}>
              {item.nombre}
            </Text>
            <Text style={[styles.cattleId, isSelected && styles.cattleIdSelected]}>
              ID: {item.numero_identificacion}
            </Text>
          </View>
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Fecha de venta</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {formData.date.toLocaleDateString()}
              </Text>
              <Ionicons name="calendar" size={24} color="#27ae60" />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={formData.date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Comprador *</Text>
            <TextInput
              style={styles.input}
              value={formData.customer}
              onChangeText={(text) => setFormData({ ...formData, customer: text })}
              placeholder="Nombre del comprador"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Ganado seleccionado *</Text>
            {!selectedFarm ? (
              <View style={styles.noFarmContainer}>
                <Text style={styles.noFarmText}>
                  Selecciona una granja desde el menú principal para ver el ganado disponible
                </Text>
              </View>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.cattleSelectorButton}
                  onPress={() => setShowCattleSelector(true)}
                  disabled={loadingGanados}
                >
                  <Text style={styles.cattleSelectorText}>
                    {formData.selectedCattle.length === 0 
                      ? 'Seleccionar ganado para venta...' 
                      : `${formData.selectedCattle.length} ganado(s) seleccionado(s)`
                    }
                  </Text>
                  {loadingGanados ? (
                    <ActivityIndicator size="small" color="#27ae60" />
                  ) : (
                    <Ionicons name="chevron-down" size={24} color="#27ae60" />
                  )}
                </TouchableOpacity>
                
                {formData.selectedCattle.length > 0 && (
                  <View style={styles.selectedCattleContainer}>
                    <Text style={styles.selectedCattleTitle}>Ganado seleccionado:</Text>
                    <Text style={styles.selectedCattleText}>
                      {getSelectedCattleNames()}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Monto total *</Text>
            <TextInput
              style={totalAmountError ? styles.inputError : styles.input}
              value={formData.totalAmount}
              onChangeText={handleTotalAmountChange}
              placeholder="Ingrese el monto total"
              keyboardType="numeric"
            />
            {totalAmountError && (
              <Text style={styles.errorText}>
                Solo se permiten números en este campo
              </Text>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => router.back()}
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

        {/* Modal selector de ganado */}
        <Modal
          visible={showCattleSelector}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCattleSelector(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.cattleSelectorModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar Ganado para Venta</Text>
                <TouchableOpacity 
                  onPress={() => setShowCattleSelector(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              {loadingGanados ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#27ae60" />
                  <Text style={styles.loadingText}>Cargando ganado...</Text>
                </View>
              ) : ganados.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="warning" size={48} color="#666" />
                  <Text style={styles.emptyText}>
                    No hay ganado para venta disponible en esta granja
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.selectionInfo}>
                    <Text style={styles.selectionText}>
                      {formData.selectedCattle.length} de {ganados.length} seleccionado(s)
                    </Text>
                  </View>
                  
                  <FlatList
                    data={ganados}
                    renderItem={renderCattleItem}
                    keyExtractor={(item) => item.id_ganado.toString()}
                    style={styles.cattleList}
                    showsVerticalScrollIndicator={false}
                  />
                </>
              )}
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setShowCattleSelector(false)}
                >
                  <Text style={styles.modalButtonText}>Confirmar Selección</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal de validación de errores */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={validationModalVisible}
          onRequestClose={() => setValidationModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.validationModalContent}>
              <View style={styles.validationModalHeader}>
                <Ionicons name="warning" size={50} color="#e74c3c" />
                <Text style={styles.validationModalTitle}>
                  Formulario Incompleto
                </Text>
              </View>
              
              <View style={styles.validationModalBody}>
                <Text style={styles.validationModalText}>
                  Por favor, corrige los siguientes errores antes de guardar:
                </Text>
                <View style={styles.errorsList}>
                  {totalAmountError && (
                    <View style={styles.errorItem}>
                      <Ionicons name="close-circle" size={16} color="#e74c3c" />
                      <Text style={styles.errorItemText}>
                        El monto total debe contener solo números
                      </Text>
                    </View>
                  )}
                  {!formData.customer && (
                    <View style={styles.errorItem}>
                      <Ionicons name="close-circle" size={16} color="#e74c3c" />
                      <Text style={styles.errorItemText}>
                        El campo comprador es requerido
                      </Text>
                    </View>
                  )}
                  {!formData.totalAmount && (
                    <View style={styles.errorItem}>
                      <Ionicons name="close-circle" size={16} color="#e74c3c" />
                      <Text style={styles.errorItemText}>
                        El campo monto total es requerido
                      </Text>
                    </View>
                  )}
                  {formData.selectedCattle.length === 0 && (
                    <View style={styles.errorItem}>
                      <Ionicons name="close-circle" size={16} color="#e74c3c" />
                      <Text style={styles.errorItemText}>
                        Debe seleccionar al menos un ganado
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.validationModalButtons}>
                <TouchableOpacity
                  style={styles.validationModalButton}
                  onPress={() => setValidationModalVisible(false)}
                >
                  <Text style={styles.validationModalButtonText}>Entendido</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
      <ModalComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 2,
    borderColor: '#e74c3c',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fdf2f2',
    marginBottom: 4,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginBottom: 8,
    marginTop: 0,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
  },
  noFarmContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  noFarmText: {
    color: '#6c757d',
    textAlign: 'center',
    fontSize: 14,
  },
  cattleSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  cattleSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  selectedCattleContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27ae60',
  },
  selectedCattleTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#27ae60',
    marginBottom: 4,
  },
  selectedCattleText: {
    fontSize: 14,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cattleSelectorModal: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  selectionInfo: {
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    marginBottom: 12,
  },
  selectionText: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '500',
  },
  cattleList: {
    flex: 1,
    maxHeight: 300,
  },
  cattleItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cattleItemSelected: {
    backgroundColor: '#e8f5e8',
    borderColor: '#27ae60',
  },
  cattleItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  cattleInfo: {
    flex: 1,
  },
  cattleName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  cattleNameSelected: {
    color: '#27ae60',
  },
  cattleId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  cattleIdSelected: {
    color: '#1e7e34',
  },
  cattlePrice: {
    fontSize: 13,
    color: '#888',
  },
  cattlePriceSelected: {
    color: '#1e7e34',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },
  modalButtons: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalButton: {
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  // Validation modal styles
  validationModalContent: {
    width: '85%',
    maxWidth: 350,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  validationModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  validationModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    textAlign: 'center',
  },
  validationModalBody: {
    width: '100%',
    marginBottom: 24,
  },
  validationModalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  errorsList: {
    width: '100%',
  },
  errorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdf2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e74c3c',
  },
  errorItemText: {
    fontSize: 13,
    color: '#e74c3c',
    marginLeft: 8,
    flex: 1,
  },
  validationModalButtons: {
    width: '100%',
  },
  validationModalButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  validationModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});