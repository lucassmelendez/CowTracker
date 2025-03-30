import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Importación condicional para evitar problemas con el módulo nativo
let BarCodeScanner;
try {
  // Intenta importar desde expo-barcode-scanner
  BarCodeScanner = require('expo-barcode-scanner').BarCodeScanner;
} catch (error) {
  console.log('Error al importar BarCodeScanner:', error);
  // Si falla, establece un componente de respaldo
  BarCodeScanner = ({ children }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>No se pudo cargar el escáner de códigos QR</Text>
      {children}
    </View>
  );
}

const QRScanner = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        
        // Verificar si BarCodeScanner está disponible
        if (!BarCodeScanner || !BarCodeScanner.requestPermissionsAsync) {
          console.log('BarCodeScanner no está disponible');
          setErrorMsg('El escáner de códigos QR no está disponible en este dispositivo');
          setHasPermission(false);
          return;
        }
        
        // Intenta obtener los permisos de cámara
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        console.log('Estado de permiso de cámara:', status);
        
        setHasPermission(status === 'granted');
        if (status !== 'granted') {
          setErrorMsg('No se otorgaron permisos de cámara');
        }
      } catch (error) {
        console.error('Error al solicitar permisos de cámara:', error);
        setErrorMsg(`Error: ${error.message}`);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  const retryPermissions = async () => {
    setLoading(true);
    try {
      if (Platform.OS === 'ios') {
        // En iOS, dirigir al usuario a la configuración
        Alert.alert(
          'Permisos de Cámara',
          'Para usar el escáner QR, debes permitir el acceso a la cámara en la configuración.',
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => setLoading(false) },
            { 
              text: 'Abrir Configuración', 
              onPress: () => {
                Linking.openSettings().catch(() => {
                  Alert.alert('No se pudo abrir la configuración');
                }).finally(() => setLoading(false));
              }
            }
          ]
        );
      } else {
        // En Android, intentar solicitar permisos nuevamente
        if (BarCodeScanner && BarCodeScanner.requestPermissionsAsync) {
          const { status } = await BarCodeScanner.requestPermissionsAsync();
          setHasPermission(status === 'granted');
        } else {
          setErrorMsg('El escáner de códigos QR no está disponible');
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error al reintentar permisos:', error);
      setErrorMsg(`Error al reintentar: ${error.message}`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={styles.statusText}>Inicializando cámara...</Text>
      </View>
    );
  }

  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.statusText}>Solicitando permiso para usar la cámara...</Text>
        <ActivityIndicator size="small" color="#27ae60" style={{marginTop: 10}} />
      </View>
    );
  }
  
  if (hasPermission === false || !BarCodeScanner || typeof BarCodeScanner !== 'function') {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="camera-off" size={50} color="#e74c3c" />
        <Text style={styles.statusText}>No se ha podido acceder a la cámara</Text>
        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
        <TouchableOpacity style={styles.button} onPress={retryPermissions}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, {backgroundColor: '#7f8c8d', marginTop: 10}]} onPress={handleGoBack}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {BarCodeScanner && typeof BarCodeScanner === 'function' ? (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, styles.errorContainer]}>
          <Text style={styles.errorText}>No se pudo inicializar la cámara</Text>
        </View>
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
    backgroundColor: 'black',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#333',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    color: '#e74c3c',
    marginBottom: 15,
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
    padding: 10,
    borderRadius: 50,
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  button: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
  },
});

export default QRScanner;
