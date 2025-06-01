import { BarcodeScanningResult, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [qr, setQr] = useState<string | null>(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Necesitamos tu permiso para mostrar la cámara</Text>
        <Button onPress={requestPermission} title="Dar permiso" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    try {
      const qrData = result.data;
      setQr(qrData);
      
      // Intentar parsear el JSON del QR
      const parsedData = JSON.parse(qrData);
      
      // Verificar si es un QR de nuestra aplicación
      if (parsedData.deepLink && parsedData.data) {
        // Extraer el ID del ganado del deepLink o de los datos
        const cattleId = parsedData.data.id;
        
        if (cattleId) {
          // Navegar a la página de detalles
          router.push({
            pathname: '/(tabs)/cattle-details',
            params: { id: cattleId }
          });
        } else {
          Alert.alert('Error', 'QR inválido: No se encontró el ID del ganado');
        }
      } else {
        Alert.alert('QR no válido', 'Este código QR no corresponde a un ganado registrado');
      }
    } catch (error) {
      console.error('Error al procesar el QR:', error);
      Alert.alert('Error', 'El código QR no tiene el formato correcto');
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={qr ? undefined : handleBarcodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer}></View>
          <View style={styles.middleContainer}>
            <View style={styles.unfocusedContainer}></View>
            <View style={styles.focusedContainer}>
              {/* Marco del escáner */}
              <View style={styles.scannerFrame}></View>
            </View>
            <View style={styles.unfocusedContainer}></View>
          </View>
          <View style={styles.unfocusedContainer}></View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Cambiar cámara</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
      {qr && (
        <View style={styles.scanResultContainer}>
          <Text style={styles.scanResultText}>QR detectado</Text>
          <Button title="Escanear otro" onPress={() => setQr(null)} color="#4CAF50" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  overlay: {
    flex: 1,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  middleContainer: {
    flexDirection: 'row',
    flex: 1.5,
  },
  focusedContainer: {
    flex: 6,
  },
  scannerFrame: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 10,
  },
  scanResultContainer: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
  },
  scanResultText: {
    color: '#4CAF50',
    fontSize: 16,
    marginBottom: 10,
  },
});