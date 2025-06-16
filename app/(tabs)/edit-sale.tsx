import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCustomModal } from '../../components/CustomModal';
import { useAuth } from '../../components/AuthContext';
import { useFarm } from '../../components/FarmContext';
import api from '../../lib/services/api';

interface Ganado {
  id_ganado: number;
  nombre: string;
  numero_identificacion: string;
  id_produccion: number;
}

interface VentaGanadoRelacion {
  id_venta_ganado: number;
  id_venta: number;
  id_ganado: number;
  ganado: Ganado;
}

interface VentaDetalle {
  id_venta: number;
  cantidad: number;
  precio_unitario: number;
  total: number;
  comprador: string;
  fecha_venta: string;
  ganados?: VentaGanadoRelacion[];
}

export default function EditSaleTab() {
  const router = useRouter();
  const { ventaId } = useLocalSearchParams();
  const { showSuccess, ModalComponent } = useCustomModal();
  const { userInfo } = useAuth();
  const { selectedFarm } = useFarm();
  
  const [loading, setLoading] = useState(true);
  const [venta, setVenta] = useState<VentaDetalle | null>(null);
  const [isLeche, setIsLeche] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date(),
    customer: '',
    liters: '',
    pricePerLiter: '',
    totalAmount: '0.00',
    selectedCattle: [] as number[],
    notes: ''
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [ganados, setGanados] = useState<Ganado[]>([]);
  const [loadingGanados, setLoadingGanados] = useState(false);
  const [showCattleSelector, setShowCattleSelector] = useState(false);
  const [litersError, setLitersError] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const [totalAmountError, setTotalAmountError] = useState(false);
  const [validationModalVisible, setValidationModalVisible] = useState(false);

  // Cargar datos de la venta al inicializar
  useEffect(() => {
    if (ventaId && userInfo?.token) {
      fetchVentaDetails();
    }
  }, [ventaId, userInfo]);

  // Cargar ganados cuando se selecciona una granja
  useEffect(() => {
    if (selectedFarm?.id_finca && venta) {
      loadGanados();
    }
  }, [selectedFarm, venta]);

  const fetchVentaDetails = async () => {
    if (!ventaId || !userInfo?.token) return;

    setLoading(true);
    try {
      // Configurar token de autorización
      api.setAuthToken(userInfo.token);

      // Obtener detalles básicos de la venta
      const ventaData = await api.sales.getById(ventaId);

      // Obtener ganados asociados si los hay
      try {
        const ganados = await api.sales.getCattleFromSale(ventaId);

        const ventaCompleta = {
          ...ventaData,
          ganados
        };

        setVenta(ventaCompleta);

        // Determinar tipo de venta
        const esLeche = ventaData.cantidad >= 10 || (ventaData.cantidad > 1 && ventaData.precio_unitario < 50000);
        setIsLeche(esLeche);

        // Inicializar formulario con datos existentes
        if (esLeche) {
          setFormData({
            date: new Date(ventaData.fecha_venta),
            customer: ventaData.comprador,
            liters: ventaData.cantidad.toString(),
            pricePerLiter: ventaData.precio_unitario.toString(),
            totalAmount: ventaData.total.toString(),
            selectedCattle: ganados.map((g: VentaGanadoRelacion) => g.id_ganado),
            notes: ''
          });
        } else {
          setFormData({
            date: new Date(ventaData.fecha_venta),
            customer: ventaData.comprador,
            liters: '',
            pricePerLiter: '',
            totalAmount: ventaData.total.toString(),
            selectedCattle: ganados.map((g: VentaGanadoRelacion) => g.id_ganado),
            notes: ''
          });
        }

      } catch (error) {
        // Si no se pueden obtener los ganados, mostrar solo la venta
        setVenta(ventaData);
        const esLeche = ventaData.cantidad >= 10 || (ventaData.cantidad > 1 && ventaData.precio_unitario < 50000);
        setIsLeche(esLeche);
        
        if (esLeche) {
          setFormData({
            date: new Date(ventaData.fecha_venta),
            customer: ventaData.comprador,
            liters: ventaData.cantidad.toString(),
            pricePerLiter: ventaData.precio_unitario.toString(),
            totalAmount: ventaData.total.toString(),
            selectedCattle: [],
            notes: ''
          });
        } else {
          setFormData({
            date: new Date(ventaData.fecha_venta),
            customer: ventaData.comprador,
            liters: '',
            pricePerLiter: '',
            totalAmount: ventaData.total.toString(),
            selectedCattle: [],
            notes: ''
          });
        }
      }

    } catch (error) {
      console.error('Error al cargar detalles:', error);
      Alert.alert('Error', 'No se pudieron cargar los detalles de la venta');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadGanados = async () => {
    if (!selectedFarm?.id_finca) return;
    
    setLoadingGanados(true);
    try {
      // Configurar token de autorización
      if (userInfo?.token) {
        api.setAuthToken(userInfo.token);
      }

      const result = await api.farms.getCattle(selectedFarm.id_finca.toString());
      const allGanados = result.data || result || [];
      // Filtrar según el tipo de venta
      const ganadosFiltrados = allGanados.filter((ganado: Ganado) => 
        isLeche ? ganado.id_produccion === 1 : ganado.id_produccion === 2
      );
      setGanados(ganadosFiltrados);
    } catch (error) {
      console.error('Error al cargar ganados:', error);
      setGanados([]);
    } finally {
      setLoadingGanados(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || formData.date;
    setShowDatePicker(Platform.OS === 'ios');
    setFormData({ ...formData, date: currentDate });
  };

  const handleLitersChange = (text: string) => {
    const numericRegex = /^(\d+)?([.]?\d{0,2})?$/;
    if (text === '' || numericRegex.test(text)) {
      setFormData({ ...formData, liters: text });
      setLitersError(false);
      if (isLeche) {
        calculateTotal(text, formData.pricePerLiter);
      }
    } else {
      setLitersError(true);
    }
  };

  const handlePriceChange = (text: string) => {
    const numericRegex = /^[0-9]*\.?[0-9]*$/;
    if (text === '' || numericRegex.test(text)) {
      setFormData({ ...formData, pricePerLiter: text });
      setPriceError(false);
      if (isLeche) {
        calculateTotal(formData.liters, text);
      }
    } else {
      setPriceError(true);
    }
  };

  const handleTotalAmountChange = (text: string) => {
    const numericRegex = /^[0-9]*[.,]?[0-9]*$/;
    if (text.trim() !== '') {
      setTotalAmountError(!numericRegex.test(text));
    } else {
      setTotalAmountError(false);
    }
    setFormData({ ...formData, totalAmount: text });
  };

  const calculateTotal = (liters: string, price: string) => {
    const litersNum = parseFloat(liters) || 0;
    const priceNum = parseFloat(price) || 0;
    const total = (litersNum * priceNum).toFixed(2);
    setFormData(prev => ({ ...prev, totalAmount: total }));
  };

  const toggleCattleSelection = (ganadoId: number) => {
    const currentSelection = [...formData.selectedCattle];
    const index = currentSelection.indexOf(ganadoId);
    
    if (index > -1) {
      currentSelection.splice(index, 1);
    } else {
      currentSelection.push(ganadoId);
    }
    
    setFormData({ ...formData, selectedCattle: currentSelection });
  };

  const getSelectedCattleNames = () => {
    return ganados
      .filter(g => formData.selectedCattle.includes(g.id_ganado))
      .map(g => g.nombre)
      .join(', ');
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.customer.trim()) {
      errors.push('customer');
    }
    
    if (isLeche) {
      if (!formData.liters.trim()) {
        errors.push('liters');
      }
      if (!formData.pricePerLiter.trim()) {
        errors.push('price');
      }
      if (litersError || priceError) {
        errors.push('format');
      }
    } else {
      if (!formData.totalAmount.trim()) {
        errors.push('totalAmount');
      }
      if (totalAmountError) {
        errors.push('format');
      }
    }

    if (formData.selectedCattle.length === 0) {
      errors.push('cattle');
    }
    
    return errors.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setValidationModalVisible(true);
      return;
    }

    try {
      // Configurar token de autorización
      if (userInfo?.token) {
        api.setAuthToken(userInfo.token);
      }

      // Preparar datos para actualizar la venta
      const ventaData = isLeche ? {
        cantidad: parseFloat(formData.liters),
        precio_unitario: parseFloat(formData.pricePerLiter),
        total: parseFloat(formData.totalAmount),
        comprador: formData.customer,
        ganados: formData.selectedCattle
      } : {
        cantidad: formData.selectedCattle.length,
        precio_unitario: parseFloat(formData.totalAmount) / formData.selectedCattle.length,
        total: parseFloat(formData.totalAmount),
        comprador: formData.customer,
        ganados: formData.selectedCattle
      };

      // Llamar a la API del backend para actualizar
      const result = await api.sales.update(ventaId, ventaData);
      console.log('Venta actualizada:', result);

      showSuccess('Éxito', 'Venta actualizada correctamente', () => {
        router.back();
      });
    } catch (err) {
      console.error('Excepción al actualizar venta:', err);
      Alert.alert('Error', 'Ocurrió un error al actualizar la venta');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const renderCattleItem = ({ item }: { item: Ganado }) => {
    const isSelected = formData.selectedCattle.includes(item.id_ganado);
    
    return (
      <TouchableOpacity
        style={[styles.cattleItem, isSelected && styles.cattleItemSelected]}
        onPress={() => toggleCattleSelection(item.id_ganado)}
      >
        <View style={styles.cattleItemContent}>
          <View style={styles.cattleInfo}>
            <Text style={[styles.cattleName, isSelected && styles.cattleNameSelected]}>
              {item.nombre}
            </Text>
            <Text style={[styles.cattleId, isSelected && styles.cattleIdSelected]}>
              ID: {item.numero_identificacion}
            </Text>
          </View>
          <View style={styles.checkboxContainer}>
            {isSelected && (
              <Ionicons name="checkmark-circle" size={24} color="#27ae60" />
            )}
            {!isSelected && (
              <View style={styles.uncheckedBox} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={styles.loadingText}>Cargando datos de la venta...</Text>
      </View>
    );
  }

  if (!venta) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#e74c3c" />
        <Text style={styles.errorText}>No se pudo cargar la venta</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Editar {isLeche ? 'Venta de Leche' : 'Venta de Ganado'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.form}>
        {/* Tipo de venta (solo informativo) */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons 
              name={isLeche ? "water" : "analytics"} 
              size={24} 
              color={isLeche ? "#3498db" : "#e67e22"} 
            />
            <Text style={[styles.infoTitle, { color: isLeche ? "#3498db" : "#e67e22" }]}>
              {isLeche ? "Venta de Leche" : "Venta de Ganado"}
            </Text>
          </View>
          <Text style={styles.infoSubtitle}>Venta #{venta.id_venta}</Text>
        </View>

        {/* Fecha */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fecha de venta</Text>
          <TouchableOpacity 
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color="#7f8c8d" />
            <Text style={styles.dateText}>
              {formData.date.toLocaleDateString('es-ES')}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Comprador */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Comprador *</Text>
          <TextInput
            style={styles.input}
            value={formData.customer}
            onChangeText={(text) => setFormData({ ...formData, customer: text })}
            placeholder="Nombre del comprador"
            placeholderTextColor="#bdc3c7"
          />
        </View>

        {/* Campos específicos para venta de leche */}
        {isLeche && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Litros de leche *</Text>
              <TextInput
                style={[styles.input, litersError && styles.inputError]}
                value={formData.liters}
                onChangeText={handleLitersChange}
                placeholder="0.00"
                placeholderTextColor="#bdc3c7"
                keyboardType="numeric"
              />
              {litersError && (
                <Text style={styles.errorText}>Formato inválido</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Precio por litro *</Text>
              <TextInput
                style={[styles.input, priceError && styles.inputError]}
                value={formData.pricePerLiter}
                onChangeText={handlePriceChange}
                placeholder="0.00"
                placeholderTextColor="#bdc3c7"
                keyboardType="numeric"
              />
              {priceError && (
                <Text style={styles.errorText}>Formato inválido</Text>
              )}
            </View>
          </>
        )}

        {/* Campo específico para venta de ganado */}
        {!isLeche && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Monto total *</Text>
            <TextInput
              style={[styles.input, totalAmountError && styles.inputError]}
              value={formData.totalAmount}
              onChangeText={handleTotalAmountChange}
              placeholder="0.00"
              placeholderTextColor="#bdc3c7"
              keyboardType="numeric"
            />
            {totalAmountError && (
              <Text style={styles.errorText}>Formato inválido</Text>
            )}
          </View>
        )}

        {/* Total */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Total</Text>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              ${parseFloat(formData.totalAmount || '0').toLocaleString('es-CL')}
            </Text>
          </View>
        </View>

        {/* Selección de ganado */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {isLeche ? 'Vacas productoras *' : 'Ganado para venta *'}
          </Text>
          <TouchableOpacity
            style={styles.cattleSelector}
            onPress={() => setShowCattleSelector(true)}
          >
            <Text style={styles.cattleSelectorText}>
              {formData.selectedCattle.length > 0 
                ? `${formData.selectedCattle.length} ${isLeche ? 'vacas' : 'animales'} seleccionados`
                : `Seleccionar ${isLeche ? 'vacas' : 'ganado'}`
              }
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#7f8c8d" />
          </TouchableOpacity>
          {getSelectedCattleNames() && (
            <Text style={styles.selectedCattleText}>
              {getSelectedCattleNames()}
            </Text>
          )}
        </View>

        {/* Botones */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButtonFull} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Actualizar Venta</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de selección de ganado */}
      <Modal
        visible={showCattleSelector}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCattleSelector(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Seleccionar {isLeche ? 'Vacas' : 'Ganado'}
            </Text>
            <TouchableOpacity onPress={() => setShowCattleSelector(false)}>
              <Text style={styles.modalDoneText}>Listo</Text>
            </TouchableOpacity>
          </View>
          
          {loadingGanados ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#27ae60" />
              <Text style={styles.loadingText}>Cargando ganado...</Text>
            </View>
          ) : (
            <FlatList
              data={ganados}
              renderItem={renderCattleItem}
              keyExtractor={(item) => item.id_ganado.toString()}
              style={styles.cattleList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="animals" size={64} color="#bdc3c7" />
                  <Text style={styles.emptyText}>
                    No hay {isLeche ? 'vacas productoras' : 'ganado para venta'} disponible
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </Modal>

      {/* Modal de validación */}
      <Modal
        visible={validationModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.validationModalOverlay}>
          <View style={styles.validationModalContent}>
            <Ionicons name="warning" size={48} color="#f39c12" />
            <Text style={styles.validationModalTitle}>Campos requeridos</Text>
            <Text style={styles.validationModalText}>
              Por favor completa todos los campos obligatorios marcados con *
            </Text>
            <TouchableOpacity
              style={styles.validationModalButton}
              onPress={() => setValidationModalVisible(false)}
            >
              <Text style={styles.validationModalButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ModalComponent />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  cancelButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  placeholder: {
    width: 40,
  },
  form: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 36,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  dateInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 12,
  },
  totalContainer: {
    backgroundColor: '#e8f5e8',
    borderWidth: 1,
    borderColor: '#27ae60',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#27ae60',
  },
  cattleSelector: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cattleSelectorText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  selectedCattleText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 8,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 12,
  },
  cancelButtonFull: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#e74c3c',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  modalDoneText: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: '600',
  },
  cattleList: {
    flex: 1,
    padding: 20,
  },
  cattleItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cattleItemSelected: {
    borderWidth: 2,
    borderColor: '#27ae60',
  },
  cattleItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  cattleInfo: {
    flex: 1,
  },
  cattleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  cattleNameSelected: {
    color: '#27ae60',
  },
  cattleId: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  cattleIdSelected: {
    color: '#27ae60',
  },
  checkboxContainer: {
    marginLeft: 12,
  },
  uncheckedBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    borderRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 16,
  },
  validationModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  validationModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 40,
  },
  validationModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  validationModalText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  validationModalButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  validationModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
