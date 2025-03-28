import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../components/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';
import { getShadowStyle } from '../utils/styles';

const WelcomeScreen = () => {
  const router = useRouter();
  const { userInfo } = useAuth();
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmSize, setFarmSize] = useState('');

  const handleCreateFarm = async () => {
    if (!farmName || !farmLocation || !farmSize) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    if (!userInfo || !userInfo.uid) {
      console.error('Error: No hay información de usuario disponible');
      Alert.alert('Error', 'No se pudo verificar la información del usuario. Por favor, inicia sesión nuevamente.');
      return;
    }

    try {
      console.log('Creando granja con datos:', { farmName, farmLocation, farmSize, userId: userInfo.uid });
      
      const farmData = {
        name: farmName,
        location: farmLocation,
        size: farmSize,
        userId: userInfo.uid,
        cattleCount: 0,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(firestore, 'farms'), farmData);
      console.log('Granja creada exitosamente con ID:', docRef.id);
      
      Alert.alert(
        'Éxito',
        'Tu granja ha sido creada exitosamente',
        [{ text: 'OK', onPress: () => router.push('/farms') }]
      );
    } catch (error) {
      console.error('Error al crear la granja:', error);
      Alert.alert('Error', 'No se pudo crear la granja. Por favor, intenta de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        <Ionicons name="leaf-outline" size={60} color="#27ae60" />
        <Text style={styles.welcomeTitle}>¡Bienvenido, {userInfo?.name}!</Text>
        <Text style={styles.welcomeText}>
          Para comenzar a usar CowTracker, crea tu primera granja
        </Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Nombre de la Granja</Text>
        <TextInput
          style={styles.input}
          value={farmName}
          onChangeText={setFarmName}
          placeholder="Ej: Rancho El Paraíso"
        />

        <Text style={styles.label}>Ubicación</Text>
        <TextInput
          style={styles.input}
          value={farmLocation}
          onChangeText={setFarmLocation}
          placeholder="Ej: San Juan"
        />

        <Text style={styles.label}>Tamaño</Text>
        <TextInput
          style={styles.input}
          value={farmSize}
          onChangeText={setFarmSize}
          placeholder="Ej: 150 hectáreas"
        />

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateFarm}
        >
          <Text style={styles.buttonText}>Crear Granja</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10
  },
  welcomeText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20
  },
  formContainer: {
    ...getShadowStyle(),
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20
  },
  label: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 5
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16
  },
  createButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default WelcomeScreen;