import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from './AuthContext';
import { useFarm } from './FarmContext';
import { useCustomModal } from './CustomModal';

interface Ganado {
  id_ganado: number;
  nombre: string;
  numero_identificacion: string;
  precio_compra?: number;
  id_produccion: number;
}

interface MilkSaleModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MilkSaleModal({ visible, onClose, onSuccess }: MilkSaleModalProps) {
  const { showSuccess } = useCustomModal();
  const { userInfo } = useAuth();
  const { selectedFarm } = useFarm();
  
  const [formData, setFormData] = useState({
    date: new Date(),
    customer: '',
    liters: '',
    pricePerLiter: '',
    totalAmount: '0.00',
    selectedCattle: [] as number[],
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [ganados, setGanados] = useState<Ganado[]>([]);
  const [loadingGanados, setLoadingGanados] = useState(false);
  const [showCattleSelector, setShowCattleSelector] = useState(false);
  const [litersError, setLitersError] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && selectedFarm?.id_finca) {
      loadGanados();
    }
  }, [visible, selectedFarm]);

  const loadGanados = async () => {
    if (!selectedFarm?.id_finca) return;
    
    setLoadingGanados(true);
    try {
      const response = await fetch(`https://ct-backend-gray.vercel.app/api/farms/${selectedFarm.id_finca}/cattle`, {
        headers: {
          'Authorization': `Bearer ${userInfo?.token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const allGanados = result.data || [];
        const ganadosLeche = allGanados.filter((ganado: Ganado) => ganado.id_produccion === 1);
        setGanados(ganadosLeche);
      } else {
        console.error('Error al cargar ganados:', response.status);
        setGanados([]);
      }
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
      calculateTotal(text, formData.pricePerLiter);
    } else {
      setLitersError(true);
    }
  };

  const handlePriceChange = (text: string) => {
    const numericRegex = /^[0-9]*\.?[0-9]*$/;
    if (text === '' || numericRegex.test(text)) {
      setFormData({ ...formData, pricePerLiter: text });
      setPriceError(false);
      calculateTotal(formData.liters, text);
    } else {
      setPriceError(true);
    }
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

  const validateForm = () => {
    return formData.customer.trim() &&
           formData.liters.trim() &&
           formData.pricePerLiter.trim() &&
           formData.selectedCattle.length > 0 &&
           !litersError &&
           !priceError;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor completa todos los campos correctamente');
      return;
    }

    setSaving(true);
    try {
      const ventaData = {
        cantidad: parseFloat(formData.liters),
        precio_unitario: parseFloat(formData.pricePerLiter),
        total: parseFloat(formData.totalAmount),
        comprador: formData.customer,
        ganados: formData.selectedCattle
      };

      const response = await fetch(`https://ct-backend-gray.vercel.app/api/ventas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`
        },
        body: JSON.stringify(ventaData)
      });

      if (!response.ok) {
        throw new Error('Error al guardar venta');
      }

      showSuccess('Éxito', 'Venta de leche registrada correctamente', () => {
        resetForm();
        onSuccess();
        onClose();
      });
    } catch (err) {
      console.error('Error al guardar venta de leche:', err);
      Alert.alert('Error', 'No se pudo guardar la venta');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date(),
      customer: '',
      liters: '',
      pricePerLiter: '',
      totalAmount: '0.00',
      selectedCattle: [],
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
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
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#2c3e50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nueva Venta de Leche</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {!selectedFarm ? (
            <View style={styles.noFarmContainer}>
              <Text style={styles.noFarmText}>
                Selecciona una granja para registrar ventas
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Fecha de venta</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    {formData.date.toLocaleDateString()}
                  </Text>
                  <Ionicons name="calendar" size={24} color="#3498db" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Comprador *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.customer}
                  onChangeText={(text) => setFormData({ ...formData, customer: text })}
                  placeholder="Nombre del comprador"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Cantidad (Litros) *</Text>
                <TextInput
                  style={[styles.input, litersError && styles.inputError]}
                  value={formData.liters}
                  onChangeText={handleLitersChange}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Precio por litro *</Text>
                <TextInput
                  style={[styles.input, priceError && styles.inputError]}
                  value={formData.pricePerLiter}
                  onChangeText={handlePriceChange}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Vacas productoras *</Text>
                <TouchableOpacity
                  style={styles.cattleSelectorButton}
                  onPress={() => setShowCattleSelector(true)}
                >
                  <Text style={styles.cattleSelectorText}>
                    {formData.selectedCattle.length === 0 
                      ? 'Seleccionar vacas productoras...' 
                      : `${formData.selectedCattle.length} vaca(s) seleccionada(s)`
                    }
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalAmount}>
                  {formatCurrency(parseFloat(formData.totalAmount))}
                </Text>
              </View>
            </>
          )}
        </ScrollView>

        {selectedFarm && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, (!validateForm() || saving) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!validateForm() || saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Guardar Venta</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Modal selector de ganado */}
        <Modal
          visible={showCattleSelector}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowCattleSelector(false)}
        >
          <View style={styles.selectorContainer}>
            <View style={styles.selectorHeader}>
              <Text style={styles.selectorTitle}>Seleccionar Vacas Productoras</Text>
              <TouchableOpacity 
                onPress={() => setShowCattleSelector(false)}
                style={styles.selectorCloseButton}
              >
                <Ionicons name="close" size={24} color="#2c3e50" />
              </TouchableOpacity>
            </View>

            {loadingGanados ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={styles.loadingText}>Cargando ganado...</Text>
              </View>
            ) : ganados.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="warning" size={48} color="#666" />
                <Text style={styles.emptyText}>
                  No hay vacas productoras disponibles en esta granja
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.selectionInfo}>
                  <Text style={styles.selectionText}>
                    {formData.selectedCattle.length} de {ganados.length} seleccionada(s)
                  </Text>
                </View>
                
                <FlatList
                  data={ganados}
                  renderItem={renderCattleItem}
                  keyExtractor={(item) => item.id_ganado.toString()}
                  style={styles.cattleList}
                  showsVerticalScrollIndicator={false}
                />
              </>
            )}
            
            <View style={styles.selectorFooter}>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={() => setShowCattleSelector(false)}
              >
                <Text style={styles.confirmButtonText}>Confirmar Selección</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {showDatePicker && (
          <DateTimePicker
            value={formData.date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
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
  content: {
    flex: 1,
    padding: 20,
  },
  noFarmContainer: {
    padding: 20,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  noFarmText: {
    color: '#856404',
    textAlign: 'center',
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#2c3e50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#e74c3c',
    backgroundColor: '#fdf2f2',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  cattleSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  cattleSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Estilos para selector de ganado
  selectorContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  selectorCloseButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 16,
  },
  selectionInfo: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectionText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  cattleList: {
    flex: 1,
    padding: 16,
  },
  cattleItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cattleItemSelected: {
    borderColor: '#3498db',
    backgroundColor: '#f0f8ff',
  },
  cattleItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  cattleInfo: {
    flex: 1,
  },
  cattleName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  cattleNameSelected: {
    color: '#3498db',
  },
  cattleId: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  cattleIdSelected: {
    color: '#3498db',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  selectorFooter: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 