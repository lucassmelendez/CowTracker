import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { cattleDetailStyles } from '../styles/cattleDetailStyles';
import { useAuth } from '../components/AuthContext';
import api from '../services/api';

const CattleDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cattleId = params?.id;
  const { user } = useAuth();
  
  console.log('Parámetros recibidos:', { id: cattleId });
  
  const [cattle, setCattle] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [debug, setDebug] = useState(null);

  // Cargar datos del ganado
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!cattleId) {
        setError('ID de ganado no proporcionado');
        setLoading(false);
        return;
      }
      
      try {
        // Obtener datos del ganado usando la API
        const cattleData = await api.cattle.getById(cattleId);
        if (isMounted) {
          setCattle(cattleData);
          setDebug(JSON.stringify(cattleData, null, 2));
          
          // Obtener registros médicos usando la API
          try {
            const records = await api.cattle.getMedicalRecords(cattleId);
            if (isMounted) {
              setMedicalRecords(records || []);
            }
          } catch (medError) {
            console.error('Error al cargar registros médicos:', medError);
            // Continuar incluso si los registros médicos fallan
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('No se pudo cargar la información del ganado');
          console.error('Error al obtener detalles del ganado:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [cattleId]);

  // Formatear fechas (manejo seguro de timestamps de Firestore)
  const formatDate = (dateValue) => {
    if (!dateValue) return 'No disponible';
    
    try {
      let date;
      if (typeof dateValue === 'object' && dateValue.seconds) {
        // Es un timestamp de Firestore
        date = new Date(dateValue.seconds * 1000);
      } else {
        // Es otro formato de fecha
        date = new Date(dateValue);
      }
      
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (err) {
      console.error('Error al formatear fecha:', err);
      return 'Error en formato';
    }
  };

  // Manejadores de eventos
  const handleEdit = () => {
    if (cattleId) {
      router.push(`/add-cattle?id=${cattleId}`);
    }
  };

  const confirmDelete = () => {
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!cattleId) {
      Alert.alert('Error', 'ID de ganado no disponible');
      return;
    }
    
    try {
      // Eliminar ganado usando la API
      await api.cattle.delete(cattleId);
      Alert.alert('Éxito', 'Ganado eliminado correctamente');
      setDeleteModalVisible(false);
      router.replace('/explore');
    } catch (err) {
      console.error('Error al eliminar:', err);
      Alert.alert('Error', 'No se pudo eliminar el ganado');
    }
  };

  // Pantalla de carga
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

  // Pantalla de error
  if (error || !cattle) {
    return (
      <View style={cattleDetailStyles.container}>
        <View style={cattleDetailStyles.header}>
          <Text style={cattleDetailStyles.name}>{error || 'No se encontró el ganado'}</Text>
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
        {/* Encabezado */}
        <View style={cattleDetailStyles.header}>
          <Text style={cattleDetailStyles.identifier}>
            {cattle.identificationNumber || 'Sin identificación'}
          </Text>
          <Text style={cattleDetailStyles.name}>
            {cattle.name || 'Sin nombre'}
          </Text>
          
          <View style={cattleDetailStyles.tagContainer}>
            <View style={cattleDetailStyles.tag}>
              <Text style={cattleDetailStyles.tagText}>
                {cattle.breed || 'Sin raza'}
              </Text>
            </View>
            <View style={cattleDetailStyles.tag}>
              <Text style={cattleDetailStyles.tagText}>
                {cattle.gender ? (cattle.gender === 'macho' ? 'Macho' : 'Hembra') : 'Sin género'}
              </Text>
            </View>
            <View style={[cattleDetailStyles.tag, cattleDetailStyles.healthTag]}>
              <Text style={cattleDetailStyles.tagText}>
                {cattle.healthStatus || 'Estado desconocido'}
              </Text>
            </View>
          </View>
        </View>

        {/* Información General */}
        <View style={cattleDetailStyles.infoCard}>
          <Text style={cattleDetailStyles.sectionTitle}>Información General</Text>
          
          <View style={cattleDetailStyles.infoRow}>
            <Text style={cattleDetailStyles.infoLabel}>Identificador</Text>
            <Text style={cattleDetailStyles.infoValue}>
              {cattle.identificationNumber || 'No disponible'}
            </Text>
          </View>
          
          <View style={cattleDetailStyles.infoRow}>
            <Text style={cattleDetailStyles.infoLabel}>Tipo</Text>
            <Text style={cattleDetailStyles.infoValue}>
              {cattle.type || 'No disponible'}
            </Text>
          </View>
          
          <View style={cattleDetailStyles.infoRow}>
            <Text style={cattleDetailStyles.infoLabel}>Fecha de nacimiento</Text>
            <Text style={cattleDetailStyles.infoValue}>
              {cattle.birthDate ? formatDate(cattle.birthDate) : 'No disponible'}
            </Text>
          </View>
          
          <View style={cattleDetailStyles.infoRow}>
            <Text style={cattleDetailStyles.infoLabel}>Peso</Text>
            <Text style={cattleDetailStyles.infoValue}>
              {cattle.weight ? `${cattle.weight} kg` : 'No disponible'}
            </Text>
          </View>
          
          <View style={cattleDetailStyles.infoRow}>
            <Text style={cattleDetailStyles.infoLabel}>Estado</Text>
            <Text style={cattleDetailStyles.infoValue}>
              {cattle.status ? cattle.status.charAt(0).toUpperCase() + cattle.status.slice(1) : 'No disponible'}
            </Text>
          </View>
          
          <View style={cattleDetailStyles.infoRow}>
            <Text style={cattleDetailStyles.infoLabel}>Salud</Text>
            <Text style={cattleDetailStyles.infoValue}>
              {cattle.healthStatus ? cattle.healthStatus.charAt(0).toUpperCase() + cattle.healthStatus.slice(1) : 'No disponible'}
            </Text>
          </View>
          
          {/* Verificación de ubicación */}
          {cattle.location && cattle.location.farm && (
            <View style={cattleDetailStyles.infoRow}>
              <Text style={cattleDetailStyles.infoLabel}>Rancho</Text>
              <Text style={cattleDetailStyles.infoValue}>
                {typeof cattle.location.farm === 'object' && cattle.location.farm.name 
                  ? cattle.location.farm.name 
                  : 'Rancho asignado'}
              </Text>
            </View>
          )}
          
          {cattle.location && cattle.location.area && (
            <View style={cattleDetailStyles.infoRow}>
              <Text style={cattleDetailStyles.infoLabel}>Área</Text>
              <Text style={cattleDetailStyles.infoValue}>
                {cattle.location.area}
              </Text>
            </View>
          )}
        </View>

        {/* Información de Compra */}
        {(cattle.purchaseDate || cattle.purchasePrice) && (
          <View style={cattleDetailStyles.infoCard}>
            <Text style={cattleDetailStyles.sectionTitle}>Información de Compra</Text>
            
            {cattle.purchaseDate && (
              <View style={cattleDetailStyles.infoRow}>
                <Text style={cattleDetailStyles.infoLabel}>Fecha de compra</Text>
                <Text style={cattleDetailStyles.infoValue}>
                  {formatDate(cattle.purchaseDate)}
                </Text>
              </View>
            )}
            
            {cattle.purchasePrice && (
              <View style={cattleDetailStyles.infoRow}>
                <Text style={cattleDetailStyles.infoLabel}>Precio de compra</Text>
                <Text style={cattleDetailStyles.infoValue}>
                  ${cattle.purchasePrice}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Historial Médico */}
        <View style={cattleDetailStyles.infoCard}>
          <Text style={cattleDetailStyles.sectionTitle}>Historial Médico</Text>
          
          {medicalRecords && medicalRecords.length > 0 ? (
            medicalRecords.map((record, index) => (
              <View key={record._id || `med-${index}`} style={cattleDetailStyles.medicalRecord}>
                <Text style={cattleDetailStyles.medicalDate}>
                  {record.date ? formatDate(record.date) : 'Fecha no disponible'}
                </Text>
                
                {record.treatment && (
                  <Text style={cattleDetailStyles.medicalTreatment}>
                    {record.treatment}
                  </Text>
                )}
                
                {record.veterinarian && (
                  <Text style={cattleDetailStyles.medicalVet}>
                    {record.veterinarian}
                  </Text>
                )}
                
                {record.notes && (
                  <Text style={cattleDetailStyles.medicalNotes}>
                    {record.notes}
                  </Text>
                )}
              </View>
            ))
          ) : (
            <Text style={cattleDetailStyles.emptyText}>
              No hay registros médicos disponibles
            </Text>
          )}
        </View>

        {/* Notas */}
        {cattle.notes && (
          <View style={cattleDetailStyles.infoCard}>
            <Text style={cattleDetailStyles.sectionTitle}>Notas</Text>
            <Text style={cattleDetailStyles.notes}>
              {cattle.notes}
            </Text>
          </View>
        )}

        {/* Botones de acción */}
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

      {/* Modal de confirmación de eliminación */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={cattleDetailStyles.modalContainer}>
          <View style={cattleDetailStyles.modalContent}>
            <Text style={cattleDetailStyles.modalTitle}>
              Confirmar eliminación
            </Text>
            <Text style={cattleDetailStyles.modalText}>
              ¿Está seguro que desea eliminar {cattle?.name ? `a ${cattle.name}` : 'este ganado'}? 
              Esta acción no se puede deshacer.
            </Text>
            
            <View style={cattleDetailStyles.modalButtonsContainer}>
              <TouchableOpacity
                style={[cattleDetailStyles.modalButton, cattleDetailStyles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={cattleDetailStyles.cancelButtonText}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[cattleDetailStyles.modalButton, cattleDetailStyles.deleteButton]}
                onPress={handleDelete}
              >
                <Text style={cattleDetailStyles.buttonText}>
                  Eliminar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CattleDetailScreen;