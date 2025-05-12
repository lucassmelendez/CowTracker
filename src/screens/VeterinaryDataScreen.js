import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { useAuth } from '../components/AuthContext';
import { colors } from '../styles/colors';

const VeterinaryDataScreen = () => {
  const [cattle, setCattle] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchCattle = async () => {
      try {
        setLoading(true);
        const data = await api.cattle.getAllWithFarmInfo();
        setCattle(data);
      } catch (err) {
        console.error('Error al cargar ganado:', err);
        setError('No se pudo cargar la lista de ganado');
        Alert.alert('Error', 'No se pudo cargar la lista de ganado');
      } finally {
        setLoading(false);
      }
    };

    fetchCattle();
  }, []);

  const navigateToAddVeterinaryRecord = (cattleId) => {
    router.push(`/add-veterinary-record?id=${cattleId}`);
  };

  const navigateToCattleDetail = (cattleId) => {
    router.push(`/cattle-details?id=${cattleId}`);
  };

  const renderCattleItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.cattleCard}
        onPress={() => navigateToCattleDetail(item._id)}
      >
        <View style={styles.cattleHeader}>
          <Text style={styles.cattleIdentifier}>
            {item.identificationNumber || 'Sin ID'}
          </Text>
          <Text style={styles.cattleName}>
            {item.name || 'Sin nombre'}
          </Text>
        </View>

        <View style={styles.cattleInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Raza:</Text>
            <Text style={styles.infoValue}>{item.breed || 'No especificada'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Género:</Text>
            <Text style={styles.infoValue}>
              {item.gender ? (item.gender === 'macho' ? 'Macho' : 'Hembra') : 'No especificado'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estado de salud:</Text>
            <Text style={styles.infoValue}>{item.healthStatus || 'No especificado'}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addRecordButton}
          onPress={() => navigateToAddVeterinaryRecord(item._id)}
        >
          <Ionicons name="medical" size={16} color="#fff" />
          <Text style={styles.addRecordButtonText}>Agregar registro veterinario</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando ganado...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={50} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.reload()}>
          <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cattle.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="information-circle" size={50} color={colors.textLight} />
        <Text style={styles.emptyText}>No hay ganado registrado</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/add-cattle')}
        >
          <Text style={styles.addButtonText}>Agregar ganado</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registros Veterinarios</Text>
      <Text style={styles.subtitle}>
        Seleccione un ganado para ver o agregar registros veterinarios
      </Text>
      
      <FlatList
        data={cattle}
        renderItem={renderCattleItem}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 15,
  },
  listContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
  addButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cattleCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cattleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cattleIdentifier: {
    fontSize: 14,
    color: colors.textLight,
    backgroundColor: colors.lightBackground,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 10,
  },
  cattleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  cattleInfo: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textLight,
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  addRecordButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
  },
  addRecordButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default VeterinaryDataScreen; 