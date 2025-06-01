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
import FarmSelector from '../components/FarmSelector';
import api from '../services/api';
import { supabase } from '../config/supabase';

const AddCattleScreen = (props) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Manejar diferentes formatos de props para obtener el ID del ganado
  const route = props?.route || {};
  const cattleId = route?.params?.cattleId || params?.id || null;
  const isEditMode = !!cattleId;
  
  const { userInfo } = useAuth();
  
  // Estado para el manejo de errores
  const [errorMessage, setErrorMessage] = useState(null);

  // Estados del formulario
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [healthStatus, setHealthStatus] = useState('saludable');
  const [status, setStatus] = useState('activo');
  const [tipoProduccion, setTipoProduccion] = useState('leche');
  
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
    // Datos de granja de prueba para asegurar que siempre haya al menos una granja disponible
  const testFarms = [
    { _id: 'test-farm-1', id_finca: 'test-farm-1', name: 'Granja de Prueba 1', nombre: 'Granja de Prueba 1' },
    { _id: 'test-farm-2', id_finca: 'test-farm-2', name: 'Granja de Prueba 2', nombre: 'Granja de Prueba 2' }
  ];
  // Función para cargar granjas de manera segura
  const loadFarms = async () => {
    try {
      setLoadingFarms(true);
      
      // Asegurar que haya datos disponibles en caso de fallo
      let defaultFarms = [
        { _id: 'default-farm-1', id_finca: 'default-farm-1', name: 'Granja por defecto', nombre: 'Granja por defecto' }
      ];
      
      // Verificar si el usuario está autenticado
      if (!userInfo || !userInfo.uid) {
        console.warn('No hay información de usuario disponible');
        setFarms(defaultFarms);
        return;
      }
      
      console.log('Cargando granjas para el usuario:', userInfo.uid);
      
      try {
        // Intenta obtener las granjas a través de la API
        const userFarms = await api.farms.getAll();
        console.log('Respuesta de la API (farms.getAll):', userFarms);
        
        let finalFarms = [];
        
        // Verificar y procesar los datos recibidos
        if (userFarms && Array.isArray(userFarms)) {
          // Filtrar para remover elementos nulos o indefinidos
          const validFarms = userFarms.filter(farm => farm !== null && farm !== undefined);
          
          if (validFarms.length > 0) {
            // Procesar y normalizar los datos de las granjas
            finalFarms = validFarms.map((farm, index) => {
              const farmId = farm._id || farm.id_finca || `api-farm-${index}`;
              const farmName = farm.name || farm.nombre || `Granja ${index+1}`;
              
              return {
                ...farm,
                _id: farmId,
                id_finca: farmId,
                name: farmName,
                nombre: farmName
              };
            });
            
            console.log(`Se procesaron ${finalFarms.length} granjas válidas`);
          } else {
            console.warn('La API devolvió un array vacío o sin elementos válidos');
          }
        } else if (userFarms && typeof userFarms === 'object') {
          // Si es un objeto pero no un array, puede ser un objeto de datos
          console.log('La API devolvió un objeto, intentando procesarlo...');
          
          // Extraer propiedades que podrían contener un array de granjas
          const possibleArrays = ['data', 'farms', 'items', 'results'];
          
          for (const key of possibleArrays) {
            if (userFarms[key] && Array.isArray(userFarms[key])) {
              console.log(`Encontrado array de granjas en propiedad: ${key}`);
              finalFarms = userFarms[key].map((farm, index) => ({
                ...farm,
                _id: farm._id || farm.id_finca || `api-farm-${index}`,
                name: farm.name || farm.nombre || `Granja ${index+1}`
              }));
              break;
            }
          }
          
          // Si no encontramos un array en ninguna propiedad común, tratar todo el objeto como una granja
          if (finalFarms.length === 0 && (userFarms._id || userFarms.id_finca || userFarms.name || userFarms.nombre)) {
            console.log('Procesando el objeto completo como una única granja');
            finalFarms = [{
              ...userFarms,
              _id: userFarms._id || userFarms.id_finca || 'single-farm',
              name: userFarms.name || userFarms.nombre || 'Granja Única'
            }];
          }
        } else {
          console.warn('La API devolvió un formato de datos no reconocido:', userFarms);
        }
        
        // Si después de todo el procesamiento no tenemos granjas, usar las predeterminadas
        if (!finalFarms || finalFarms.length === 0) {
          console.log('No se pudieron procesar granjas válidas, usando granjas por defecto');
          finalFarms = defaultFarms;
        }
        
        // Agregar las granjas de prueba en entorno de desarrollo
        if (process.env.NODE_ENV !== 'production' && Array.isArray(testFarms)) {
          console.log('Agregando granjas de prueba en entorno de desarrollo');
          finalFarms = [...finalFarms, ...testFarms];
        }
        
        console.log(`Total granjas disponibles: ${finalFarms.length}`);
        setFarms(finalFarms);
        
        // Si hay granjas disponibles, establecer la primera como seleccionada
        if (finalFarms.length > 0 && !selectedFarmId) {
          setSelectedFarmId(finalFarms[0]._id);
        }
        
      } catch (apiError) {
        console.error('Error en la llamada API a getAll():', apiError);
        setFarms(defaultFarms);
      }
    } catch (error) {
      console.error('Error general al cargar granjas:', error);
      setFarms([
        { _id: 'error-farm', id_finca: 'error-farm', name: 'Granja (error recuperado)', nombre: 'Granja (error recuperado)' }
      ]);
    } finally {
      setLoadingFarms(false);
    }
  };
  
  // Cargar granjas cuando se inicia el componente
  useEffect(() => {
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
          setGender(cattleData.gender || '');
          setWeight(cattleData.weight ? cattleData.weight.toString() : '');
          setNotes(cattleData.notes || '');
          setPurchasePrice(cattleData.purchasePrice ? cattleData.purchasePrice.toString() : '');
          setStatus(cattleData.status || 'activo');
          setHealthStatus(cattleData.healthStatus || 'saludable');
          setTipoProduccion(cattleData.tipoProduccion || 'leche');
          
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

  // Función para manejar errores de manera consistente
  const handleError = (error, customMessage = 'Se produjo un error') => {
    console.error(customMessage, error);
    setErrorMessage(customMessage);
    
    // Mostrar mensaje en UI
    Alert.alert('Error', 
      `${customMessage}. ${error?.message || 'Por favor intenta nuevamente.'}`,
      [{ text: 'OK' }]
    );
  };

  const handleCancel = () => {
    try {
      // Intentar diferentes métodos de navegación según disponibilidad
      if (typeof router.back === 'function') {
        router.back();
      } else if (typeof router.navigate === 'function') {
        router.navigate('/(tabs)');
      } else {
        // Intento alternativo para web
        router.push('/(tabs)');
      }
    } catch (navError) {
      console.error('Error durante la navegación en handleCancel:', navError);
      try {
        // Último intento
        router.push('/');
      } catch (e) {
        console.error('No se pudo navegar:', e);
      }
    }
  };
  const handleSave = async () => {
    try {
      // Validaciones con mensajes específicos
      if (!identifier) {
        Alert.alert('Campo requerido', 'Por favor, ingresa un número de identificación para el ganado');
        return;
      }
      
      if (!name) {
        Alert.alert('Campo requerido', 'Por favor, ingresa un nombre para el ganado');
        return;
      }
      
      if (!selectedFarmId) {
        Alert.alert('Granja requerida', 'Por favor, selecciona una granja para asignar el ganado');
        return;
      }

      // Verificar que el usuario esté autenticado
      if (!userInfo || !userInfo.uid) {
        Alert.alert('Error de sesión', 'No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.');
        return;
      }

      try {
        // Primero crear la información veterinaria
        const { data: infoVetData, error: infoVetError } = await supabase
          .from('informacion_veterinaria')
          .insert({
            fecha_tratamiento: new Date().toISOString(),
            diagnostico: healthStatus === 'Enfermo' ? 'Requiere revisión' : 'Sin diagnóstico',
            tratamiento: '',
            nota: notes || ''
          })
          .select()
          .single();

        if (infoVetError) throw infoVetError;

        // Crear estructura de datos para el ganado
        const cattleData = {
          nombre: name,
          numero_identificacion: parseInt(identifier),
          precio_compra: parseFloat(purchasePrice) || 0,
          nota: notes || '',
          id_finca: selectedFarmId,
          id_estado_salud: healthStatus === 'Saludable' ? 1 : (healthStatus === 'Enfermo' ? 2 : 3),
          id_genero: gender === 'Macho' ? 1 : 2,
          id_informacion_veterinaria: infoVetData.id_informacion_veterinaria,
          id_produccion: tipoProduccion === 'leche' ? 1 : 2
        };
        
        // Insertar en la tabla ganado
        const { data, error } = await supabase
          .from('ganado')
          .insert([cattleData])
          .select();

        if (error) throw error;

        // Si la inserción fue exitosa, mostrar mensaje y navegar
        Alert.alert('Éxito', 'Ganado registrado correctamente');
        router.back();
      } catch (supabaseError) {
        console.error('Error al registrar ganado:', supabaseError.message);
        Alert.alert('Error', 'No se pudo registrar el ganado. Por favor, intente nuevamente.');
      }
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

        <Text style={styles.label}>Número de Identificación *</Text>
        <TextInput
          style={styles.input}
          value={identifier}
          onChangeText={setIdentifier}
          placeholder="Número de identificación"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nombre del animal"
        />

        <Text style={styles.label}>Género</Text>
        <View style={styles.optionsContainer}>
          {['Macho', 'Hembra'].map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.optionButton, gender === option && styles.selectedOption]}
              onPress={() => setGender(option)}
            >
              <Text style={[styles.optionText, gender === option && styles.selectedOptionText]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Estado de Salud</Text>
        <View style={styles.optionsContainer}>
          {['Saludable', 'Enfermo', 'En tratamiento'].map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.optionButton, healthStatus === option && styles.selectedOption]}
              onPress={() => setHealthStatus(option)}
            >
              <Text style={[styles.optionText, healthStatus === option && styles.selectedOptionText]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Precio de compra</Text>
        <TextInput
          style={styles.input}
          value={purchasePrice}
          onChangeText={setPurchasePrice}
          placeholder="Precio de compra"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Tipo de Producción</Text>
        <View style={styles.optionsContainer}>
          {['Leche', 'Carne'].map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.optionButton, tipoProduccion === option.toLowerCase() && styles.selectedOption]}
              onPress={() => setTipoProduccion(option.toLowerCase())}
            >
              <Text style={[styles.optionText, tipoProduccion === option.toLowerCase() && styles.selectedOptionText]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
          <View style={{padding: 15, alignItems: 'center'}}>
            <ActivityIndicator size="small" color="#27ae60" style={{marginBottom: 10}} />
            <Text style={{color: '#666'}}>Cargando granjas disponibles...</Text>
          </View>
        ) : (
          <View style={styles.farmSelector}>
            {farms && farms.length > 0 ? (
              <View>
                <Text style={{marginBottom: 12, color: '#444', fontWeight: '500'}}>
                  Selecciona una granja ({farms.length} disponibles):
                </Text>
                {farms.map((farm, index) => {
                  if (!farm) return null;
                  
                  const farmId = farm.id_finca || `farm-${index}`;
                  const farmName = farm.nombre || `Granja ${index+1}`;
                  
                  return (
                    <TouchableOpacity
                      key={farmId}
                      style={[
                        styles.farmOption, 
                        selectedFarmId === farmId && styles.selectedFarmOption
                      ]}
                      onPress={() => setSelectedFarmId(farmId)}
                    >
                      <Text style={[styles.farmOptionText, selectedFarmId === farmId && styles.selectedFarmOptionText]}>
                        {farmName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                
                {selectedFarmId === '' && (
                  <Text style={{marginTop: 8, color: '#e74c3c', fontSize: 13}}>
                    Por favor, selecciona una granja para continuar
                  </Text>
                )}
              </View>
            ) : (
              <View>
                <Text style={styles.noFarmsText}>No hay granjas disponibles. Por favor, crea una granja primero.</Text>
                <TouchableOpacity
                  style={styles.createFarmButton}
                  onPress={() => {
                    try {
                      router.push('/(tabs)/farms');
                    } catch (e) {
                      console.error('Error al navegar a granjas:', e);
                      Alert.alert('Error', 'No se pudo navegar a la pantalla de granjas');
                    }
                  }}
                >
                  <Text style={styles.createFarmButtonText}>Crear Granja</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
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