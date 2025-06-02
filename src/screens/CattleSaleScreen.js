import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Platform,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { cattleSaleStyles } from '../styles/cattleSaleStyles';
import { Ionicons } from '@expo/vector-icons';

const CattleSaleScreen = () => {
  const router = useRouter();  const [formData, setFormData] = useState({
    date: new Date(),
    customer: '',
    selectedCattle: [],
    totalAmount: '',
    notes: ''
  });  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Estados para validación de campos numéricos
  const [totalAmountError, setTotalAmountError] = useState(false);
  const [validationModalVisible, setValidationModalVisible] = useState(false);

  // Función de validación numérica
  const validateNumericInput = (text) => {
    // Permitir números enteros y decimales (con punto o coma)
    return /^[0-9]*[.,]?[0-9]*$/.test(text);
  };

  const handleTotalAmountChange = (text) => {
    // Validar entrada numérica
    if (text.trim() !== '') {
      setTotalAmountError(!validateNumericInput(text));
    } else {
      setTotalAmountError(false);
    }
    
    setFormData({ ...formData, totalAmount: text });
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.date;
    setShowDatePicker(Platform.OS === 'ios');
    setFormData({ ...formData, date: currentDate });
  };  const handleSave = () => {
    // Verificar si hay errores de validación numérica O campos vacíos
    const hasValidationErrors = totalAmountError;
    const hasEmptyFields = !formData.customer || !formData.totalAmount;
    
    if (hasValidationErrors || hasEmptyFields) {
      setValidationModalVisible(true);
      return;
    }

    // Aquí irá la lógica para guardar la venta
    Alert.alert('Éxito', 'Venta registrada correctamente');
    router.back();
  };

  return (
    <ScrollView style={cattleSaleStyles.container}>
      <View style={cattleSaleStyles.header}>
        <Text style={cattleSaleStyles.headerText}>Registrar Venta de Ganado</Text>
      </View>

      <View style={cattleSaleStyles.form}>
        <View style={cattleSaleStyles.inputContainer}>
          <Text style={cattleSaleStyles.label}>Fecha de venta</Text>
          <TouchableOpacity 
            style={cattleSaleStyles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={cattleSaleStyles.dateText}>
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

        <View style={cattleSaleStyles.inputContainer}>
          <Text style={cattleSaleStyles.label}>Comprador *</Text>
          <TextInput
            style={cattleSaleStyles.input}
            value={formData.customer}
            onChangeText={(text) => setFormData({ ...formData, customer: text })}
            placeholder="Nombre del comprador"
          />
        </View>        <View style={cattleSaleStyles.inputContainer}>
          <Text style={cattleSaleStyles.label}>Monto total *</Text>
          <TextInput
            style={totalAmountError ? cattleSaleStyles.inputError : cattleSaleStyles.input}
            value={formData.totalAmount}
            onChangeText={handleTotalAmountChange}
            placeholder="Ingrese el monto total"
            keyboardType="numeric"
          />
          {totalAmountError && (
            <Text style={cattleSaleStyles.errorText}>
              Solo se permiten números en este campo
            </Text>
          )}
        </View>

        <View style={cattleSaleStyles.inputContainer}>
          <Text style={cattleSaleStyles.label}>Notas</Text>
          <TextInput
            style={[cattleSaleStyles.input, cattleSaleStyles.textArea]}
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            placeholder="Detalles adicionales de la venta"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={cattleSaleStyles.buttonContainer}>
          <TouchableOpacity 
            style={cattleSaleStyles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={cattleSaleStyles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={cattleSaleStyles.saveButton}
            onPress={handleSave}
          >
            <Text style={cattleSaleStyles.saveButtonText}>Guardar</Text>
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
        <View style={cattleSaleStyles.modalOverlay}>
          <View style={cattleSaleStyles.validationModalContent}>
            <View style={cattleSaleStyles.validationModalHeader}>
              <Ionicons name="warning" size={50} color="#e74c3c" />
              <Text style={cattleSaleStyles.validationModalTitle}>
                Formulario Incompleto
              </Text>
            </View>
              <View style={cattleSaleStyles.validationModalBody}>
              <Text style={cattleSaleStyles.validationModalText}>
                Por favor, corrige los siguientes errores antes de guardar:
              </Text>
              <View style={cattleSaleStyles.errorsList}>
                {totalAmountError && (
                  <View style={cattleSaleStyles.errorItem}>
                    <Ionicons name="close-circle" size={16} color="#e74c3c" />
                    <Text style={cattleSaleStyles.errorItemText}>
                      El monto total debe contener solo números
                    </Text>
                  </View>
                )}
                {!formData.customer && (
                  <View style={cattleSaleStyles.errorItem}>
                    <Ionicons name="close-circle" size={16} color="#e74c3c" />
                    <Text style={cattleSaleStyles.errorItemText}>
                      El campo comprador es requerido
                    </Text>
                  </View>
                )}
                {!formData.totalAmount && (
                  <View style={cattleSaleStyles.errorItem}>
                    <Ionicons name="close-circle" size={16} color="#e74c3c" />
                    <Text style={cattleSaleStyles.errorItemText}>
                      El campo monto total es requerido
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={cattleSaleStyles.validationModalButtons}>
              <TouchableOpacity
                style={cattleSaleStyles.validationModalButton}
                onPress={() => setValidationModalVisible(false)}
              >
                <Text style={cattleSaleStyles.validationModalButtonText}>Entendido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default CattleSaleScreen;