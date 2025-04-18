import React, { useState } from 'react';
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
import { milkSaleStyles } from '../styles/milkSaleStyles';
import { Ionicons } from '@expo/vector-icons';

const MilkSaleScreen = () => {
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

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.date;
    setShowDatePicker(Platform.OS === 'ios');
    setFormData({ ...formData, date: currentDate });
  };

  const calculateTotal = (liters, price) => {
    const total = parseFloat(liters) * parseFloat(price);
    return isNaN(total) ? '' : total.toString();
  };

  const handleLitersChange = (text) => {
    const newTotal = calculateTotal(text, formData.pricePerLiter);
    setFormData({ 
      ...formData, 
      liters: text,
      totalAmount: newTotal
    });
  };

  const handlePriceChange = (text) => {
    const newTotal = calculateTotal(formData.liters, text);
    setFormData({ 
      ...formData, 
      pricePerLiter: text,
      totalAmount: newTotal
    });
  };

  const handleSave = () => {
    if (!formData.customer || !formData.liters || !formData.pricePerLiter) {
      Alert.alert('Error', 'Por favor complete todos los campos requeridos');
      return;
    }

    // Aquí irá la lógica para guardar la venta
    Alert.alert('Éxito', 'Venta de leche registrada correctamente');
    router.back();
  };

  return (
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
            style={milkSaleStyles.input}
            value={formData.liters}
            onChangeText={handleLitersChange}
            placeholder="Cantidad en litros"
            keyboardType="numeric"
          />
        </View>

        <View style={milkSaleStyles.inputContainer}>
          <Text style={milkSaleStyles.label}>Precio por litro *</Text>
          <TextInput
            style={milkSaleStyles.input}
            value={formData.pricePerLiter}
            onChangeText={handlePriceChange}
            placeholder="Precio por litro"
            keyboardType="numeric"
          />
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
    </ScrollView>
  );
};

export default MilkSaleScreen;