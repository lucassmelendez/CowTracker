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
  const [dateOfBirthText, setDateOfBirthText] = useState('');
  const [purchaseDateText, setPurchaseDateText] = useState('');
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
  
  useEffect(() => {
    setDateOfBirthText(formatDate(dateOfBirth));
    setPurchaseDateText(formatDate(purchaseDate));
  }, [dateOfBirth, purchaseDate]);
  
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
      
      // Validar y analizar fechas de texto si es necesario
      let birthDateToSave = dateOfBirth;
      let purchaseDateToSave = purchaseDate;
      
      if (dateOfBirthText) {
        const parsedBirthDate = parseDate(dateOfBirthText);
        if (parsedBirthDate && !isNaN(parsedBirthDate.getTime())) {
          birthDateToSave = parsedBirthDate;
        }
      }
      
      if (purchaseDateText) {
        const parsedPurchaseDate = parseDate(purchaseDateText);
        if (parsedPurchaseDate && !isNaN(parsedPurchaseDate.getTime())) {
          purchaseDateToSave = parsedPurchaseDate;
        }
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
        birthDate: birthDateToSave,
        purchaseDate: purchaseDateToSave,
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

  // Formatear fecha para mostrar en la UI
  const formatDate = (date) => {
    try {
      if (!date || isNaN(date.getTime())) {
        return '';
      }
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch (err) {
      console.error('Error al formatear fecha:', err);
      return '';
    }
  };
  
  const parseDate = (dateText) => {
    if (!dateText) return null;
    
    try {
      const parts = dateText.split('/');
      if (parts.length !== 3) return null;
      
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      
      if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
      if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2100) return null;
      
      return new Date(year, month, day);
    } catch (err) {
      console.error('Error al analizar fecha:', err);
      return null;
    }
  };

  const onChangeDateOfBirth = (event, selectedDate) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDateOfBirthPicker(Platform.OS === 'ios');
    setDateOfBirth(currentDate);
    setDateOfBirthText(formatDate(currentDate));
  };

  const onChangePurchaseDate = (event, selectedDate) => {
    const currentDate = selectedDate || purchaseDate;
    setShowPurchaseDatePicker(Platform.OS === 'ios');
    setPurchaseDate(currentDate);
    setPurchaseDateText(formatDate(currentDate));
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
        <View style={styles.dateInputContainer}>
          <TextInput
            style={styles.dateInput}
            value={dateOfBirthText}
            onChangeText={setDateOfBirthText}
            placeholder="DD/MM/AAAA"
            keyboardType="numbers-and-punctuation"
          />
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={() => setShowDateOfBirthPicker(true)}
          >
            <Ionicons name="calendar-outline" size={24} color="#27ae60" />
          </TouchableOpacity>
        </View>
        
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
        <View style={styles.dateInputContainer}>
          <TextInput
            style={styles.dateInput}
            value={purchaseDateText}
            onChangeText={setPurchaseDateText}
            placeholder="DD/MM/AAAA"
            keyboardType="numbers-and-punctuation"
          />
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={() => setShowPurchaseDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={24} color="#27ae60" />
          </TouchableOpacity>
        </View>

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

import { addCattleStyles as styles } from '../styles/addCattleStyles';

export default AddCattleScreen;