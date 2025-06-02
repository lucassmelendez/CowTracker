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
  ActivityIndicator,
  Modal
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
  const [showCattleWarning, setShowCattleWarning] = useState(false);
  const [cattleCount, setCattleCount] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
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
    // Estados para validación de campos numéricos
  const [identifierError, setIdentifierError] = useState(false);
  const [purchasePriceError, setPurchasePriceError] = useState(false);
  const [validationModalVisible, setValidationModalVisible] = useState(false);
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
  const [loadingFarms, setLoadingFarms] = useState(false);  const [loadingCattle, setLoadingCattle] = useState(isEditMode);

  // Funciones de validación numérica
  const validateNumericInput = (text) => {
    // Permitir números enteros y decimales (con punto o coma)
    return /^[0-9]*[.,]?[0-9]*$/.test(text);
  };

  const handleIdentifierChange = (text) => {
    setIdentifier(text);
    // Validar solo si hay texto
    if (text.trim() !== '') {
      setIdentifierError(!validateNumericInput(text));
    } else {
      setIdentifierError(false);
    }
  };

  const handlePurchasePriceChange = (text) => {
    setPurchasePrice(text);
    // Validar solo si hay texto
    if (text.trim() !== '') {
      setPurchasePriceError(!validateNumericInput(text));
    } else {
      setPurchasePriceError(false);
    }
  };

  // Función para cargar granjas de manera segura
  const loadFarms = async () => {
    try {
      setLoadingFarms(true);
      
      // Verificar si el usuario está autenticado
      if (!userInfo || !userInfo.uid) {
        console.warn('No hay información de usuario disponible');
        setFarms([]);
        return;
      }
      
      console.log('Cargando granjas para el usuario:', userInfo.uid);
      
      try {
        // Obtener el ID numérico del usuario
        const { data: userNumericData, error: userNumericError } = await supabase
          .from('usuario')
          .select('id_usuario')
          .eq('id_autentificar', userInfo.uid)
          .single();

        if (userNumericError) throw userNumericError;

        // Obtener las granjas del usuario a través de la tabla usuario_finca
        const { data: userFarms, error: farmsError } = await supabase
          .from('usuario_finca')
          .select(`
            id_finca,
            finca:finca(
              id_finca,
              nombre,
              tamano
            )
          `)
          .eq('id_usuario', userNumericData.id_usuario);

        if (farmsError) throw farmsError;

        let finalFarms = [];
        
        if (userFarms && userFarms.length > 0) {
          // Procesar y normalizar los datos de las granjas
          finalFarms = userFarms
            .filter(userFarm => userFarm.finca) // Filtrar solo las que tienen datos de finca
            .map((userFarm, index) => {
              const farm = userFarm.finca;
              const farmId = farm.id_finca;
              const farmName = farm.nombre || `Granja ${index + 1}`;
              
              return {
                _id: farmId,
                id_finca: farmId,
                name: farmName,
                nombre: farmName,
                tamano: farm.tamano || 0
              };
            });
          
          console.log(`Se procesaron ${finalFarms.length} granjas válidas`);
        } else {
          console.log('El usuario no tiene granjas asignadas');
        }
        
        // Si no hay granjas, mostrar mensaje apropiado
        if (finalFarms.length === 0) {
          console.log('No se encontraron granjas para el usuario');
        }
        
        setFarms(finalFarms);
        
        // Si hay granjas disponibles, establecer la primera como seleccionada
        if (finalFarms.length > 0 && !selectedFarmId) {
          setSelectedFarmId(finalFarms[0].id_finca);
        }
        
      } catch (apiError) {
        console.error('Error en la consulta de granjas:', apiError);
        setFarms([]);
      }
    } catch (error) {
      console.error('Error general al cargar granjas:', error);
      setFarms([]);
    } finally {
      setLoadingFarms(false);
    }
  };

  // Verificar el número de vacas del usuario
  const checkCattleCount = async () => {
    try {
      // Primero verificar si el usuario es premium
      const { data: userData, error: userError } = await supabase
        .from('usuario')
        .select('id_premium')
        .eq('id_autentificar', userInfo?.uid)
        .single();

      if (userError) throw userError;

      // Obtener el ID numérico del usuario
      const { data: userNumericData, error: userNumericError } = await supabase
        .from('usuario')
        .select('id_usuario')
        .eq('id_autentificar', userInfo?.uid)
        .single();

      if (userNumericError) throw userNumericError;

      // Obtener las granjas del usuario a través de la tabla usuario_finca
      const { data: userFarms, error: farmsError } = await supabase
        .from('usuario_finca')
        .select('id_finca')
        .eq('id_usuario', userNumericData.id_usuario);

      if (farmsError) throw farmsError;

      if (!userFarms || userFarms.length === 0) {
        // Si el usuario no tiene granjas, no tiene ganado
        setCattleCount(0);
        return true;
      }

      // Extraer los IDs de las granjas
      const farmIds = userFarms.map(farm => farm.id_finca);

      // Obtener el conteo de ganado en las granjas del usuario
      const { data: cattle, error: cattleError } = await supabase
        .from('ganado')
        .select('id_ganado')
        .in('id_finca', farmIds);
      
      if (cattleError) throw cattleError;
      
      const count = cattle ? cattle.length : 0;
      setCattleCount(count);
      
      // Si no es premium (id_premium !== 2) y ya tiene 2 o más cabezas de ganado, mostrar advertencia
      if (userData?.id_premium !== 2 && count >= 2 && !isEditMode) {
        setShowCattleWarning(true);
        // Retornar false para evitar que continúe con el registro
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error al verificar el número de vacas:', error);
      // En caso de error, permitir continuar para no bloquear al usuario
      return true;
    }
  };

  useEffect(() => {
    if (userInfo) {
      loadFarms();
      checkCattleCount();
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
    }  };
  const handleSave = async () => {
    try {
      // Verificar si hay errores de validación numérica
      if (identifierError || purchasePriceError) {
        setValidationModalVisible(true);
        return;
      }

      // Verificar límite de ganado antes de continuar
      const canAddCattle = await checkCattleCount();
      if (!canAddCattle) {
        return;
      }

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
        // Convertir selectedFarmId a número si es necesario
        const farmIdNumeric = parseInt(selectedFarmId) || selectedFarmId;

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
          id_finca: farmIdNumeric,
          id_estado_salud: healthStatus === 'Saludable' ? 1 : (healthStatus === 'Enfermo' ? 2 : 3),
          id_genero: gender === 'Macho' ? 1 : 2,
          id_informacion_veterinaria: infoVetData.id_informacion_veterinaria,
          id_produccion: tipoProduccion === 'leche' ? 1 : 2
        };
        
        console.log('Datos del ganado a insertar:', cattleData);
        
        // Insertar en la tabla ganado
        const { data, error } = await supabase
          .from('ganado')
          .insert([cattleData])
          .select();

        if (error) {
          console.error('Error de Supabase al insertar ganado:', error);
          throw error;
        }

        console.log('Ganado insertado exitosamente:', data);

        // Si la inserción fue exitosa, mostrar mensaje y navegar
        Alert.alert('Éxito', 'Ganado registrado correctamente');
        router.back();
      } catch (supabaseError) {
        console.error('Error al registrar ganado:', supabaseError);
        
        // Proporcionar mensajes de error más específicos
        let errorMessage = 'No se pudo registrar el ganado. ';
        
        if (supabaseError.code === '23503') {
          errorMessage += 'La granja seleccionada no es válida.';
        } else if (supabaseError.code === '23505') {
          errorMessage += 'El número de identificación ya existe.';
        } else if (supabaseError.message) {
          errorMessage += supabaseError.message;
        } else {
          errorMessage += 'Por favor, intente nuevamente.';
        }
        
        Alert.alert('Error', errorMessage);
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
        <Text style={styles.sectionTitle}>Información básica</Text>        <Text style={styles.label}>Número de Identificación *</Text>
        <TextInput
          style={identifierError ? styles.inputError : styles.input}
          value={identifier}
          onChangeText={handleIdentifierChange}
          placeholder="Número de identificación"
          keyboardType="numeric"
        />
        {identifierError && (
          <Text style={styles.errorText}>
            Solo se permiten números en este campo
          </Text>
        )}

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
        </View>        <Text style={styles.label}>Precio de compra</Text>
        <TextInput
          style={purchasePriceError ? styles.inputError : styles.input}
          value={purchasePrice}
          onChangeText={handlePurchasePriceChange}
          placeholder="Precio de compra"
          keyboardType="numeric"
        />
        {purchasePriceError && (
          <Text style={styles.errorText}>
            Solo se permiten números en este campo
          </Text>
        )}

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

        {/* Modal de confirmación de eliminación */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={deleteModalVisible}
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Confirmar Eliminación
              </Text>
              <Text style={styles.modalText}>
                ¿Estás seguro de que deseas eliminar este ganado?
              </Text>
              
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#e74c3c' }]}
                  onPress={async () => {
                    setDeleteModalVisible(false);
                    
                    try {
                      // Lógica para eliminar el ganado
                      const { error } = await supabase
                        .from('ganado')
                        .delete()
                        .eq('id_ganado', cattleId);
                      
                      if (error) throw error;
                      
                      Alert.alert('Éxito', 'Ganado eliminado correctamente');
                      router.back();
                    } catch (error) {
                      console.error('Error al eliminar ganado:', error);
                      Alert.alert('Error', 'No se pudo eliminar el ganado. Inténtalo de nuevo.');
                    }
                  }}
                >
                  <Text style={styles.buttonText}>
                    Eliminar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>        {/* Modal de advertencia de cantidad de ganado */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showCattleWarning}
          onRequestClose={() => setShowCattleWarning(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.premiumModalContent}>
              {/* Header con gradiente */}
              <View style={styles.premiumModalHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons name="diamond" size={50} color="#fff" />
                </View>
                <Text style={styles.premiumModalTitle}>
                  ¡Actualiza a Premium!
                </Text>
                <Text style={styles.premiumModalSubtitle}>
                  Desbloquea todo el potencial de CowTracker
                </Text>
              </View>
              
              {/* Contenido principal */}
              <View style={styles.premiumModalBody}>
                <View style={styles.limitWarning}>
                  <Ionicons name="warning-outline" size={24} color="#f39c12" />
                  <Text style={styles.limitText}>
                    Has alcanzado el límite de <Text style={styles.boldText}>2 cabezas de ganado</Text> de la versión gratuita
                  </Text>
                </View>

                <Text style={styles.benefitsTitle}>
                  Con Premium obtienes:
                </Text>
                
                <View style={styles.benefitsList}>
                  <View style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                    <Text style={styles.benefitText}>Registro ilimitado de ganado</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                    <Text style={styles.benefitText}>Reportes avanzados y estadísticas</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                    <Text style={styles.benefitText}>Exportación de datos a Excel/PDF</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                    <Text style={styles.benefitText}>Soporte prioritario 24/7</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
                    <Text style={styles.benefitText}>Sincronización en la nube</Text>
                  </View>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>Solo $9.99/mes</Text>
                  <Text style={styles.priceSubtext}>Cancela cuando quieras</Text>
                </View>
              </View>
              
              {/* Botones de acción */}
              <View style={styles.premiumModalButtons}>
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={async () => {
                    try {
                      setShowCattleWarning(false);
                      // Navegar al perfil para actualizar a premium
                      router.push('/(tabs)/profile');
                    } catch (error) {
                      console.error('Error al navegar al perfil:', error);
                    }
                  }}
                >
                  <Ionicons name="diamond" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.upgradeButtonText}>
                    Actualizar a Premium
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.laterButton}
                  onPress={() => {
                    setShowCattleWarning(false);
                    handleCancel();
                  }}
                >
                  <Text style={styles.laterButtonText}>
                    Tal vez más tarde
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Botón de cerrar */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCattleWarning(false)}
              >
                <Ionicons name="close" size={24} color="#95a5a6" />
              </TouchableOpacity>
            </View>
          </View>        </Modal>

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
                  {identifierError && (
                    <View style={styles.errorItem}>
                      <Ionicons name="close-circle" size={16} color="#e74c3c" />
                      <Text style={styles.errorItemText}>
                        El número de identificación debe contener solo números
                      </Text>
                    </View>
                  )}
                  {purchasePriceError && (
                    <View style={styles.errorItem}>
                      <Ionicons name="close-circle" size={16} color="#e74c3c" />
                      <Text style={styles.errorItemText}>
                        El precio de compra debe contener solo números
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    padding: 16,
    backgroundColor: '#27ae60',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...getShadowStyle(4),
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  formContainer: {
    flex: 1,
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#fff',
    ...getShadowStyle(4),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    height: 40,
    borderColor: '#e74c3c',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 4,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fdf2f2',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginBottom: 12,
    marginTop: -4,
  },
  textArea: {
    minHeight: 80,
    maxHeight: 120,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27ae60',
    backgroundColor: 'transparent',
    marginRight: 8,
    ...getShadowStyle(2),
  },
  selectedOption: {
    backgroundColor: '#27ae60',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#27ae60',
  },
  selectedOptionText: {
    color: '#fff',
  },
  farmSelector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fafafa',
    ...getShadowStyle(2),
  },
  farmOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#27ae60',
    backgroundColor: 'transparent',
    marginBottom: 8,
    ...getShadowStyle(2),
  },
  selectedFarmOption: {
    backgroundColor: '#27ae60',
  },
  farmOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedFarmOptionText: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginRight: 8,
    ...getShadowStyle(2),
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#27ae60',
    ...getShadowStyle(2),
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  saveButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    ...getShadowStyle(4),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  modalText: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    color: '#666',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    ...getShadowStyle(2),
  },
  noFarmsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#e74c3c',
    marginTop: 8,
  },
  createFarmButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
    ...getShadowStyle(2),
  },
  createFarmButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    ...getShadowStyle(8),
  },
  premiumModalHeader: {
    backgroundColor: '#27ae60',
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  premiumModalSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  premiumModalBody: {
    padding: 24,
  },
  limitWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  limitText: {
    fontSize: 15,
    marginLeft: 12,
    color: '#856404',
    flex: 1,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#e67e22',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  benefitsList: {
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 8,
  },
  benefitText: {
    fontSize: 15,
    marginLeft: 12,
    color: '#34495e',
    flex: 1,
  },
  priceContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 4,
  },
  priceSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  premiumModalButtons: {
    padding: 24,
    paddingTop: 0,
    gap: 12,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#27ae60',
    ...getShadowStyle(4),
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  laterButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    backgroundColor: '#fff',
  },
  laterButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#7f8c8d',
  },  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Estilos para modal de validación
  validationModalContent: {
    width: '85%',
    maxWidth: 350,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...getShadowStyle(8),
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
    ...getShadowStyle(2),
  },
  validationModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddCattleScreen;