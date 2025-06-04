import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Modal,
  ActivityIndicator,
  Clipboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../components/AuthContext';
import { useFarm } from '../../components/FarmContext';
import api from '../../lib/services/api';

export default function Admin() {
  const { userInfo } = useAuth();
  const { selectedFarm } = useFarm();
  
  const [loading, setLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [workers, setWorkers] = useState<any[]>([]);
  const [vets, setVets] = useState<any[]>([]);
  const [cattle, setCattle] = useState<any[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Estados para el modal de código de vinculación
  const [codeModalVisible, setCodeModalVisible] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeExpiration, setCodeExpiration] = useState('');
  const [codeType, setCodeType] = useState('');
  
  useEffect(() => {
    if (selectedFarm) {
      const fincaId = selectedFarm.id_finca || selectedFarm._id;
      loadPersonnel();
    }
  }, [selectedFarm]);
  
  const loadPersonnel = async () => {
    if (!selectedFarm) return;
    
    setLoading(true);
    try {
      const fincaId = selectedFarm.id_finca || selectedFarm._id;
      
      // Cargar trabajadores
      const workersResponse = await api.farms.getWorkers(fincaId);
      
      // Asegurarse de que workersResponse sea un array (ya no necesita .data)
      const workersData = Array.isArray(workersResponse) ? workersResponse : [];
      
      setWorkers(workersData.map((worker: any) => ({
        _id: worker.id_usuario || worker._id,
        name: worker.nombre_completo || `${worker.primer_nombre || ''} ${worker.primer_apellido || ''}`.trim(),
        email: worker.correo || 'Sin correo',
        role: 'trabajador'
      })));
      
      // Cargar veterinarios
      const vetsResponse = await api.farms.getVeterinarians(fincaId);
      
      // Asegurarse de que vetsResponse sea un array (ya no necesita .data)
      const vetsData = Array.isArray(vetsResponse) ? vetsResponse : [];
      
      setVets(vetsData.map((vet: any) => ({
        _id: vet.id_usuario || vet._id,
        name: vet.nombre_completo || `${vet.primer_nombre || ''} ${vet.primer_apellido || ''}`.trim(),
        email: vet.correo || 'Sin correo',
        role: 'veterinario'
      })));

    } catch (error) {
      console.error("Error cargando personal:", error);
      Alert.alert("Error", "No se pudo cargar la lista de personal");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = (person: any, type: string) => {
    setSelectedUser({ ...person, type });
    setDeleteModalVisible(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedUser || !selectedFarm) return;
    
    setLoading(true);
    try {
      if (selectedUser.type === 'worker') {
        await api.farms.removeWorker(selectedFarm._id, selectedUser._id);
        setWorkers(workers.filter(w => w._id !== selectedUser._id));
      } else {
        await api.farms.removeVeterinarian(selectedFarm._id, selectedUser._id);
        setVets(vets.filter(v => v._id !== selectedUser._id));
      }
      Alert.alert("Éxito", "Personal eliminado correctamente");
    } catch (error) {
      console.error("Error eliminando personal:", error);
      Alert.alert("Error", "No se pudo eliminar al personal seleccionado");
    } finally {
      setLoading(false);
      setDeleteModalVisible(false);
      setSelectedUser(null);
    }
  };
  
  const handleAddNewStaff = async (tipo: string) => {
    if (!selectedFarm) {
      Alert.alert("Error", "Selecciona primero una finca");
      return;
    }
    
    // Determinar el ID de la finca correctamente
    const idFinca = selectedFarm.id_finca || selectedFarm._id;
    
    if (!idFinca) {
      Alert.alert("Error", "La finca seleccionada no tiene un ID válido");
      return;
    }
    
    setGeneratingCode(true);
    try {
      // Convertir tipo a formato esperado por la API
      const tipoUsuario = tipo === 'worker' ? 'trabajador' : 'veterinario';
      
      const response = await api.post('/vincular/generar', {
        idFinca: idFinca,
        tipo: tipoUsuario,
        duracionMinutos: 1440 // 24 horas
      });
      
      if (response && response.data && response.data.success) {
        const codigo = response.data.data.codigo;
        const expiraEn = new Date(response.data.data.expiraEn);
        
        // Formatear fecha de expiración
        const formatoFecha = expiraEn.toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        // Establecer los datos del modal
        setGeneratedCode(codigo);
        setCodeExpiration(formatoFecha);
        setCodeType(tipoUsuario);
        setCodeModalVisible(true);
        
      } else if (response && (response as any).success) {
        // Formato alternativo de respuesta
        const codigo = (response as any).data.codigo;
        const expiraEn = new Date((response as any).data.expiraEn);
        
        // Formatear fecha de expiración
        const formatoFecha = expiraEn.toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        // Establecer los datos del modal
        setGeneratedCode(codigo);
        setCodeExpiration(formatoFecha);
        setCodeType(tipoUsuario);
        setCodeModalVisible(true);
        
      } else {
        throw new Error(`Respuesta inválida del servidor: ${JSON.stringify(response)}`);
      }
    } catch (error: any) {    
      let mensaje = "No se pudo generar el código de vinculación";
      if (error?.response?.data?.message) {
        mensaje += `: ${error.response.data.message}`;
      } else if (error?.message) {
        mensaje += `: ${error.message}`;
      }
      
      Alert.alert("Error", mensaje);
    } finally {
      setGeneratingCode(false);
    }
  };
  
  // Función para copiar el código al portapapeles
  const handleCopyCode = async () => {
    try {
      await Clipboard.setString(generatedCode);
      Alert.alert("¡Código copiado!", "El código se ha copiado al portapapeles. Compártelo con el colaborador.");
    } catch (error) {
      Alert.alert("Error", "No se pudo copiar el código");
    }
  };
  
  const renderPersonItem = ({ item, type }: { item: any, type: string }) => (
    <View style={styles.personItem}>
      <View style={styles.personInfo}>
        <Text style={styles.personName}>{item.name}</Text>
        <Text style={styles.personRole}>{type === 'worker' ? 'Trabajador' : 'Veterinario'}: {item.email}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => handleDelete(item, type)}
      >
        <Ionicons name="trash-outline" size={20} color="#ff3b30" />
      </TouchableOpacity>
    </View>
  );
  
  const loadCattle = async () => {
    if (!selectedFarm) return;
    
    try {
      setLoading(true);
      const response = await api.farms.getCattle(selectedFarm._id);
      // Los datos ya están extraídos por el interceptor
      const cattleData = Array.isArray(response) ? response : [];
      setCattle(cattleData);
    } catch (error) {
      console.error('Error loading cattle:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && workers.length === 0 && vets.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={styles.loadingText}>Cargando personal...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Trabajadores y veterinarios:</Text>
        
        <View style={styles.listContainer}>
          {/* Veterinarios */}
          {vets.map((vet, index) => (
            <TouchableOpacity key={`vet-${vet._id || index}`} activeOpacity={0.7}>
              {renderPersonItem({ item: vet, type: 'vet' })}
            </TouchableOpacity>
          ))}
          
          {/* Trabajadores */}
          {workers.map((worker, index) => (
            <TouchableOpacity key={`worker-${worker._id || index}`} activeOpacity={0.7}>
              {renderPersonItem({ item: worker, type: 'worker' })}
            </TouchableOpacity>
          ))}
          
          {vets.length === 0 && workers.length === 0 && (
            <Text style={styles.emptyText}>No hay personal vinculado a esta finca.</Text>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.addButton, generatingCode && styles.disabledButton]}
          onPress={() => handleAddNewStaff('worker')}
          disabled={generatingCode}
        >
          {generatingCode ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.addButtonText}>Vincular nuevo trabajador</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.addButton, { marginTop: 10 }, generatingCode && styles.disabledButton]}
          onPress={() => handleAddNewStaff('vet')}
          disabled={generatingCode}
        >
          {generatingCode ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.addButtonText}>Vincular nuevo veterinario</Text>
          )}
        </TouchableOpacity>
        
        {/* Modal de confirmación para eliminar */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={deleteModalVisible}
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Confirmar eliminación</Text>
              <Text style={styles.modalText}>
                ¿Estás seguro de que deseas eliminar este {selectedUser?.type === 'worker' ? 'Trabajador' : 'Veterinario'}?
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteConfirmButton}
                  onPress={confirmDelete}
                >
                  <Text style={styles.deleteConfirmButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Modal de código de vinculación */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={codeModalVisible}
          onRequestClose={() => setCodeModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.codeModalContent}>
              {/* Header con gradiente */}
              <View style={styles.codeModalHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons 
                    name={codeType === 'trabajador' ? "people" : "medical"} 
                    size={50} 
                    color="#fff" 
                  />
                </View>
                <Text style={styles.codeModalTitle}>
                  ¡Código Generado!
                </Text>
                <Text style={styles.codeModalSubtitle}>
                  Invitar {codeType === 'trabajador' ? 'Trabajador' : 'Veterinario'}
                </Text>
              </View>
              
              {/* Contenido principal */}
              <View style={styles.codeModalBody}>
                <Text style={styles.instructionText}>
                  Comparte este código con la persona que quieres invitar:
                </Text>
                
                {/* Código destacado */}
                <View style={styles.codeContainer}>
                  <Text style={styles.codeText}>{generatedCode}</Text>
                  <TouchableOpacity 
                    style={styles.copyIconButton}
                    onPress={handleCopyCode}
                  >
                    <Ionicons name="copy-outline" size={24} color="#27ae60" />
                  </TouchableOpacity>
                </View>
                
                {/* Información de expiración */}
                <View style={styles.expirationContainer}>
                  <Ionicons name="time-outline" size={20} color="#f39c12" />
                  <Text style={styles.expirationText}>
                    Este código expira el {codeExpiration}
                  </Text>
                </View>
                
                {/* Instrucciones adicionales */}
                <View style={styles.instructionsContainer}>
                  <Text style={styles.instructionsTitle}>
                    Instrucciones para el {codeType}:
                  </Text>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>1.</Text>
                    <Text style={styles.instructionDetail}>
                      Descargar la aplicación CowTracker
                    </Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>2.</Text>
                    <Text style={styles.instructionDetail}>
                      Crear una cuenta o iniciar sesión
                    </Text>
                  </View>
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionNumber}>3.</Text>
                    <Text style={styles.instructionDetail}>
                      Usar este código para vincularse a la finca
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Botones de acción */}
              <View style={styles.codeModalButtons}>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={handleCopyCode}
                >
                  <Ionicons name="copy" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.copyButtonText}>
                    Copiar Código
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() => setCodeModalVisible(false)}
                >
                  <Text style={styles.closeModalButtonText}>
                    Cerrar
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Botón de cerrar */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setCodeModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#95a5a6" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
} 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    color: '#2c3e50',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  personItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  personRole: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
  },
  addButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  disabledButton: {
    backgroundColor: '#7f8c8d',
    opacity: 0.7,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteConfirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
  },
  deleteConfirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  // Estilos para el modal de código de vinculación
  codeModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  codeModalHeader: {
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
  codeModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  codeModalSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  codeModalBody: {
    padding: 24,
  },
  instructionText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#27ae60',
    borderStyle: 'dashed',
  },
  codeText: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
    textAlign: 'center',
    letterSpacing: 2,
  },
  copyIconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e8f5e8',
  },
  expirationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  expirationText: {
    fontSize: 14,
    color: '#856404',
    marginLeft: 8,
    fontWeight: '500',
  },
  instructionsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  instructionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27ae60',
    marginRight: 8,
    minWidth: 20,
  },
  instructionDetail: {
    fontSize: 14,
    color: '#34495e',
    flex: 1,
    lineHeight: 20,
  },
  codeModalButtons: {
    padding: 24,
    paddingTop: 0,
    gap: 12,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#27ae60',
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeModalButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    backgroundColor: '#fff',
  },
  closeModalButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#7f8c8d',
  },
  closeButton: {
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
}); 