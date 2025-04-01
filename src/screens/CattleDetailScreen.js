import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { cattleDetailStyles } from '../styles/cattleDetailStyles';
import { getCattleById, deleteCattle, getMedicalRecords } from '../services/firestore';

const CattleDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [cattle, setCattle] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    const loadCattleData = async () => {
      try {
        setLoading(true);
        const cattleData = await getCattleById(id);
        setCattle(cattleData);
        
        const medicalData = await getMedicalRecords(id);
        setMedicalRecords(medicalData);
      } catch (error) {
        console.error('Error al cargar datos del ganado:', error);
        Alert.alert('Error', 'No se pudieron cargar los datos del ganado');
      } finally {
        setLoading(false);
      }
    };

    loadCattleData();
  }, [id]);

  const handleEdit = () => {
    router.push(`/add-cattle?id=${id}`);
  };

  const confirmDelete = () => {
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      await deleteCattle(id);
      Alert.alert('Éxito', 'Ganado eliminado correctamente');
      setDeleteModalVisible(false);
      router.replace('/explore');
    } catch (error) {
      console.error('Error al eliminar el ganado:', error);
      Alert.alert('Error', 'No se pudo eliminar el ganado');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    
    let date;
    if (typeof dateString === 'object' && dateString.seconds) {
      date = new Date(dateString.seconds * 1000);
    } else {
      date = new Date(dateString);
    }
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={cattleDetailStyles.container}>
        <View style={[cattleDetailStyles.header, cattleDetailStyles.loadingContainer]}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={cattleDetailStyles.loadingText}>Cargando datos...</Text>
        </View>
      </View>
    );
  }

  if (!cattle) {
    return (
      <View style={cattleDetailStyles.container}>
        <View style={cattleDetailStyles.header}>
          <Text style={cattleDetailStyles.name}>No se encontró el ganado</Text>
        </View>
        <TouchableOpacity 
          style={cattleDetailStyles.backButton}
          onPress={() => router.back()}
        >
          <Text style={cattleDetailStyles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={cattleDetailStyles.container}>
      <ScrollView>
        <View style={cattleDetailStyles.header}>
          <Text style={cattleDetailStyles.identifier}>{cattle.identificationNumber}</Text>
          <Text style={cattleDetailStyles.name}>{cattle.name || 'Sin nombre'}</Text>
          
          <View style={cattleDetailStyles.tagContainer}>
            <View style={cattleDetailStyles.tag}>
              <Text style={cattleDetailStyles.tagText}>{cattle.breed}</Text>
            </View>
            <View style={cattleDetailStyles.tag}>
              <Text style={cattleDetailStyles.tagText}>{cattle.gender === 'macho' ? 'Macho' : 'Hembra'}</Text>
            </View>
            <View style={[cattleDetailStyles.tag, cattleDetailStyles.healthTag]}>
              <Text style={cattleDetailStyles.tagText}>{cattle.healthStatus}</Text>
            </View>
          </View>
        </View>

        <View style={cattleDetailStyles.infoCard}>
          <Text style={cattleDetailStyles.sectionTitle}>Información General</Text>
          
          <View style={cattleDetailStyles.infoRow}>
            <Text style={cattleDetailStyles.infoLabel}>Identificador</Text>
            <Text style={cattleDetailStyles.infoValue}>{cattle.identificationNumber}</Text>
          </View>
          
          <View style={cattleDetailStyles.infoRow}>
            <Text style={cattleDetailStyles.infoLabel}>Tipo</Text>
            <Text style={cattleDetailStyles.infoValue}>{cattle.type}</Text>
          </View>
          
          <View style={cattleDetailStyles.infoRow}>
            <Text style={cattleDetailStyles.infoLabel}>Fecha de nacimiento</Text>
            <Text style={cattleDetailStyles.infoValue}>{formatDate(cattle.birthDate)}</Text>
          </View>
          
          <View style={cattleDetailStyles.infoRow}>
            <Text style={cattleDetailStyles.infoLabel}>Peso</Text>
            <Text style={cattleDetailStyles.infoValue}>{cattle.weight} kg</Text>
          </View>
          
          <View style={cattleDetailStyles.infoRow}>
            <Text style={cattleDetailStyles.infoLabel}>Estado</Text>
            <Text style={cattleDetailStyles.infoValue}>{cattle.status}</Text>
          </View>
          
          <View style={cattleDetailStyles.infoRow}>
            <Text style={cattleDetailStyles.infoLabel}>Salud</Text>
            <Text style={cattleDetailStyles.infoValue}>{cattle.healthStatus}</Text>
          </View>
          
          {cattle.location && cattle.location.farm && (
            <View style={cattleDetailStyles.infoRow}>
              <Text style={cattleDetailStyles.infoLabel}>Rancho</Text>
              <Text style={cattleDetailStyles.infoValue}>
                {typeof cattle.location.farm === 'object' 
                  ? cattle.location.farm.name 
                  : 'Rancho asignado'}
              </Text>
            </View>
          )}
          
          {cattle.location && cattle.location.area && (
            <View style={cattleDetailStyles.infoRow}>
              <Text style={cattleDetailStyles.infoLabel}>Área</Text>
              <Text style={cattleDetailStyles.infoValue}>{cattle.location.area}</Text>
            </View>
          )}
        </View>

        {(cattle.purchaseDate || cattle.purchasePrice) && (
          <View style={cattleDetailStyles.infoCard}>
            <Text style={cattleDetailStyles.sectionTitle}>Información de Compra</Text>
            
            {cattle.purchaseDate && (
              <View style={cattleDetailStyles.infoRow}>
                <Text style={cattleDetailStyles.infoLabel}>Fecha de compra</Text>
                <Text style={cattleDetailStyles.infoValue}>{formatDate(cattle.purchaseDate)}</Text>
              </View>
            )}
            
            {cattle.purchasePrice && (
              <View style={cattleDetailStyles.infoRow}>
                <Text style={cattleDetailStyles.infoLabel}>Precio de compra</Text>
                <Text style={cattleDetailStyles.infoValue}>${cattle.purchasePrice}</Text>
              </View>
            )}
          </View>
        )}

        <View style={cattleDetailStyles.infoCard}>
          <Text style={cattleDetailStyles.sectionTitle}>Historial Médico</Text>
          
          {medicalRecords && medicalRecords.length > 0 ? (
            medicalRecords.map((record, index) => (
              <View key={record._id || index} style={cattleDetailStyles.medicalRecord}>
                <Text style={cattleDetailStyles.medicalDate}>{formatDate(record.date)}</Text>
                <Text style={cattleDetailStyles.medicalTreatment}>{record.treatment}</Text>
                <Text style={cattleDetailStyles.medicalVet}>{record.veterinarian}</Text>
                {record.notes && <Text style={cattleDetailStyles.medicalNotes}>{record.notes}</Text>}
              </View>
            ))
          ) : (
            <Text style={cattleDetailStyles.emptyText}>No hay registros médicos disponibles</Text>
          )}
        </View>

        {cattle.notes && (
          <View style={cattleDetailStyles.infoCard}>
            <Text style={cattleDetailStyles.sectionTitle}>Notas</Text>
            <Text style={cattleDetailStyles.notes}>{cattle.notes}</Text>
          </View>
        )}

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
              ¿Está seguro que desea eliminar a {cattle?.name || cattle?.identificationNumber}? Esta acción no se puede deshacer.
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