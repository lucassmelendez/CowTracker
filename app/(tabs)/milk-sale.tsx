import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Platform,
  Modal,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { milkSaleStyles } from '../../src/styles/milkSaleStyles';
import { Ionicons } from '@expo/vector-icons';

export default function MilkSaleTab() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    date: new Date(),
    customer: '',
    liters: '',
    pricePerLiter: '',
    totalAmount: '',
    notes: ''
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Estados para validación de campos numéricos
  const [litersError, setLitersError] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const [validationModalVisible, setValidationModalVisible] = useState(false);

  // Función de validación numérica
  const validateNumericInput = (text: string) => {
    // Permitir números enteros y decimales (con punto o coma)
    return /^[0-9]*[.,]?[0-9]*$/.test(text);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || formData.date;
    setShowDatePicker(Platform.OS === 'ios');
    setFormData({ ...formData, date: currentDate });
  };

  const calculateTotal = (liters: string, price: string) => {
    const total = parseFloat(liters) * parseFloat(price);
    return isNaN(total) ? '' : total.toString();
  };

  const handleLitersChange = (text: string) => {
    // Validar entrada numérica
    if (text.trim() !== '') {
      setLitersError(!validateNumericInput(text));
    } else {
      setLitersError(false);
    }
    
    const newTotal = calculateTotal(text, formData.pricePerLiter);
    setFormData({ 
      ...formData, 
      liters: text,
      totalAmount: newTotal
    });
  };

  const handlePriceChange = (text: string) => {
    // Validar entrada numérica
    if (text.trim() !== '') {
      setPriceError(!validateNumericInput(text));
    } else {
      setPriceError(false);
    }
    
    const newTotal = calculateTotal(formData.liters, text);
    setFormData({ 
      ...formData,
      pricePerLiter: text,
      totalAmount: newTotal
    });
  };

  const handleSave = () => {
    // Verificar si hay errores de validación numérica O campos vacíos
    const hasValidationErrors = litersError || priceError;
    const hasEmptyFields = !formData.customer || !formData.liters || !formData.pricePerLiter;
    
    if (hasValidationErrors || hasEmptyFields) {
      setValidationModalVisible(true);
      return;
    }

    // Aquí irá la lógica para guardar la venta
    Alert.alert('Éxito', 'Venta de leche registrada correctamente');
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView style={milkSaleStyles.container}>
        <View style={milkSaleStyles.header}>
          <Text style={milkSaleStyles.headerText}>Registrar Venta de Leche</Text>
        </View>

        <View style={milkSaleStyles.form}>
          <View style={milkSaleStyles.inputContainer}>
            <Text style={milkSaleStyles.label}>Fecha de venta</Text>
            <TouchableOpacity 
              style={milkSaleStyles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={milkSaleStyles.dateText}>
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

          <View style={milkSaleStyles.inputContainer}>
            <Text style={milkSaleStyles.label}>Comprador *</Text>
            <TextInput
              style={milkSaleStyles.input}
              value={formData.customer}
              onChangeText={(text) => setFormData({ ...formData, customer: text })}
              placeholder="Nombre del comprador"
            />
          </View>

          <View style={milkSaleStyles.inputContainer}>
            <Text style={milkSaleStyles.label}>Cantidad de litros *</Text>
            <TextInput
              style={litersError ? milkSaleStyles.inputError : milkSaleStyles.input}
              value={formData.liters}
              onChangeText={handleLitersChange}
              placeholder="Cantidad en litros"
              keyboardType="numeric"
            />
            {litersError && (
              <Text style={milkSaleStyles.errorText}>
                Solo se permiten números en este campo
              </Text>
            )}
          </View>

          <View style={milkSaleStyles.inputContainer}>
            <Text style={milkSaleStyles.label}>Precio por litro *</Text>
            <TextInput
              style={priceError ? milkSaleStyles.inputError : milkSaleStyles.input}
              value={formData.pricePerLiter}
              onChangeText={handlePriceChange}
              placeholder="Precio por litro"
              keyboardType="numeric"
            />
            {priceError && (
              <Text style={milkSaleStyles.errorText}>
                Solo se permiten números en este campo
              </Text>
            )}
          </View>

          <View style={milkSaleStyles.inputContainer}>
            <Text style={milkSaleStyles.label}>Monto total</Text>
            <TextInput
              style={milkSaleStyles.input}
              value={formData.totalAmount}
              editable={false}
              placeholder="0.00"
            />
          </View>

          <View style={milkSaleStyles.inputContainer}>
            <Text style={milkSaleStyles.label}>Notas</Text>
            <TextInput
              style={[milkSaleStyles.input, milkSaleStyles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Detalles adicionales de la venta"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={milkSaleStyles.buttonContainer}>
            <TouchableOpacity 
              style={milkSaleStyles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={milkSaleStyles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={milkSaleStyles.saveButton}
              onPress={handleSave}
            >
              <Text style={milkSaleStyles.saveButtonText}>Guardar</Text>
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
          <View style={milkSaleStyles.modalOverlay}>
            <View style={milkSaleStyles.validationModalContent}>
              <View style={milkSaleStyles.validationModalHeader}>
                <Ionicons name="warning" size={50} color="#e74c3c" />
                <Text style={milkSaleStyles.validationModalTitle}>
                  Formulario Incompleto
                </Text>
              </View>
              
              <View style={milkSaleStyles.validationModalBody}>
                <Text style={milkSaleStyles.validationModalText}>
                  Por favor, corrige los siguientes errores antes de guardar:
                </Text>
                <View style={milkSaleStyles.errorsList}>
                  {litersError && (
                    <View style={milkSaleStyles.errorItem}>
                      <Ionicons name="close-circle" size={16} color="#e74c3c" />
                      <Text style={milkSaleStyles.errorItemText}>
                        La cantidad de litros debe contener solo números
                      </Text>
                    </View>
                  )}
                  {priceError && (
                    <View style={milkSaleStyles.errorItem}>
                      <Ionicons name="close-circle" size={16} color="#e74c3c" />
                      <Text style={milkSaleStyles.errorItemText}>
                        El precio por litro debe contener solo números
                      </Text>
                    </View>
                  )}
                  {!formData.customer && (
                    <View style={milkSaleStyles.errorItem}>
                      <Ionicons name="close-circle" size={16} color="#e74c3c" />
                      <Text style={milkSaleStyles.errorItemText}>
                        El campo comprador es requerido
                      </Text>
                    </View>
                  )}
                  {!formData.liters && (
                    <View style={milkSaleStyles.errorItem}>
                      <Ionicons name="close-circle" size={16} color="#e74c3c" />
                      <Text style={milkSaleStyles.errorItemText}>
                        El campo cantidad de litros es requerido
                      </Text>
                    </View>
                  )}
                  {!formData.pricePerLiter && (
                    <View style={milkSaleStyles.errorItem}>
                      <Ionicons name="close-circle" size={16} color="#e74c3c" />
                      <Text style={milkSaleStyles.errorItemText}>
                        El campo precio por litro es requerido
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={milkSaleStyles.validationModalButtons}>
                <TouchableOpacity
                  style={milkSaleStyles.validationModalButton}
                  onPress={() => setValidationModalVisible(false)}
                >
                  <Text style={milkSaleStyles.validationModalButtonText}>Entendido</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});