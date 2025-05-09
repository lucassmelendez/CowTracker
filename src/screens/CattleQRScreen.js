import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import QRCode from 'qrcode';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const CattleQRScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cattleId = params?.id;

  const [qrCodeUri, setQrCodeUri] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cattleId) {
      Alert.alert('Error', 'ID de ganado no disponible');
      router.back();
      return;
    }

    const generateQRCode = async () => {
      try {
        const qrData = `https://example.com/cattle/${cattleId}`;
        const qrUri = await QRCode.toDataURL(qrData);
        setQrCodeUri(qrUri);
      } catch (error) {
        console.error('Error al generar el código QR:', error);
        Alert.alert('Error', 'No se pudo generar el código QR');
      } finally {
        setLoading(false);
      }
    };

    generateQRCode();
  }, [cattleId]);

  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Generando código QR...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Código QR del Ganado</Text>
      {qrCodeUri ? (
        <Image source={{ uri: qrCodeUri }} style={styles.qrCode} />
      ) : (
        <Text style={styles.errorText}>No se pudo generar el código QR</Text>
      )}
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  qrCode: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default CattleQRScreen;