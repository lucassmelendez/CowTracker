import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../components/AuthContext';

export default function EditSaleScreen() {
  const { userInfo } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams(); // id_venta
  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(true);

  const [cantidad, setCantidad] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [comprador, setComprador] = useState('');

  useEffect(() => {
    fetchVenta();
  }, []);

  const fetchVenta = async () => {
    try {
      const response = await fetch(`https://ct-backend-gray.vercel.app/api/ventas/${id}`, {
        headers: {
          'Authorization': `Bearer ${userInfo?.token}`,
        }
      });

      if (!response.ok) throw new Error('Error al cargar la venta');

      const data = await response.json();
      setVenta(data);
      setCantidad(String(data.cantidad));
      setPrecioUnitario(String(data.precio_unitario));
      setComprador(data.comprador);
    } catch (error) {
      const mensajeError = error instanceof Error ? error.message : JSON.stringify(error);
      Alert.alert('Ocurrior un error inesperado', mensajeError);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    if (!cantidad || !precioUnitario || !comprador) {
        Alert.alert('Validación', 'Completa todos los campos antes de guardar!');
        return;
    }
    
    try {
      const response = await fetch(`https://ct-backend-gray.vercel.app/api/ventas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`,
        },
        body: JSON.stringify({
          cantidad: parseFloat(cantidad),
          precio_unitario: parseInt(precioUnitario),
          comprador,
        }),
      });

      if (!response.ok) throw new Error('Error al guardar los cambios');

        Alert.alert('Éxito', 'Venta actualizada correctamente');
        router.back();
    } catch (error) {
        const mensajeError = error instanceof Error ? error.message : JSON.stringify(error);
        Alert.alert('Error al actualizar', mensajeError);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Venta #{id}</Text>

      <TextInput
        style={styles.input}
        value={cantidad}
        onChangeText={setCantidad}
        keyboardType="numeric"
        placeholder="Cantidad"
      />
      <TextInput
        style={styles.input}
        value={precioUnitario}
        onChangeText={setPrecioUnitario}
        keyboardType="numeric"
        placeholder="Precio unitario"
      />
      <TextInput
        style={styles.input}
        value={comprador}
        onChangeText={setComprador}
        placeholder="Comprador"
      />

      <TouchableOpacity style={styles.button} onPress={handleGuardar}>
        <Text style={styles.buttonText}>Guardar Cambios</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
