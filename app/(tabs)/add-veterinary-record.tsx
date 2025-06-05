import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../lib/services/api';
import { supabase } from '../../lib/config/supabase'; // Importar supabase para verificar sesión

export default function AddVeterinaryRecordPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cattleId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  
  // Validar que tengamos un cattleId válido
  if (!cattleId) {
    console.error('No se proporcionó un ID de ganado válido en los parámetros de URL');
  } else {
    console.log('ID de ganado recibido:', cattleId);
  }
  
  const [cattle, setCattle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Datos del formulario - ajustados a la estructura de Supabase
  const [diagnostico, setDiagnostico] = useState('');
  const [tratamiento, setTratamiento] = useState('');
  const [nota, setNota] = useState('');
  const [fechaTratamiento, setFechaTratamiento] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Cargar datos del ganado
  useEffect(() => {
    const loadCattleData = async () => {
      if (!cattleId) return;
      try {
        setLoading(true);
        const id = Array.isArray(cattleId) ? cattleId[0] : cattleId;
        const data = await api.cattle.getById(id);
        setCattle(data);
      } catch (error) {
        console.error('Error loading cattle data:', error);
        Alert.alert('Error', 'No se pudo cargar la información del ganado');
      } finally {
        setLoading(false);
      }
    };

    loadCattleData();
  }, [cattleId]);
  
  const handleSubmit = async () => {
    if (!diagnostico.trim()) {
      Alert.alert('Campo requerido', 'Por favor, ingresa un diagnóstico');
      return;
    }
    
    if (!cattleId) {
      Alert.alert('Error', 'No se pudo identificar el ganado');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Verificar sesión de Supabase antes de hacer la petición
      console.log('=== VERIFICACIÓN DE AUTENTICACIÓN ===');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('Sesión de Supabase:', sessionData?.session ? 'Activa' : 'No activa');
      console.log('Token de Supabase:', sessionData?.session?.access_token ? 'Presente' : 'Ausente');
      if (sessionError) {
        console.error('Error al obtener sesión:', sessionError);
      }
      
      // Datos ajustados según lo que espera el backend (ver supabaseGanadoModel.js líneas 620-625)
      const recordData = {
        fecha: fechaTratamiento.toISOString(), // El backend busca 'fecha', no 'fecha_tratamiento'
        diagnostico: diagnostico.trim(),
        tratamiento: tratamiento.trim() || '',
        nota: nota.trim() || '',
        // También incluir campos alternativos que el backend puede usar
        fecha_tratamiento: fechaTratamiento.toISOString(),
        descripcion: diagnostico.trim(), // Campo alternativo para diagnóstico
        notas: nota.trim() || '' // Campo alternativo para notas
      };
      
      const id = Array.isArray(cattleId) ? cattleId[0] : cattleId;
      const cattleIdString = id?.toString() || '';
      
      if (!cattleIdString) {
        throw new Error('El ID del ganado no es válido');
      }
      
      console.log('=== DEBUG INFO ===');
      console.log('Enviando datos médicos para ganado con ID:', cattleIdString);
      console.log('Datos a enviar:', JSON.stringify(recordData, null, 2));
      console.log('URL completa:', `cattle/${cattleIdString}/medical`);
      
      const resultado = await api.cattle.addMedicalRecord(cattleIdString, recordData);
      console.log('Respuesta del servidor:', resultado);
      
      Alert.alert(
        'Éxito',
        'Registro veterinario agregado correctamente',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('=== ERROR COMPLETO ===');
      console.error('Error adding medical record:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      let errorMsg = 'No se pudo agregar el registro veterinario';
      
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      const statusCode = error.response?.status || '';
      if (statusCode) {
        errorMsg += ` (Código: ${statusCode})`;
      }
      
      // Si el error contiene HTML, es probable que sea un error del servidor
      if (typeof error.response?.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
        errorMsg = `Error del servidor (${statusCode}). El endpoint podría no existir o tener un problema.`;
      }
      
      Alert.alert(
        'Error al agregar registro médico', 
        errorMsg,
        [{ text: 'Entendido' }]
      );
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFechaTratamiento(selectedDate);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }
  
  if (error || !cattle) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={50} color="#e74c3c" />
        <Text style={styles.errorText}>{error || 'No se encontró el ganado'}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Agregar Registro Veterinario</Text>
          <Text style={styles.subtitle}>
            {cattle.nombre || cattle.name || cattle.numero_identificacion || cattle.identificationNumber || 'Sin identificación'}
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          {/* Fecha de Tratamiento */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Fecha de Tratamiento</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>{formatDate(fechaTratamiento)}</Text>
              <Ionicons name="calendar" size={22} color="#27ae60" />
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={fechaTratamiento}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </View>
          
          {/* Diagnóstico */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Diagnóstico <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.inputLarge, diagnostico.trim() === '' && { borderColor: '#e74c3c' }]}
              placeholder="Ingrese el diagnóstico del animal"
              value={diagnostico}
              onChangeText={setDiagnostico}
              multiline
              numberOfLines={3}
            />
          </View>
          
          {/* Tratamiento */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tratamiento</Text>
            <TextInput
              style={styles.inputLarge}
              placeholder="Ingrese el tratamiento aplicado o recomendado"
              value={tratamiento}
              onChangeText={setTratamiento}
              multiline
              numberOfLines={3}
            />
          </View>
          
          {/* Nota */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nota</Text>
            <TextInput
              style={styles.inputLarge}
              placeholder="Ingrese observaciones adicionales"
              value={nota}
              onChangeText={setNota}
              multiline
              numberOfLines={3}
            />
          </View>
          
          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={submitting}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                (submitting || diagnostico.trim() === '') && { opacity: 0.7 }
              ]}
              onPress={handleSubmit}
              disabled={submitting || diagnostico.trim() === ''}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#27ae60',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#27ae60',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  formContainer: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  inputLarge: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#2c3e50',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  validationError: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 5,
  },
}); 