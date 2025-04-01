import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const QRScanner = () => {
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const simulateQRScan = () => {
    setScanned(true);
    
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
      <View style={styles.cameraSimulator}>
        <View style={styles.cameraOverlay}>
          <View style={styles.scannerFrame} />
          <Text style={styles.simulatorText}>Vista previa de cámara</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      
      <View style={styles.messageContainer}>
        <Ionicons name="information-circle-outline" size={40} color="#3498db" />
        <Text style={styles.title}>Modo de Simulación</Text>
        <Text style={styles.message}>
          El escáner QR está funcionando en modo de simulación debido a problemas técnicos con el módulo de cámara.
        </Text>
        
        <TouchableOpacity style={styles.scanButton} onPress={simulateQRScan}>
          <Ionicons name="qr-code-outline" size={24} color="white" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Simular escaneo QR</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, {backgroundColor: '#7f8c8d', marginTop: 10}]} onPress={handleGoBack}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraSimulator: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#222',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#27ae60',
    backgroundColor: 'transparent',
  },
  simulatorText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    marginTop: 20,
  },
  messageContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#333',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  scanButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
});

export default QRScanner;
