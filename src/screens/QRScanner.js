import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { qrScannerStyles } from '../styles/qrScannerStyles';

const QRScanner = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    try {
      setScanned(true);
      
      // Intentar parsear los datos del QR
      const qrData = JSON.parse(data);
      
      if (qrData.deepLink) {
        // Si tiene un deepLink, extraer el ID del ganado
        const cattleId = qrData.deepLink.split('/').pop();
        if (cattleId) {
          router.push({
            pathname: '/(tabs)/cattle-details',
            params: { id: cattleId }
          });
          return;
        }
      }
      
      // Si no tiene deepLink pero tiene datos del ganado
      if (qrData.data && qrData.data.id) {
        router.push({
          pathname: '/(tabs)/cattle-details',
          params: { id: qrData.data.id }
        });
        return;
      }

      // Si no se pudo procesar el QR correctamente
      Alert.alert(
        'Error',
        'El código QR no contiene información válida de ganado',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    } catch (error) {
      console.error('Error al procesar el código QR:', error);
      Alert.alert(
        'Error',
        'No se pudo procesar el código QR. Asegúrate de escanear un código QR válido de CowTracker.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (hasPermission === null) {
    return (
      <View style={qrScannerStyles.container}>
        <Text style={qrScannerStyles.message}>Solicitando permiso de cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={qrScannerStyles.container}>
        <Text style={qrScannerStyles.message}>Sin acceso a la cámara</Text>
        <TouchableOpacity 
          style={qrScannerStyles.button} 
          onPress={() => Linking.openSettings()}
        >
          <Text style={qrScannerStyles.buttonText}>Abrir Configuración</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={qrScannerStyles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={qrScannerStyles.camera}
      >
        <View style={qrScannerStyles.overlay}>
          <View style={qrScannerStyles.scanFrame} />
          
          <TouchableOpacity 
            style={qrScannerStyles.backButton} 
            onPress={handleGoBack}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <Text style={qrScannerStyles.instructions}>
            Coloca el código QR dentro del marco
          </Text>

          {scanned && (
            <TouchableOpacity
              style={qrScannerStyles.rescanButton}
              onPress={() => setScanned(false)}
            >
              <Text style={qrScannerStyles.buttonText}>Escanear Otro</Text>
            </TouchableOpacity>
          )}
        </View>
      </BarCodeScanner>
    </View>
  );
};

export default QRScanner;
