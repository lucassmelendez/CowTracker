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
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    console.log('QR detected', result);
    if (result) {
      const qrData = result.data;
      setQr(qrData);
      Alert.alert('QR detectado', qrData);
      if (qrData === 'PRUEBA-QR') {
        router.push('/add-cattle');
      }
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
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Da huelta la camara</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
      {/* Botón de prueba para simular un QR escaneado */}
      <Button
        title="Simular QR"
        onPress={() =>
          handleBarcodeScanned({ data: 'PRUEBA-QR', cornerPoints: [], rawData: '', type: 'QR_CODE' })
        }
      />
      {qr && (
        <View style={{ alignItems: 'center', margin: 20 }}>
          <Text style={{ color: 'white', fontSize: 18 }}>QR: {qr}</Text>
          <Button title="Escanear otro" onPress={() => setQr(null)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#222',
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
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});