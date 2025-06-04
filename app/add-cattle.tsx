import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../components/AuthContext';
import api from '../lib/services/api';
import { supabase } from '../lib/config/supabase';
import { useCacheManager } from '../hooks/useCachedData';

interface Farm {
  _id: string;
  id_finca: number;
  name: string;
  nombre: string;
  tamano?: number;
}

interface CattleData {
  identificationNumber?: string;
  name?: string;
  gender?: string;
  weight?: number;
  notes?: string;
  purchasePrice?: number;
  status?: string;
  healthStatus?: string;
  tipoProduccion?: string;
  birthDate?: any;
  purchaseDate?: any;
  location?: any;
  farmId?: string;
}

export default function AddCattlePage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cattleId = params?.id as string || null;
  const isEditMode = !!cattleId;
  
  const { userInfo } = useAuth();
  
  const { invalidateCache } = useCacheManager();

  // Estado para el manejo de errores y advertencias
  const [showCattleWarning, setShowCattleWarning] = useState(false);
  const [cattleCount, setCattleCount] = useState(0);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [priceDisplay] = useState('$10.000');

  // Estados del formulario
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [healthStatus, setHealthStatus] = useState('Saludable');
  const [status, setStatus] = useState('activo');
  const [tipoProduccion, setTipoProduccion] = useState('leche');
  
  // Estados para carga
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loadingFarms, setLoadingFarms] = useState(false);
  const [loadingCattle, setLoadingCattle] = useState(isEditMode);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

        let finalFarms: Farm[] = [];
        
        if (userFarms && userFarms.length > 0) {
          // Procesar y normalizar los datos de las granjas
          finalFarms = userFarms
            .filter(userFarm => userFarm.finca) // Filtrar solo las que tienen datos de finca
            .map((userFarm, index) => {
              const farmArray = userFarm.finca;
              // Si finca es un array, tomar el primer elemento
              const farm = Array.isArray(farmArray) ? farmArray[0] : farmArray;
              const farmId = farm?.id_finca;
              const farmName = farm?.nombre || `Granja ${index + 1}`;
              
              return {
                _id: farmId?.toString() || '',
                id_finca: farmId || 0,
                name: farmName,
                nombre: farmName,
                tamano: farm?.tamano || 0
              };
            });
          
        } else {
        }
        
        setFarms(finalFarms);
        
        // Si hay granjas disponibles, establecer la primera como seleccionada
        if (finalFarms.length > 0 && !selectedFarmId) {
          setSelectedFarmId(finalFarms[0].id_finca.toString());
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
  const checkCattleCount = async (): Promise<boolean> => {
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
    const loadCattleData = async () => {
      if (!isEditMode || !cattleId) return;
      
      try {
        setLoadingCattle(true);
        // Usar la API para obtener los detalles del ganado
        const cattleData: CattleData = await api.cattle.getById(cattleId);
        
        if (cattleData) {
          // Establecer todos los valores del formulario desde los datos del ganado
          setIdentifier(cattleData.identificationNumber || '');
          setName(cattleData.name || '');
          setGender(cattleData.gender || '');
          setWeight(cattleData.weight ? cattleData.weight.toString() : '');
          setNotes(cattleData.notes || '');
          setPurchasePrice(cattleData.purchasePrice ? cattleData.purchasePrice.toString() : '');
          setStatus(cattleData.status || 'activo');
          setHealthStatus(cattleData.healthStatus || 'Saludable');
          setTipoProduccion(cattleData.tipoProduccion || 'leche');
          
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
  const handleError = (error: any, customMessage = 'Se produjo un error') => {
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

      // Convertir selectedFarmId a número si es necesario
      const farmIdNumeric = parseInt(selectedFarmId) || selectedFarmId;

      if (isEditMode) {
        // Actualizar ganado existente usando la API directa
        const updateData = {
          identificationNumber: identifier,
          name: name,
          gender: gender,
          weight: weight ? parseFloat(weight) : undefined,
          notes: notes,
          purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
          healthStatus: healthStatus,
          tipoProduccion: tipoProduccion,
          farmId: farmIdNumeric.toString()
        };

        await api.cattle.update(cattleId!, updateData);
        Alert.alert('Éxito', 'Ganado actualizado correctamente');
        
        // Invalidar caché para que se reflejen los cambios
        await invalidateCache('cattle');
        await invalidateCache('farms');
        
        router.back();
      } else {
        // Crear nuevo ganado usando Supabase directo (método original que funcionaba)
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
        
        // Insertar en la tabla ganado
        const { data, error } = await supabase
          .from('ganado')
          .insert([cattleData])
          .select();

        if (error) {
          console.error('Error de Supabase al insertar ganado:', error);
          throw error;
        }
        
        Alert.alert('Éxito', 'Ganado registrado correctamente');
        
        // Invalidar caché para que se reflejen los cambios
        await invalidateCache('cattle');
        await invalidateCache('farms');
        
        router.back();
      }
    } catch (error: any) {
      console.error('Error al guardar ganado:', error);
      
      // Proporcionar mensajes de error más específicos
      let errorMessage = 'No se pudo registrar el ganado. ';
      
      if (error.code === '23503') {
        errorMessage += 'La granja seleccionada no es válida.';
      } else if (error.code === '23505') {
        errorMessage += 'El número de identificación ya existe.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Por favor, intente nuevamente.';
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  // Función para procesar el pago premium (simplificada)
  const handlePremiumUpgrade = async () => {
    try {
      setIsProcessingPayment(true);
      
      // Redirigir a la página de premium
      setShowCattleWarning(false);
      router.push('/premium/activate');
      
    } catch (error) {
      console.error('Error al procesar el pago premium:', error);
      Alert.alert('Error', 'No se pudo procesar la actualización a Premium. Inténtalo de nuevo.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!cattleId) return;
      
      // Usar Supabase directo (método original que funcionaba)
      const { error } = await supabase
        .from('ganado')
        .delete()
        .eq('id_ganado', cattleId);
      
      if (error) throw error;
      
      Alert.alert('Éxito', 'Ganado eliminado correctamente');
      
      // Invalidar caché para que se reflejen los cambios
      await invalidateCache('cattle');
      await invalidateCache('farms');
      
      router.back();
    } catch (error: any) {
      console.error('Error al eliminar ganado:', error);
      Alert.alert('Error', 'No se pudo eliminar el ganado. Inténtalo de nuevo.');
    }
  };

  if (loadingCattle) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={styles.loadingText}>Cargando datos del ganado...</Text>
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
                  
                  const farmId = farm.id_finca.toString();
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

        {/* Botón de eliminar solo en modo edición */}
        {isEditMode && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => setDeleteModalVisible(true)}
          >
            <Text style={styles.deleteButtonText}>Eliminar Ganado</Text>
          </TouchableOpacity>
        )}

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
                  onPress={() => {
                    setDeleteModalVisible(false);
                    handleDelete();
                  }}
                >
                  <Text style={styles.saveButtonText}>
                    Eliminar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Modal de advertencia de cantidad de ganado */}
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
                  <Ionicons name="warning" size={24} color="#f39c12" />
                  <Text style={styles.limitText}>
                    Has alcanzado el límite de <Text style={styles.boldText}>2 animales</Text> en tu cuenta gratuita. 
                    Actualmente tienes <Text style={styles.boldText}>{cattleCount} animales</Text> registrados.
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
                  <Text style={styles.priceText}>{priceDisplay}</Text>
                  <Text style={styles.priceSubtext}>Pago único - Sin suscripciones</Text>
                </View>
              </View>
              
              {/* Botones */}
              <View style={styles.premiumModalButtons}>
                <TouchableOpacity
                  style={[styles.upgradeButton, isProcessingPayment && styles.disabledButton]}
                  onPress={handlePremiumUpgrade}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="diamond" size={20} color="#fff" style={{marginRight: 8}} />
                      <Text style={styles.upgradeButtonText}>Actualizar a Premium</Text>
                    </>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.laterButton}
                  onPress={() => setShowCattleWarning(false)}
                >
                  <Text style={styles.laterButtonText}>Tal vez más tarde</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  header: {
    backgroundColor: '#27ae60',
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    color: '#fff',
  },
  farmSelector: {
    marginBottom: 16,
  },
  farmOption: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  selectedFarmOption: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
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
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#27ae60',
    marginLeft: 8,
  },
  deleteButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#e74c3c',
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
  deleteButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
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
  },
  createFarmButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
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
  },
  disabledButton: {
    opacity: 0.6,
  },
});