import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Modal,
  ActivityIndicator
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
  const [workers, setWorkers] = useState([]);
  const [vets, setVets] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  useEffect(() => {
    if (selectedFarm?._id) {
      loadPersonnel();
    }
  }, [selectedFarm]);
  
  const loadPersonnel = async () => {
    setLoading(true);
    try {
      // Cargar trabajadores
      const workersResponse = await api.farms.getWorkers(selectedFarm._id);
      setWorkers(workersResponse.data || []);
      
      // Cargar veterinarios
      const vetsResponse = await api.farms.getVeterinarians(selectedFarm._id);
      setVets(vetsResponse.data || []);
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
  
  const generateInviteCode = () => {
    // Genera un código de 6 caracteres para invitar a un colaborador
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };
  
  const handleAddNewStaff = async (type) => {
    try {
      const inviteCode = generateInviteCode();
      
      // Aquí se registraría el código en la base de datos para usarlo en una invitación
      // Por ahora solo mostramos un mensaje con el código generado
      Alert.alert(
        type === 'worker' ? "Invitar Trabajador" : "Invitar Veterinario",
        `Comparte este código con la persona que quieres invitar:\n\n${inviteCode}\n\nEste código es válido por 24 horas.`,
        [
          { 
            text: "Copiar Código", 
            onPress: () => {
              // Aquí iría la función para copiar al portapapeles
              Alert.alert("Código copiado", "Compártelo con el colaborador");
            } 
          },
          { text: "Cerrar" }
        ]
      );
    } catch (error) {
      console.error("Error generando código de invitación:", error);
      Alert.alert("Error", "No se pudo generar el código de invitación");
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
      </View>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => handleAddNewStaff('worker')}
      >
        <Text style={styles.addButtonText}>Vincular nuevo trabajador</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.addButton, { marginTop: 10 }]}
        onPress={() => handleAddNewStaff('vet')}
      >
        <Text style={styles.addButtonText}>Vincular nuevo veterinario</Text>
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
    ...getShadowStyle(),
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