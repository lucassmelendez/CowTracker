import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { qrScannerStyles } from '../styles/qrScannerStyles';

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
    <View style={qrScannerStyles.container}>
      <View style={qrScannerStyles.cameraSimulator}>
        <View style={qrScannerStyles.cameraOverlay}>
          <View style={qrScannerStyles.scannerFrame} />
          <Text style={qrScannerStyles.simulatorText}>Vista previa de cámara</Text>
        </View>
      </View>
      
      <TouchableOpacity style={qrScannerStyles.backButton} onPress={handleGoBack}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      
      <View style={qrScannerStyles.messageContainer}>
        <Ionicons name="information-circle-outline" size={40} color="#3498db" />
        <Text style={qrScannerStyles.title}>Modo de Simulación</Text>
        <Text style={qrScannerStyles.message}>
          El escáner QR está funcionando en modo de simulación debido a problemas técnicos con el módulo de cámara.
        </Text>
        
        <TouchableOpacity style={qrScannerStyles.scanButton} onPress={simulateQRScan}>
          <Ionicons name="qr-code-outline" size={24} color="white" style={qrScannerStyles.buttonIcon} />
          <Text style={qrScannerStyles.buttonText}>Simular escaneo QR</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[qrScannerStyles.button, {backgroundColor: '#7f8c8d', marginTop: 10}]} onPress={handleGoBack}>
          <Text style={qrScannerStyles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default QRScanner;
