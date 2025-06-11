import React, { useState} from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  Modal,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useCustomModal } from '../../components/CustomModal';
import { useAuth } from '../../components/AuthContext';

export default function CattleSaleTab() {
  const router = useRouter();
  const { showSuccess, ModalComponent } = useCustomModal();
  const { userInfo } = useAuth();
  
  const [formData, setFormData] = useState({
    date: new Date(),
    customer: '',
    selectedCattle: [],
    totalAmount: '',
    notes: ''
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Estados para validación de campos numéricos
  const [totalAmountError, setTotalAmountError] = useState(false);
  const [validationModalVisible, setValidationModalVisible] = useState(false);

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

  const handleSave = async () => {
    // Verificar si hay errores de validación numérica O campos vacíos
    const hasValidationErrors = totalAmountError;
    const hasEmptyFields = !formData.customer || !formData.totalAmount;
    
    if (hasValidationErrors || hasEmptyFields) {
      setValidationModalVisible(true);
      return;
    }

    try {
      // Preparar datos para venta de ganado usando la nueva API
      const ventaData = {
        cantidad: 1, // Para ganado, cantidad siempre es 1 (se entiende como 1 venta de ganado)
        precio_unitario: parseFloat(formData.totalAmount), // El precio unitario será el total
        total: parseFloat(formData.totalAmount),
        comprador: formData.customer,
        ganados: formData.selectedCattle // IDs de ganado seleccionado (si se implementa)
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

      showSuccess('Venta de ganado registrada correctamente', () => {
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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Notas (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Detalles adicionales de la venta"
              multiline
              numberOfLines={4}
            />
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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
  // Modal styles for validation
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
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