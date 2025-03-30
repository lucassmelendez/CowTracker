import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Importación segura del módulo de escáner
let BarCodeScanner;
let hasBarCodeScannerModule = false;

try {
  // Intentar importar el módulo
  const ExpoBarCodeScanner = require('expo-barcode-scanner');
  BarCodeScanner = ExpoBarCodeScanner.BarCodeScanner;
  hasBarCodeScannerModule = true;
  console.log('Módulo BarCodeScanner importado correctamente');
} catch (error) {
  console.log('Error al importar el módulo BarCodeScanner:', error);
  hasBarCodeScannerModule = false;
}

const QRScanner = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [moduleAvailable, setModuleAvailable] = useState(hasBarCodeScannerModule);
  const router = useRouter();

  useEffect(() => {
    const checkPermissions = async () => {
      if (!moduleAvailable) {
        console.log('Módulo BarCodeScanner no disponible');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Solicitando permisos de cámara...');
        const { status } = await require('expo-barcode-scanner').requestPermissionsAsync();
        console.log('Estado de permiso:', status);
        setHasPermission(status === 'granted');
      } catch (error) {
        console.error('Error al solicitar permisos:', error);
        setHasPermission(false);
        setModuleAvailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermissions();
  }, [moduleAvailable]);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    
    try {
      // Intenta analizar los datos como JSON
      const jsonData = JSON.parse(data);
      Alert.alert(
        'Código QR Escaneado',
        `Se ha escaneado un código QR con información de ganado.\n\n¿Desea ver los detalles?`,
        [
          { text: 'Cancelar', style: 'cancel', onPress: () => setScanned(false) },
          { 
            text: 'Ver Detalles', 
            onPress: () => {
              // Navegar a la pantalla de detalles con los datos escaneados
              if (jsonData.id) {
                router.push(`/cattle-detail?id=${jsonData.id}`);
              } else {
                Alert.alert('Error', 'El código QR no contiene un ID válido de ganado.');
                setScanned(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      // Si no es JSON, mostrar los datos como texto
      Alert.alert(
        'Código Escaneado',
        `Tipo: ${type}\nDatos: ${data}`,
        [
          { text: 'OK', onPress: () => setScanned(false) }
        ]
      );
    }
  };

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

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={styles.statusText}>Inicializando escáner QR...</Text>
      </View>
    );
  }

  // Si el módulo no está disponible o no hay permisos, mostrar la interfaz alternativa
  if (!moduleAvailable || hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.messageContainer}>
          <Ionicons name="warning-outline" size={50} color="#e74c3c" />
          <Text style={styles.title}>Escáner QR no disponible</Text>
          <Text style={styles.message}>
            El escáner de códigos QR no está disponible en este momento.
            {!moduleAvailable ? ' El módulo no está disponible en este dispositivo.' : ' No se han otorgado permisos de cámara.'}
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
  }

  // Si el módulo está disponible y tenemos permisos, mostrar el escáner
  return (
    <View style={styles.container}>
      {moduleAvailable && hasPermission && BarCodeScanner && (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      
      <View style={styles.overlay}>
        <View style={styles.scannerFrame} />
      </View>
      
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      
      {scanned && (
        <TouchableOpacity style={styles.scanAgainButton} onPress={() => setScanned(false)}>
          <Text style={styles.buttonText}>Escanear de nuevo</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>Apunta la cámara al código QR</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
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
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto',
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
  statusText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: '#333',
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
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#27ae60',
    backgroundColor: 'transparent',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: '#27ae60',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  }
});

export default QRScanner;
