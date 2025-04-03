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
import { useAuth } from '../components/AuthContext';
import api from '../services/api';

const AddCattleScreen = ({ route }) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cattleId = route?.params?.cattleId || params.id;
  const isEditMode = !!cattleId;
  const { userInfo } = useAuth();

  // Estados del formulario
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [healthStatus, setHealthStatus] = useState('saludable');
  const [status, setStatus] = useState('activo');
  
  // Estados para fecha
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [showDateOfBirthPicker, setShowDateOfBirthPicker] = useState(false);
  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
  
  // Estados para carga
  const [farms, setFarms] = useState([]);
  const [loadingFarms, setLoadingFarms] = useState(false);
  const [loadingCattle, setLoadingCattle] = useState(isEditMode);
  
  // Cargar granjas
  useEffect(() => {
    const loadFarms = async () => {
      try {
        setLoadingFarms(true);
        if (userInfo && userInfo.uid) {
          // Usar la API para obtener las granjas
          const userFarms = await api.farms.getAll();
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
  }, [userInfo]);
  
  // Cargar datos del ganado si estamos en modo edición
  useEffect(() => {
    const loadCattleData = async () => {
      if (!isEditMode || !cattleId) return;
      
      try {
        setLoadingCattle(true);
        // Usar la API para obtener los detalles del ganado
        const cattleData = await api.cattle.getById(cattleId);
        
        if (cattleData) {
          // Establecer todos los valores del formulario desde los datos del ganado
          setIdentifier(cattleData.identificationNumber || '');
          setName(cattleData.name || '');
          setType(cattleData.type || '');
          setBreed(cattleData.breed || '');
          setGender(cattleData.gender || '');
          setWeight(cattleData.weight ? cattleData.weight.toString() : '');
          setNotes(cattleData.notes || '');
          setPurchasePrice(cattleData.purchasePrice ? cattleData.purchasePrice.toString() : '');
          setStatus(cattleData.status || 'activo');
          setHealthStatus(cattleData.healthStatus || 'saludable');
          
          // Establecer fecha de nacimiento
          if (cattleData.birthDate) {
            try {
              let birthDate;
              if (typeof cattleData.birthDate === 'object' && cattleData.birthDate.seconds) {
                // Es un timestamp de Firestore
                birthDate = new Date(cattleData.birthDate.seconds * 1000);
              } else {
                // Es otro formato de fecha
                birthDate = new Date(cattleData.birthDate);
              }
              
              if (!isNaN(birthDate.getTime())) {
                setDateOfBirth(birthDate);
              } else {
                console.warn('Fecha de nacimiento inválida:', cattleData.birthDate);
                setDateOfBirth(new Date());
              }
            } catch (err) {
              console.error('Error al procesar fecha de nacimiento:', err);
              setDateOfBirth(new Date());
            }
          }
          
          // Establecer fecha de compra
          if (cattleData.purchaseDate) {
            try {
              let purchaseDate;
              if (typeof cattleData.purchaseDate === 'object' && cattleData.purchaseDate.seconds) {
                // Es un timestamp de Firestore
                purchaseDate = new Date(cattleData.purchaseDate.seconds * 1000);
              } else {
                // Es otro formato de fecha
                purchaseDate = new Date(cattleData.purchaseDate);
              }
              
              if (!isNaN(purchaseDate.getTime())) {
                setPurchaseDate(purchaseDate);
              } else {
                console.warn('Fecha de compra inválida:', cattleData.purchaseDate);
                setPurchaseDate(new Date());
              }
            } catch (err) {
              console.error('Error al procesar fecha de compra:', err);
              setPurchaseDate(new Date());
            }
          }
          
          // Establecer la ubicación
          if (cattleData.location) {
            if (cattleData.location.area) {
              setLocation(cattleData.location.area);
            }
            
            if (cattleData.location.farm) {
              if (typeof cattleData.location.farm === 'object' && cattleData.location.farm._id) {
                setSelectedFarmId(cattleData.location.farm._id);
              } else if (cattleData.farmId) {
                setSelectedFarmId(cattleData.farmId);
              }
            } else if (cattleData.farmId) {
              setSelectedFarmId(cattleData.farmId);
            }
          } else if (cattleData.farmId) {
            setSelectedFarmId(cattleData.farmId);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos del ganado:', error);
        Alert.alert('Error', 'No se pudieron cargar los datos del ganado');
      } finally {
        setLoadingCattle(false);
      }
    };
    
    loadCattleData();
  }, [cattleId, isEditMode]);

  const handleCancel = () => {
    router.back();
  };

  const handleSave = async () => {
    // Validaciones
    if (!identifier || !name || !type || !breed) {
      Alert.alert('Error', 'Por favor, completa los campos obligatorios');
      return;
    }

    try {
      if (!userInfo || !userInfo.uid) {
        Alert.alert('Error', 'No se pudo obtener la información del usuario');
        return;
      }
      
      const cattleData = {
        identificationNumber: identifier,
        name,
        type,
        breed,
        gender,
        weight: parseFloat(weight) || 0,
        location: {
          area: location || '',
          farm: selectedFarmId
        },
        notes,
        purchasePrice: parseFloat(purchasePrice) || 0,
        birthDate: dateOfBirth,
        purchaseDate: purchaseDate,
        status: status || 'activo',
        healthStatus: healthStatus || 'saludable',
        owner: userInfo.uid,
        farmId: selectedFarmId
      };
      
      if (isEditMode) {
        // Actualizar ganado existente usando la API
        await api.cattle.update(cattleId, cattleData);
      } else {
        // Crear nuevo ganado usando la API
        await api.cattle.create(cattleData);
      }
      
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
    try {
      if (!date || isNaN(date.getTime())) {
        return 'Fecha no disponible';
      }
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch (err) {
      console.error('Error al formatear fecha:', err);
      return 'Error en formato';
    }
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

  if (loadingCattle) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
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

        <Text style={styles.sectionTitle}>Estado y Salud</Text>
        
        <Text style={styles.label}>Estado</Text>
        <View style={styles.optionsContainer}>
          {['activo', 'vendido', 'fallecido'].map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.optionButton, status === option && styles.selectedOption]}
              onPress={() => setStatus(option)}
            >
              <Text style={[styles.optionText, status === option && styles.selectedOptionText]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.label}>Estado de Salud</Text>
        <View style={styles.optionsContainer}>
          {['saludable', 'enfermo', 'en tratamiento', 'en cuarentena'].map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.optionButton, healthStatus === option && styles.selectedOption]}
              onPress={() => setHealthStatus(option)}
            >
              <Text style={[styles.optionText, healthStatus === option && styles.selectedOptionText]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Información económica</Text>

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

        <Text style={styles.label}>Precio de compra</Text>
        <TextInput
          style={styles.input}
          value={purchasePrice}
          onChangeText={setPurchasePrice}
          placeholder="Ej. 1200"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Notas</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Información adicional sobre el animal"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
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
          <Text style={styles.noFarmsText}>No hay granjas disponibles. Por favor, crea una granja primero.</Text>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>{isEditMode ? 'Actualizar' : 'Guardar'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  header: {
    backgroundColor: '#27ae60',
    padding: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    margin: 15,
    padding: 20,
    ...getShadowStyle(),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
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
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#27ae60',
  },
  optionText: {
    color: '#555',
  },
  selectedOptionText: {
    color: '#fff',
  },
  farmSelector: {
    marginBottom: 15,
  },
  farmOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedFarmOption: {
    borderColor: '#27ae60',
    backgroundColor: '#f0f8f1',
  },
  farmOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedFarmOptionText: {
    color: '#27ae60',
    fontWeight: '500',
  },
  noFarmsText: {
    color: '#e74c3c',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AddCattleScreen;