import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../components/AuthContext';

export default function EditSaleScreen() {
  const { userInfo } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [venta, setVenta] = useState(null);
  const [loading, setLoading] = useState(true);

  const [cantidad, setCantidad] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [comprador, setComprador] = useState('');

  const [cantidadError, setCantidadError] = useState(false);
  const [precioUnitarioError, setPrecioUnitarioError] = useState(false);
  const [compradorError, setCompradorError] = useState(false);

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
      Alert.alert('Ocurrió un error inesperado', mensajeError);
    } finally {
      setLoading(false);
    }
  };

  const isValidNumber = (value: string) => {
    return /^\d*$/.test(value);
  };

  const isValidText = (value: string) => {
    return !/\d/.test(value);
  };

  const validateCantidad = (value: string) => {
    setCantidadError(!isValidNumber(value));
    setCantidad(value);
  };

  const validatePrecioUnitario = (value: string) => {
    setPrecioUnitarioError(!isValidNumber(value));
    setPrecioUnitario(value);
  };

  const validateComprador = (value: string) => {
    setCompradorError(!isValidText(value));
    setComprador(value);
  };

  const isFormValid = () => {
    // Check if there are any validation errors
    if (cantidadError || precioUnitarioError || compradorError) {
      return false;
    }
    // Check if all fields have values
    if (!cantidad || !precioUnitario || !comprador) {
      return false;
    }
    return true;
  };

  const handleGuardar = async () => {
    if (!cantidad || !precioUnitario || !comprador) {
      Alert.alert('Validación', 'Completa todos los campos antes de guardar!');
      return;
    }

    if (!Number.isInteger(Number(cantidad)) || Number(cantidad) <= 0) {
      Alert.alert('Error de validación', 'La cantidad debe ser un número entero positivo');
      return;
    }

    if (!Number.isInteger(Number(precioUnitario)) || Number(precioUnitario) <= 0) {
      Alert.alert('Error de validación', 'El precio unitario debe ser un número entero positivo');
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
          cantidad: parseInt(cantidad),
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
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Cantidad (número entero)</Text>
        <TextInput
          style={[styles.input, cantidadError && { borderColor: '#ff0000', borderWidth: 2 }]}
          value={cantidad}
          onChangeText={validateCantidad}
          keyboardType="numeric"
          placeholder="Ej: 10"
          maxLength={10}
        />
        {cantidadError ? (
          <Text style={styles.errorText}>Solo se permiten números enteros</Text>
        ) : (
          <Text style={styles.inputHint}>Campo tipo: números positivos</Text>
        )}
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Precio Unitario (número entero)</Text>
        <TextInput
          style={[styles.input, precioUnitarioError && { borderColor: '#ff0000', borderWidth: 2 }]}
          value={precioUnitario}
          onChangeText={validatePrecioUnitario}
          keyboardType="numeric"
          placeholder="Ej: 20000"
          maxLength={10}
        />
        {precioUnitarioError ? (
          <Text style={styles.errorText}>Solo se permiten números enteros</Text>
        ) : (
          <Text style={styles.inputHint}>Campo tipo: números positivos</Text>
        )}
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Comprador</Text>
        <TextInput
          style={[styles.input, compradorError && { borderColor: '#ff0000', borderWidth: 2 }]}
          value={comprador}
          onChangeText={validateComprador}
          placeholder="Ej: Super pollo"
          maxLength={255}
        />
        {compradorError ? (
          <Text style={styles.errorText}>El nombre no debe contener números</Text>
        ) : (
          <Text style={styles.inputHint}>Campo tipo: Texto</Text>
        )}
      </View>      <TouchableOpacity 
        style={[
          styles.button,
          isFormValid() ? styles.buttonEnabled : styles.buttonDisabled
        ]} 
        onPress={handleGuardar}
        disabled={!isFormValid()}
      >
        <Text style={styles.buttonText}>
          {!isFormValid() ? 'Guardar Cambios' : 'Guardar Cambios'}
        </Text>
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#666',
  },
  inputHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    marginLeft: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginTop: 2,
    marginLeft: 4,
  },  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonEnabled: {
    backgroundColor: '#27ae60',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
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
  },
});
