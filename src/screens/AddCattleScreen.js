import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getShadowStyle } from '../utils/styles';
import { getAllFarms, createCattle, addCattleToFarm } from '../services/firestore';
import { useAuth } from '../components/AuthContext';

const AddCattleScreen = ({ route }) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cattleId = route?.params?.cattleId || params.id;
  const isEditMode = !!cattleId;
  const { userInfo } = useAuth();

  // Estados para los campos del formulario
  const [identifier, setIdentifier] = useState(isEditMode ? 'BOV-2023-001' : '');
  const [name, setName] = useState(isEditMode ? 'Estrella' : '');
  const [type, setType] = useState(isEditMode ? 'Vaca' : '');
  const [breed, setBreed] = useState(isEditMode ? 'Holstein' : '');
  const [gender, setGender] = useState(isEditMode ? 'Hembra' : '');
  const [weight, setWeight] = useState(isEditMode ? '450' : '');
  const [location, setLocation] = useState(isEditMode ? 'Potrero Norte' : '');
  const [notes, setNotes] = useState(isEditMode ? 'Excelente productora de leche. Vacunada en marzo 2023.' : '');
  const [purchasePrice, setPurchasePrice] = useState(isEditMode ? '1200' : '');
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [farms, setFarms] = useState([]);
  const [loadingFarms, setLoadingFarms] = useState(false);
  
  useEffect(() => {
    // Cargar las granjas disponibles
    const loadFarms = async () => {
      try {
        setLoadingFarms(true);
        if (userInfo && userInfo.uid) {
          const userFarms = await getAllFarms(userInfo.uid);
          setFarms(userFarms);
        }
      } catch (error) {
        console.error('Error al cargar granjas:', error);
        Alert.alert('Error', 'No se pudieron cargar las granjas disponibles');
      } finally {
        setLoadingFarms(false);
      }
    };
    
    if (userInfo) {
      loadFarms();
    }
    
    // Aquí podría ir lógica para cargar datos iniciales si es modo edición
  }, [userInfo]);
  
  // Fechas
  const [dateOfBirth, setDateOfBirth] = useState(isEditMode ? new Date('2020-05-15') : new Date());
  const [purchaseDate, setPurchaseDate] = useState(isEditMode ? new Date('2021-01-10') : new Date());

  // Estado para los selectores de fecha
  const [showDateOfBirthPicker, setShowDateOfBirthPicker] = useState(false);
  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);

  const handleCancel = () => {
    router.back();
  };

  const handleSave = async () => {
    // Validaciones
    if (!identifier || !name || !type || !breed) {
      Alert.alert('Error', 'Por favor, completa los campos obligatorios');
      return;
    }

    if (!selectedFarmId) {
      Alert.alert('Error', 'Por favor, selecciona una granja');
      return;
    }

    try {
      // Verificar que tenemos la información del usuario
      if (!userInfo || !userInfo.uid) {
        Alert.alert('Error', 'No se pudo obtener la información del usuario');
        return;
      }
      
      // Preparar datos del ganado
      const cattleData = {
        identifier,
        name,
        type,
        breed,
        gender,
        weight: parseFloat(weight) || 0,
        location,
        notes,
        purchasePrice: parseFloat(purchasePrice) || 0,
        dateOfBirth,
        purchaseDate,
        status: 'activo',
        healthStatus: 'saludable',
        userId: userInfo.uid,
        farmId: selectedFarmId, // Add farmId directly to cattle data
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Guardar el ganado en Firestore (ahora incluye directamente el farmId)
      const newCattle = await createCattle(cattleData);
      
      // Mostrar alerta y volver atrás
      Alert.alert(
        isEditMode ? 'Ganado Actualizado' : 'Ganado Agregado',
        isEditMode ? 'Los datos se han actualizado correctamente.' : 'El ganado se ha agregado correctamente.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error al guardar ganado:', error);
      Alert.alert('Error', 'No se pudo guardar el ganado. Inténtalo de nuevo.');
    }
  };

  const formatDate = (date) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const onChangeDateOfBirth = (event, selectedDate) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDateOfBirthPicker(Platform.OS === 'ios');
    setDateOfBirth(currentDate);
  };

  const onChangePurchaseDate = (event, selectedDate) => {
    const currentDate = selectedDate || purchaseDate;
    setShowPurchaseDatePicker(Platform.OS === 'ios');
    setPurchaseDate(currentDate);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isEditMode ? 'Editar Ganado' : 'Registrar Nuevo Ganado'}
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Información básica</Text>

        <Text style={styles.label}>Identificador *</Text>
        <TextInput
          style={styles.input}
          value={identifier}
          onChangeText={setIdentifier}
          placeholder="Ej. BOV-2023-001"
        />

        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nombre del animal"
        />

        <Text style={styles.label}>Tipo *</Text>
        <TextInput
          style={styles.input}
          value={type}
          onChangeText={setType}
          placeholder="Ej. Vaca, Toro, Novillo"
        />

        <Text style={styles.label}>Raza *</Text>
        <TextInput
          style={styles.input}
          value={breed}
          onChangeText={setBreed}
          placeholder="Ej. Holstein, Jersey, Angus"
        />

        <Text style={styles.label}>Género</Text>
        <TextInput
          style={styles.input}
          value={gender}
          onChangeText={setGender}
          placeholder="Ej. Macho, Hembra"
        />

        <Text style={styles.label}>Fecha de nacimiento</Text>
        <TouchableOpacity 
          style={styles.datePickerButton} 
          onPress={() => setShowDateOfBirthPicker(true)}
        >
          <Text style={styles.dateText}>{formatDate(dateOfBirth)}</Text>
          <Ionicons name="calendar-outline" size={20} color="#555" />
        </TouchableOpacity>

        {showDateOfBirthPicker && (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display="default"
            onChange={onChangeDateOfBirth}
          />
        )}

        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          placeholder="Peso en kilogramos"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Ubicación</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Ej. Potrero Norte, Establo 2"
        />

        <Text style={styles.sectionTitle}>Información económica</Text>

        <Text style={styles.label}>Precio de compra</Text>
        <TextInput
          style={styles.input}
          value={purchasePrice}
          onChangeText={setPurchasePrice}
          placeholder="Ej. 1200"
          keyboardType="numeric"
        />

        <Text style={styles.sectionTitle}>Asignación a Granja</Text>
        <Text style={styles.label}>Granja *</Text>
        {loadingFarms ? (
          <ActivityIndicator size="small" color="#27ae60" style={{marginVertical: 10}} />
        ) : farms.length > 0 ? (
          <View style={styles.farmSelector}>
            {farms.map(farm => (
              <TouchableOpacity
                key={farm._id}
                style={[styles.farmOption, selectedFarmId === farm._id && styles.selectedFarmOption]}
                onPress={() => setSelectedFarmId(farm._id)}
              >
                <Text style={[styles.farmOptionText, selectedFarmId === farm._id && styles.selectedFarmOptionText]}>
                  {farm.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.noFarmsContainer}>
            <Text style={styles.noFarmsText}>No tienes granjas disponibles</Text>
            <TouchableOpacity
              style={styles.createFarmButton}
              onPress={() => router.push('/farms')}
            >
              <Text style={styles.createFarmButtonText}>Crear Granja</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>Fecha de compra</Text>
        <TouchableOpacity 
          style={styles.datePickerButton} 
          onPress={() => setShowPurchaseDatePicker(true)}
        >
          <Text style={styles.dateText}>{formatDate(purchaseDate)}</Text>
          <Ionicons name="calendar-outline" size={20} color="#555" />
        </TouchableOpacity>

        {showPurchaseDatePicker && (
          <DateTimePicker
            value={purchaseDate}
            mode="date"
            display="default"
            onChange={onChangePurchaseDate}
          />
        )}

        <Text style={styles.label}>Notas adicionales</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Información adicional relevante"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>
              {isEditMode ? 'Actualizar' : 'Registrar'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleCancel}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Estilos para selector de granjas
  farmSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  farmOption: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedFarmOption: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },
  farmOptionText: {
    color: '#333',
    fontSize: 14,
  },
  selectedFarmOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noFarmsContainer: {
    alignItems: 'center',
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  noFarmsText: {
    color: '#777',
    marginBottom: 10,
  },
  createFarmButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  createFarmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#27ae60',
    padding: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    margin: 15,
    marginTop: -15,
    ...getShadowStyle(),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 100,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fafafa',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  cancelText: {
    color: '#555',
    fontWeight: '500',
    fontSize: 16,
  },
});

export default AddCattleScreen;