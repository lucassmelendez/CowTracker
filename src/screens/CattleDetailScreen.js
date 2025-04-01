import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { cattleDetailStyles } from '../styles/cattleDetailStyles';

const CattleDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [cattle, setCattle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    // En una aplicación real, aquí se cargarían los datos del ganado desde una API o base de datos
    // Simulamos la carga con un timeout
    const timer = setTimeout(() => {
      setCattle({
        id: id,
        name: 'Bella',
        identifier: 'BOV-2023-001',
        breed: 'Holstein',
        gender: 'Hembra',
        birthDate: '2021-03-15',
        weight: '520 kg',
        health: 'Saludable',
        status: 'Activo',
        farm: 'Rancho Los Olivos',
        purchaseDate: '2021-06-10',
        purchasePrice: '$12,000',
        medicalHistory: [
          {
            date: '2023-01-15',
            treatment: 'Vacuna contra la aftosa',
            veterinarian: 'Dr. Martínez',
            notes: 'Aplicación anual',
          },
          {
            date: '2022-11-03',
            treatment: 'Desparasitación',
            veterinarian: 'Dra. González',
            notes: 'Tratamiento preventivo',
          },
        ],
        notes: 'Vaca lechera de alta producción. Temperamento tranquilo. Ha tenido dos partos exitosos.',
      });
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  const handleEdit = () => {
    router.push(`/cattle/edit/${id}`);
  };

  const confirmDelete = () => {
    setDeleteModalVisible(true);
  };

  const handleDelete = () => {
    // En una aplicación real, aquí se realizaría la eliminación en la base de datos
    Alert.alert('Éxito', 'Ganado eliminado correctamente');
    setDeleteModalVisible(false);
    router.replace('/cattle');
  };

  if (loading) {
    return (
      <View style={cattleDetailStyles.container}>
        <View style={cattleDetailStyles.header}>
          <Text style={cattleDetailStyles.name}>Cargando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={cattleDetailStyles.container}>
      <ScrollView>
        <View style={cattleDetailStyles.header}>
          <Text style={cattleDetailStyles.identifier}>{cattle.identifier}</Text>
          <Text style={cattleDetailStyles.name}>{cattle.name}</Text>
          
          <View style={cattleDetailStyles.tagContainer}>
            <View style={cattleDetailStyles.tag}>
              <Text style={cattleDetailStyles.tagText}>{cattle.breed}</Text>
            </View>
            <View style={cattleDetailStyles.tag}>
              <Text style={cattleDetailStyles.tagText}>{cattle.gender}</Text>
            </View>
            <View style={[cattleDetailStyles.tag, cattleDetailStyles.healthTag]}>
              <Text style={cattleDetailStyles.tagText}>{cattle.health}</Text>
            </View>
          </View>
        </View>

        <View style={cattleDetailStyles.infoCard}>
          <Text style={cattleDetailStyles.sectionTitle}>Información General</Text>
          
          <View style={cattleDetailStyles.infoRow}>
            <Text style={cattleDetailStyles.infoLabel}>Identificador</Text>
            <Text style={cattleDetailStyles.infoValue}>{cattle.identifier}</Text>
          </View>
          
          <View style={cattleDetailStyles.infoRow}>
            <Text style={cattleDetailStyles.infoLabel}>Fecha de nacimiento</Text>
            <Text style={cattleDetailStyles.infoValue}>{cattle.birthDate}</Text>
          </View>
          
          <View style={cattleDetailStyles.infoRow}>
            <Text style={cattleDetailStyles.infoLabel}>Peso</Text>
            <Text style={cattleDetailStyles.infoValue}>{cattle.weight}</Text>
          </View>
          
          <View style={cattleDetailStyles.infoRow}>
            <Text style={cattleDetailStyles.infoLabel}>Estado</Text>
            <Text style={cattleDetailStyles.infoValue}>{cattle.status}</Text>
          </View>
          
          <View style={cattleDetailStyles.infoRow}>
            <Text style={cattleDetailStyles.infoLabel}>Rancho</Text>
            <Text style={cattleDetailStyles.infoValue}>{cattle.farm}</Text>
          </View>
        </View>

        <View style={cattleDetailStyles.infoCard}>
          <Text style={cattleDetailStyles.sectionTitle}>Información de Compra</Text>
          
          <View style={cattleDetailStyles.infoRow}>
            <Text style={cattleDetailStyles.infoLabel}>Fecha de compra</Text>
            <Text style={cattleDetailStyles.infoValue}>{cattle.purchaseDate}</Text>
          </View>
          
          <View style={cattleDetailStyles.infoRow}>
            <Text style={cattleDetailStyles.infoLabel}>Precio de compra</Text>
            <Text style={cattleDetailStyles.infoValue}>{cattle.purchasePrice}</Text>
          </View>
        </View>

        <View style={cattleDetailStyles.infoCard}>
          <Text style={cattleDetailStyles.sectionTitle}>Historial Médico</Text>
          
          {cattle.medicalHistory.map((record, index) => (
            <View key={index} style={cattleDetailStyles.medicalRecord}>
              <Text style={cattleDetailStyles.medicalDate}>{record.date}</Text>
              <Text style={cattleDetailStyles.medicalTreatment}>{record.treatment}</Text>
              <Text style={cattleDetailStyles.medicalVet}>{record.veterinarian}</Text>
            </View>
          ))}
        </View>

        <View style={cattleDetailStyles.infoCard}>
          <Text style={cattleDetailStyles.sectionTitle}>Notas</Text>
          <Text style={cattleDetailStyles.notes}>{cattle.notes}</Text>
        </View>

        <View style={cattleDetailStyles.buttonContainer}>
          <TouchableOpacity 
            style={cattleDetailStyles.editButton}
            onPress={handleEdit}
          >
            <Ionicons name="pencil" size={18} color="#fff" />
            <Text style={cattleDetailStyles.buttonText}>Editar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={cattleDetailStyles.deleteButton}
            onPress={confirmDelete}
          >
            <Ionicons name="trash" size={18} color="#fff" />
            <Text style={cattleDetailStyles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={cattleDetailStyles.modalContainer}>
          <View style={cattleDetailStyles.modalContent}>
            <Text style={cattleDetailStyles.modalTitle}>Confirmar eliminación</Text>
            <Text style={cattleDetailStyles.modalText}>
              ¿Está seguro que desea eliminar a {cattle?.name}? Esta acción no se puede deshacer.
            </Text>
            
            <View style={cattleDetailStyles.modalButtonsContainer}>
              <TouchableOpacity
                style={[cattleDetailStyles.modalButton, cattleDetailStyles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={cattleDetailStyles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[cattleDetailStyles.modalButton, cattleDetailStyles.deleteButton]}
                onPress={handleDelete}
              >
                <Text style={cattleDetailStyles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CattleDetailScreen;