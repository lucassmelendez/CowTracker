import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const FarmsScreen = () => {
  const router = useRouter();
  // Datos de ejemplo para granjas
  const [farms, setFarms] = useState([
    { id: '1', name: 'Rancho El Paraíso', location: 'San Juan', size: '150 hectáreas', cattleCount: 42 },
    { id: '2', name: 'Finca Los Olivos', location: 'Santa Rosa', size: '75 hectáreas', cattleCount: 28 },
    { id: '3', name: 'Hacienda Buena Vista', location: 'Las Flores', size: '200 hectáreas', cattleCount: 65 },
  ]);

  // Estado para el modal de agregar/editar granja
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmSize, setFarmSize] = useState('');

  const openAddModal = () => {
    setEditingFarm(null);
    setFarmName('');
    setFarmLocation('');
    setFarmSize('');
    setModalVisible(true);
  };

  const openEditModal = (farm) => {
    setEditingFarm(farm);
    setFarmName(farm.name);
    setFarmLocation(farm.location);
    setFarmSize(farm.size);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!farmName || !farmLocation || !farmSize) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    if (editingFarm) {
      // Editar granja existente
      const updatedFarms = farms.map(farm => 
        farm.id === editingFarm.id 
          ? { ...farm, name: farmName, location: farmLocation, size: farmSize } 
          : farm
      );
      setFarms(updatedFarms);
      Alert.alert('Éxito', 'Granja actualizada correctamente');
    } else {
      // Agregar nueva granja
      const newFarm = {
        id: Date.now().toString(),
        name: farmName,
        location: farmLocation,
        size: farmSize,
        cattleCount: 0
      };
      setFarms([...farms, newFarm]);
      Alert.alert('Éxito', 'Granja agregada correctamente');
    }
    
    setModalVisible(false);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de eliminar esta granja?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            const updatedFarms = farms.filter(farm => farm.id !== id);
            setFarms(updatedFarms);
            Alert.alert('Éxito', 'Granja eliminada correctamente');
          }
        }
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.farmName}>{item.name}</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => openEditModal(item)}
          >
            <Ionicons name="create-outline" size={20} color="#27ae60" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={18} color="#555" />
          <Text style={styles.infoText}>{item.location}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="resize-outline" size={18} color="#555" />
          <Text style={styles.infoText}>{item.size}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="browsers-outline" size={18} color="#555" />
          <Text style={styles.infoText}>{item.cattleCount} animales</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Granjas</Text>
        <Text style={styles.subtitle}>Gestiona tus propiedades</Text>
      </View>

      <FlatList
        data={farms}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={60} color="#ddd" />
            <Text style={styles.emptyText}>No tienes granjas registradas</Text>
            <Text style={styles.emptySubtext}>Agrega una nueva granja para comenzar</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingFarm ? 'Editar Granja' : 'Agregar Granja'}
            </Text>

            <Text style={styles.label}>Nombre</Text>
            <TextInput 
              style={styles.input}
              value={farmName}
              onChangeText={setFarmName}
              placeholder="Nombre de la granja"
            />

            <Text style={styles.label}>Ubicación</Text>
            <TextInput 
              style={styles.input}
              value={farmLocation}
              onChangeText={setFarmLocation}
              placeholder="Ubicación"
            />

            <Text style={styles.label}>Tamaño</Text>
            <TextInput 
              style={styles.input}
              value={farmSize}
              onChangeText={setFarmSize}
              placeholder="Ej. 150 hectáreas"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
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
    backgroundColor: '#f5f5f5',
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
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginTop: 5,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  farmName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
  },
  infoContainer: {
    marginTop: 5,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#27ae60',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#777',
    marginTop: 10,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '48%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    padding: 12,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FarmsScreen; 