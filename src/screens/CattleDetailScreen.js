import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getShadowStyle } from '../utils/styles';
import { deleteCattle } from '../services/firestore';

const CattleDetailScreen = ({ route }) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cattleId = route?.params?.cattleId || params.id;
  
  const cattleData = {
    id: '1',
    identifier: 'BOV-2023-001',
    name: 'Estrella',
    type: 'Vaca',
    breed: 'Holstein',
    gender: 'Hembra',
    dateOfBirth: '2020-05-15',
    weight: 450,
    healthStatus: 'Saludable',
    purchaseDate: '2021-01-10',
    purchasePrice: 1200,
    location: 'Potrero Norte',
    notes: 'Excelente productora de leche. Vacunada en marzo 2023.',
    milkProduction: [
      { date: '2023-01-15', amount: 28 },
      { date: '2023-01-16', amount: 30 },
      { date: '2023-01-17', amount: 27 },
      { date: '2023-01-18', amount: 29 },
    ],
    medicalRecords: [
      { date: '2022-10-05', treatment: 'Vacunación anual', veterinarian: 'Dr. García' },
      { date: '2023-03-12', treatment: 'Desparasitación', veterinarian: 'Dra. Pérez' },
    ]
  };


  const handleDelete = async () => {
    console.log('entre');
    try {
      console.log('ID del ganado a eliminar:', cattleId);
      await deleteCattle(cattleId);
      router.back(); 
    } catch (error) {
      console.error('Error al eliminar el ganado:', error);
      Alert.alert('Error', 'No se pudo eliminar el ganado');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const handleEdit = () => {
    console.log('Navegando a editar ganado:', cattleId);
    router.push('/add-cattle?id=' + cattleId);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.identifier}>{cattleData.identifier}</Text>
        <Text style={styles.name}>{cattleData.name}</Text>
        <View style={styles.tagContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{cattleData.type}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{cattleData.breed}</Text>
          </View>
          <View style={[styles.tag, styles.healthTag]}>
            <Text style={styles.tagText}>{cattleData.healthStatus}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Información general</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Género:</Text>
          <Text style={styles.infoValue}>{cattleData.gender}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Fecha de nacimiento:</Text>
          <Text style={styles.infoValue}>{formatDate(cattleData.dateOfBirth)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Peso:</Text>
          <Text style={styles.infoValue}>{cattleData.weight} kg</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ubicación:</Text>
          <Text style={styles.infoValue}>{cattleData.location}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Información económica</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Fecha de compra:</Text>
          <Text style={styles.infoValue}>{formatDate(cattleData.purchaseDate)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Precio de compra:</Text>
          <Text style={styles.infoValue}>${cattleData.purchasePrice}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Producción de leche reciente</Text>
        {cattleData.milkProduction.map((record, index) => (
          <View key={index} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{formatDate(record.date)}:</Text>
            <Text style={styles.infoValue}>{record.amount} litros</Text>
          </View>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Historial médico</Text>
        {cattleData.medicalRecords.map((record, index) => (
          <View key={index} style={styles.medicalRecord}>
            <Text style={styles.medicalDate}>{formatDate(record.date)}</Text>
            <Text style={styles.medicalTreatment}>{record.treatment}</Text>
            <Text style={styles.medicalVet}>Por: {record.veterinarian}</Text>
          </View>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Notas</Text>
        <Text style={styles.notes}>{cattleData.notes}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEdit}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    paddingBottom: 30,
    alignItems: 'center',
  },
  identifier: {
    fontSize: 16,
    color: '#e0e0e0',
    marginBottom: 5,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  tagContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  healthTag: {
    backgroundColor: '#2ecc71',
  },
  tagText: {
    color: '#fff',
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    margin: 10,
    ...getShadowStyle(),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 15,
    color: '#555',
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  medicalRecord: {
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  medicalDate: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  medicalTreatment: {
    fontSize: 15,
    color: '#555',
    marginTop: 4,
  },
  medicalVet: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
    fontStyle: 'italic',
  },
  notes: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 30,
  },
  editButton: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    ...getShadowStyle(),
  },
});

export default CattleDetailScreen;