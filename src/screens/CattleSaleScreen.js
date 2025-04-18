import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { cattleSaleStyles } from '../styles/cattleSaleStyles';
import { Ionicons } from '@expo/vector-icons';

const CattleSaleScreen = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    date: new Date(),
    customer: '',
    selectedCattle: [],
    totalAmount: '',
    notes: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.date;
    setShowDatePicker(Platform.OS === 'ios');
    setFormData({ ...formData, date: currentDate });
  };

  const handleSave = () => {
    if (!formData.customer || !formData.selectedCattle.length || !formData.totalAmount) {
      Alert.alert('Error', 'Por favor complete todos los campos requeridos');
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
        </View>

        <View style={cattleSaleStyles.inputContainer}>
          <Text style={cattleSaleStyles.label}>Monto total *</Text>
          <TextInput
            style={cattleSaleStyles.input}
            value={formData.totalAmount}
            onChangeText={(text) => setFormData({ ...formData, totalAmount: text })}
            placeholder="Ingrese el monto total"
            keyboardType="numeric"
          />
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
    </ScrollView>
  );
};

export default CattleSaleScreen;