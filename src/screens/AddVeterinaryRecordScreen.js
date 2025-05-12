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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../services/api';
import { colors } from '../styles/colors';

const AddVeterinaryRecordScreen = ({ cattleId }) => {
  const router = useRouter();
  const [cattle, setCattle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Datos del formulario
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Cargar datos del ganado
  useEffect(() => {
    const fetchCattleData = async () => {
      if (!cattleId) {
        setError('ID de ganado no proporcionado');
        setLoading(false);
        return;
      }
      
      try {
        const data = await api.cattle.getById(cattleId);
        setCattle(data);
      } catch (err) {
        console.error('Error al cargar datos del ganado:', err);
        setError('No se pudo cargar la información del ganado');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCattleData();
  }, [cattleId]);
  
  const handleSubmit = async () => {
    if (!diagnosis.trim()) {
      Alert.alert('Error', 'Por favor, ingrese un diagnóstico');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const recordData = {
        date: date.toISOString(),
        diagnosis: diagnosis.trim(),
        treatment: treatment.trim() || null,
        notes: notes.trim() || null,
      };
      
      await api.cattle.addMedicalRecord(cattleId, recordData);
      
      Alert.alert(
        'Éxito',
        'Registro veterinario agregado correctamente',
        [
          { 
            text: 'OK', 
            onPress: () => router.back() 
          }
        ]
      );
    } catch (err) {
      console.error('Error al guardar registro veterinario:', err);
      Alert.alert(
        'Error',
        'No se pudo guardar el registro. Intente de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }
  
  if (error || !cattle) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={50} color={colors.error} />
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
            {cattle.name || cattle.identificationNumber || 'Sin identificación'}
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          {/* Fecha */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Fecha</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>{formatDate(date)}</Text>
              <Ionicons name="calendar" size={22} color={colors.primary} />
            </TouchableOpacity>
            
            {showDatePicker && (
              <DateTimePicker
                value={date}
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
              style={styles.inputLarge}
              placeholder="Ingrese el diagnóstico"
              value={diagnosis}
              onChangeText={setDiagnosis}
              multiline
              numberOfLines={3}
            />
          </View>
          
          {/* Tratamiento */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tratamiento</Text>
            <TextInput
              style={styles.inputLarge}
              placeholder="Ingrese el tratamiento recomendado"
              value={treatment}
              onChangeText={setTreatment}
              multiline
              numberOfLines={3}
            />
          </View>
          
          {/* Notas */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Notas adicionales</Text>
            <TextInput
              style={styles.inputLarge}
              placeholder="Ingrese notas adicionales"
              value={notes}
              onChangeText={setNotes}
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
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={submitting}
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
};

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
    color: colors.textLight,
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
    color: colors.text,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: colors.primary,
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
    color: colors.text,
    marginBottom: 8,
  },
  required: {
    color: colors.error,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  inputLarge: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
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
    borderColor: colors.border,
    borderRadius: 5,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: colors.lightBackground,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: colors.primary,
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
});

export default AddVeterinaryRecordScreen; 