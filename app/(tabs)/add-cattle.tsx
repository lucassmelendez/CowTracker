import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../components/AuthContext';
import api from '../../lib/services/api';
import { supabase } from '../../lib/config/supabase';
import { useCacheManager } from '../../hooks/useCachedData';
import { useCustomModal } from '../../components/CustomModal';

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
  
  // Hook para modales personalizados
  const { showSuccess, showError, showConfirm, ModalComponent } = useCustomModal();

  // Estado para el manejo de errores y advertencias
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Estados del formulario
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
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
            .filter((userFarm: any) => userFarm.finca) // Filtrar solo las que tienen datos de finca
            .map((userFarm: any, index: number) => {
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

  useEffect(() => {
    if (userInfo) {
      loadFarms();
    }
  }, [userInfo]);
  
  useEffect(() => {
    const loadCattleData = async () => {
      if (!isEditMode || !cattleId) return;
      
      try {
        setLoadingCattle(true);
        // Usar la API para obtener los detalles del ganado
        const cattleData: any = await api.cattle.getById(cattleId);
        
        if (cattleData) {
          // Mapear los datos del backend al formulario
          // El backend devuelve datos en formato de base de datos
          setIdentifier((cattleData.numero_identificacion || cattleData.identificationNumber || '').toString());
          setName(cattleData.nombre || cattleData.name || '');
          
          // Mapear género desde la relación o campo directo
          let genderValue = '';
          if (cattleData.genero && cattleData.genero.descripcion) {
            genderValue = cattleData.genero.descripcion;
          } else if (cattleData.gender) {
            genderValue = cattleData.gender;
          } else if (cattleData.id_genero) {
            genderValue = cattleData.id_genero === 1 ? 'Macho' : 'Hembra';
          }
          setGender(genderValue);
          
          // Peso - por ahora no está en la BD pero mantenemos compatibilidad
          setWeight(cattleData.weight ? cattleData.weight.toString() : '');
          
          // Notas
          setNotes(cattleData.nota || cattleData.notes || '');
          
          // Estado - por ahora establecemos valor por defecto
          setStatus(cattleData.status || 'activo');
          
          // Estado de salud desde la relación o campo directo
          let healthValue = 'Saludable';
          if (cattleData.estado_salud && cattleData.estado_salud.descripcion) {
            healthValue = cattleData.estado_salud.descripcion;
          } else if (cattleData.healthStatus) {
            healthValue = cattleData.healthStatus;
          } else if (cattleData.id_estado_salud) {
            // Mapear IDs conocidos: 1=Saludable, 2=Enfermo, 3=En tratamiento
            switch(cattleData.id_estado_salud) {
              case 1: healthValue = 'Saludable'; break;
              case 2: healthValue = 'Enfermo'; break;
              case 3: healthValue = 'En tratamiento'; break;
              default: healthValue = 'Saludable';
            }
          }
          setHealthStatus(healthValue);
          
          // Tipo de producción desde la relación o campo directo
          let produccionValue = 'leche';
          if (cattleData.produccion && cattleData.produccion.descripcion) {
            produccionValue = cattleData.produccion.descripcion.toLowerCase();
          } else if (cattleData.tipoProduccion) {
            produccionValue = cattleData.tipoProduccion;
          } else if (cattleData.id_produccion) {
            // Mapear IDs conocidos: 1=leche, 2=carne
            produccionValue = cattleData.id_produccion === 1 ? 'leche' : 'carne';
          }
          setTipoProduccion(produccionValue);
          
          // Granja - mapear desde diferentes formatos posibles
          let farmIdValue = '';
          if (cattleData.finca && cattleData.finca.id_finca) {
            farmIdValue = cattleData.finca.id_finca.toString();
          } else if (cattleData.id_finca) {
            farmIdValue = cattleData.id_finca.toString();
          } else if (cattleData.farmId) {
            farmIdValue = cattleData.farmId.toString();
          }
          
          if (farmIdValue) {
            setSelectedFarmId(farmIdValue);
          }
          

        }
      } catch (error) {
        console.error('Error al cargar datos del ganado:', error);
        showError('Error', 'No se pudieron cargar los datos del ganado');
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
    showError('Error', `${customMessage}. ${error?.message || 'Por favor intenta nuevamente.'}`);
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
        showError('Campo requerido', 'Por favor, ingresa un número de identificación para el ganado');
        return;
      }
      
      if (!name) {
        showError('Campo requerido', 'Por favor, ingresa un nombre para el ganado');
        return;
      }
      
      if (!selectedFarmId) {
        showError('Granja requerida', 'Por favor, selecciona una granja para asignar el ganado');
        return;
      }

      // Verificar que el usuario esté autenticado
      if (!userInfo || !userInfo.uid) {
        showError('Error de sesión', 'No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.');
        return;
      }

      // Convertir selectedFarmId a número si es necesario
      const farmIdNumeric = parseInt(selectedFarmId) || selectedFarmId;

      if (isEditMode) {
        // Actualizar ganado existente usando la API directa
        // Enviar datos en el formato que espera el backend
        const updateData = {
          nombre: name,
          numero_identificacion: parseInt(identifier) || 0,
          nota: notes || '',
          id_finca: farmIdNumeric,
          id_estado_salud: healthStatus === 'Saludable' ? 1 : (healthStatus === 'Enfermo' ? 2 : 3),
          id_genero: gender === 'Macho' ? 1 : 2,
          id_produccion: tipoProduccion === 'leche' ? 1 : 2
        };

        await api.cattle.update(cattleId!, updateData);
        showSuccess('Éxito', 'Ganado actualizado correctamente', () => {
          // Invalidar caché para que se reflejen los cambios
          invalidateCache('cattle');
          invalidateCache('farms');
          router.back();
        });
      } else {
        // Crear nuevo ganado usando Supabase directo (método original que funcionaba)
        // Crear un registro básico de información veterinaria (requerido por la BD)
        const { data: infoVetData, error: infoVetError } = await supabase
          .from('informacion_veterinaria')
          .insert({
            diagnostico: '',
            tratamiento: '',
            nota: ''
          })
          .select()
          .single();

        if (infoVetError) throw infoVetError;

        // Crear estructura de datos para el ganado
        const cattleData = {
          nombre: name,
          numero_identificacion: parseInt(identifier),
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
        
        showSuccess('Éxito', 'Ganado registrado correctamente', () => {
          // Invalidar caché para que se reflejen los cambios
          invalidateCache('cattle');
          invalidateCache('farms');
          router.back();
        });
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
      
      showError('Error', errorMessage);
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
      
      showSuccess('Éxito', 'Ganado eliminado correctamente', () => {
        // Invalidar caché para que se reflejen los cambios
        invalidateCache('cattle');
        invalidateCache('farms');
        router.back();
      });
    } catch (error: any) {
      console.error('Error al eliminar ganado:', error);
      showError('Error', 'No se pudo eliminar el ganado. Inténtalo de nuevo.');
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
                      showError('Error', 'No se pudo navegar a la pantalla de granjas');
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
      </View>
      
      {/* Modal personalizado */}
      <ModalComponent />
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
});