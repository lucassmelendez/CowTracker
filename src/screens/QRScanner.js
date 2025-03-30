import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const QRScanner = () => {
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  // Simulación de escaneo para pruebas
  const simulateQRScan = () => {
    setScanned(true);
    
    // Datos de ejemplo para simular un escaneo exitoso
    const mockData = JSON.stringify({ id: "12345", name: "Vaca de prueba" });
    
    Alert.alert(
      'Código QR Simulado',
      `Se ha simulado un escaneo de código QR con información de ganado.\n\n¿Desea ver los detalles?`,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => setScanned(false) },
        { 
          text: 'Ver Detalles', 
          onPress: () => {
            router.push(`/cattle-detail?id=12345`);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <Ionicons name="warning-outline" size={50} color="#e74c3c" />
        <Text style={styles.title}>Escáner QR no disponible</Text>
        <Text style={styles.message}>
          El escáner de códigos QR no está disponible en este momento debido a problemas técnicos.
        </Text>
        <Text style={styles.subMessage}>
          {Platform.OS === 'web' 
            ? 'Esta función puede no estar disponible en navegadores web. Intenta usar la aplicación móvil para escanear códigos QR.'
            : 'Asegúrate de tener los permisos de cámara habilitados y la última versión de la aplicación.'}
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={simulateQRScan}>
            <Text style={styles.buttonText}>Simular escaneo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, {backgroundColor: '#7f8c8d', marginTop: 10}]} onPress={handleGoBack}>
            <Text style={styles.buttonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subMessage: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default QRScanner;
