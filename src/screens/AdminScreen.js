import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Modal,
  ActivityIndicator,
  Clipboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/commonStyles';
import { getShadowStyle } from '../utils/styles';
import { useAuth } from '../components/AuthContext';
import { useFarm } from '../components/FarmContext';
import api from '../services/api';

const AdminScreen = () => {
  const { userInfo } = useAuth();
  const { selectedFarm } = useFarm();
  
  const [loading, setLoading] = useState(true);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [vets, setVets] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  useEffect(() => {
    if (selectedFarm) {
      const fincaId = selectedFarm.id_finca || selectedFarm._id;
      console.log('Finca seleccionada cambió:', fincaId);
      loadPersonnel();
    }
  }, [selectedFarm]);
  
  const loadPersonnel = async () => {
    setLoading(true);
    try {
      if (!selectedFarm) {
        console.log('No hay finca seleccionada');
        setWorkers([]);
        setVets([]);
        return;
      }

      // Usar id_finca en lugar de _id
      const fincaId = selectedFarm.id_finca || selectedFarm._id;
      console.log('Cargando personal para la finca:', fincaId);
      
      // Cargar trabajadores
      const workersResponse = await api.farms.getWorkers(fincaId);
      console.log('Respuesta de trabajadores:', workersResponse);
      
      // Asegurarse de que workersResponse sea un array
      const workersData = Array.isArray(workersResponse) ? workersResponse : 
                         Array.isArray(workersResponse.data) ? workersResponse.data : [];
      
      setWorkers(workersData.map(worker => ({
        _id: worker.id_usuario || worker._id,
        name: worker.nombre_completo || `${worker.primer_nombre || ''} ${worker.primer_apellido || ''}`.trim(),
        email: worker.correo || 'Sin correo',
        role: 'trabajador'
      })));
      
      // Cargar veterinarios
      const vetsResponse = await api.farms.getVeterinarians(fincaId);
      console.log('Respuesta de veterinarios:', vetsResponse);
      
      // Asegurarse de que vetsResponse sea un array
      const vetsData = Array.isArray(vetsResponse) ? vetsResponse : 
                      Array.isArray(vetsResponse.data) ? vetsResponse.data : [];
      
      setVets(vetsData.map(vet => ({
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
  
  const handleDelete = (person, type) => {
    setSelectedUser({ ...person, type });
    setDeleteModalVisible(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedUser) return;
    
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
  
  const handleAddNewStaff = async (tipo) => {
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
      
      console.log("Enviando solicitud para generar código:", {
        idFinca: idFinca,
        tipo: tipoUsuario,
        duracionMinutos: 1440
      });
      
      // Llamar a la API para generar un código de vinculación
      const response = await api.post('/vincular/generar', {
        idFinca: idFinca,
        tipo: tipoUsuario,
        duracionMinutos: 1440 // 24 horas
      });
      
      console.log("Respuesta completa:", JSON.stringify(response));
      
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
        
        Alert.alert(
          tipoUsuario === 'trabajador' ? "Invitar Trabajador" : "Invitar Veterinario",
          `Comparte este código con la persona que quieres invitar:\n\n${codigo}\n\nEste código expira el ${formatoFecha}.`,
          [
            { 
              text: "Copiar Código", 
              onPress: async () => {
                try {
                  await Clipboard.setString(codigo);
                  Alert.alert("Código copiado", "Compártelo con el colaborador");
                } catch (error) {
                  console.error("Error al copiar al portapapeles:", error);
                  Alert.alert("Error", "No se pudo copiar el código");
                }
              } 
            },
            { text: "Cerrar" }
          ]
        );
      } else if (response && response.success) {
        // Formato alternativo de respuesta
        const codigo = response.data.codigo;
        const expiraEn = new Date(response.data.expiraEn);
        
        // Formatear fecha de expiración
        const formatoFecha = expiraEn.toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        Alert.alert(
          tipoUsuario === 'trabajador' ? "Invitar Trabajador" : "Invitar Veterinario",
          `Comparte este código con la persona que quieres invitar:\n\n${codigo}\n\nEste código expira el ${formatoFecha}.`,
          [
            { 
              text: "Copiar Código", 
              onPress: async () => {
                try {
                  await Clipboard.setString(codigo);
                  Alert.alert("Código copiado", "Compártelo con el colaborador");
                } catch (error) {
                  console.error("Error al copiar al portapapeles:", error);
                  Alert.alert("Error", "No se pudo copiar el código");
                }
              } 
            },
            { text: "Cerrar" }
          ]
        );
      } else {
        console.error("Respuesta inesperada:", response);
        throw new Error(`Respuesta inválida del servidor: ${JSON.stringify(response)}`);
      }
    } catch (error) {
      console.error("Error generando código de vinculación:", error);
      Alert.alert(
        "Error", 
        `No se pudo generar el código de vinculación. ${error.message || ''}`
      );
    } finally {
      setGeneratingCode(false);
    }
  };
  
  const renderPersonItem = ({ item, type }) => (
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
  
  if (loading && workers.length === 0 && vets.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando personal...</Text>
      </View>
    );
  }
  
  return (
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
          <ActivityIndicator size="small" color={colors.white} />
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
          <ActivityIndicator size="small" color={colors.white} />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.text,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    ...getShadowStyle(),
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  personItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  personRole: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...getShadowStyle(),
    minHeight: 50,
  },
  disabledButton: {
    backgroundColor: colors.textLight,
    opacity: 0.7,
  },
  addButtonText: {
    color: colors.white,
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
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    ...getShadowStyle(),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: colors.text,
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
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
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
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  }
});

export default AdminScreen; 