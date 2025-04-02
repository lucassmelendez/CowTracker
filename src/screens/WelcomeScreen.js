import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../components/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { welcomeStyles } from '../styles/welcomeStyles';
import api from '../services/api';

const WelcomeScreen = () => {
  const router = useRouter();
  const { userInfo } = useAuth();
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmSize, setFarmSize] = useState('');

  const [isCreating, setIsCreating] = useState(false);

  const handleCreateFarm = async () => {
    if (isCreating) return;

    if (!farmName || !farmLocation || !farmSize) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    if (!userInfo || !userInfo.uid) {
      console.error('Error: No hay información de usuario disponible');
      Alert.alert('Error', 'No se pudo verificar la información del usuario. Por favor, inicia sesión nuevamente.');
      return;
    }

    setIsCreating(true);

    try {
      const farmData = {
        name: farmName,
        location: farmLocation,
        size: farmSize
      };

      await api.farms.create(farmData);
      console.log('Granja creada exitosamente');
      setIsCreating(false);
      Alert.alert('Éxito', 'Granja creada exitosamente', [
        { text: 'OK', onPress: () => router.push('/farms') }
      ]);
    } catch (error) {
      console.error('Error al crear la granja:', error);
      Alert.alert('Error', 'No se pudo crear la granja. Por favor, intenta de nuevo.');
      setIsCreating(false);
    }
  };

  return (
    <View style={welcomeStyles.container}>
      <View style={welcomeStyles.welcomeContainer}>
        <Ionicons name="leaf-outline" size={60} color="#27ae60" />
        <Text style={welcomeStyles.welcomeTitle}>¡Bienvenido, {userInfo?.name}!</Text>
        <Text style={welcomeStyles.welcomeText}>
          Para comenzar a usar CowTracker, crea tu primera granja
        </Text>
      </View>

      <View style={welcomeStyles.formContainer}>
        <Text style={welcomeStyles.label}>Nombre de la Granja</Text>
        <TextInput
          style={welcomeStyles.input}
          value={farmName}
          onChangeText={setFarmName}
          placeholder="Ej: Rancho El Paraíso"
        />

        <Text style={welcomeStyles.label}>Ubicación</Text>
        <TextInput
          style={welcomeStyles.input}
          value={farmLocation}
          onChangeText={setFarmLocation}
          placeholder="Ej: San Juan"
        />

        <Text style={welcomeStyles.label}>Tamaño</Text>
        <TextInput
          style={welcomeStyles.input}
          value={farmSize}
          onChangeText={setFarmSize}
          placeholder="Ej: 150 hectáreas"
        />

        <TouchableOpacity
          style={welcomeStyles.createButton}
          onPress={handleCreateFarm}
        >
          <Text style={welcomeStyles.buttonText}>Crear Granja</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WelcomeScreen;