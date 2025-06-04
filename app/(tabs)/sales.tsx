import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function SalesPage() {
  const router = useRouter();
  const [sales, setSales] = useState([
    { 
      id: '1', 
      date: '2023-05-12', 
      customer: 'Carnicería Los Alamos', 
      cattleCount: 3,
      totalAmount: 4500,
      items: [
        { id: 'c1', name: 'Toro Holstein', identifier: 'BOV-2023-045', price: 1800 },
        { id: 'c2', name: 'Vaca Jersey', identifier: 'BOV-2023-032', price: 1500 },
        { id: 'c3', name: 'Novillo Angus', identifier: 'BOV-2023-078', price: 1200 }
      ]
    },
    { 
      id: '2', 
      date: '2023-06-23', 
      customer: 'Exportadora San Miguel', 
      cattleCount: 2,
      totalAmount: 3600,
      items: [
        { id: 'c4', name: 'Toro Brahman', identifier: 'BOV-2023-089', price: 2000 },
        { id: 'c5', name: 'Vaca Holstein', identifier: 'BOV-2023-112', price: 1600 }
      ]
    },
  ]);

  const [filterMonth, setFilterMonth] = useState('Todos');
  const months = ['Todos', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [formDate, setFormDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customer, setCustomer] = useState('');
  const [selectedCattle, setSelectedCattle] = useState<any[]>([]);
  
  const availableCattle = [
    { id: 'c6', name: 'Vaca Holstein', identifier: 'BOV-2023-154', price: 1700 },
    { id: 'c7', name: 'Toro Angus', identifier: 'BOV-2023-167', price: 2100 },
    { id: 'c8', name: 'Novillo Brahman', identifier: 'BOV-2023-189', price: 1300 },
    { id: 'c9', name: 'Vaca Jersey', identifier: 'BOV-2023-201', price: 1600 },
  ];

  const [selectCattleModalVisible, setSelectCattleModalVisible] = useState(false);

  const openDetailsModal = (sale: any) => {
    setSelectedSale(sale);
    setDetailsModalVisible(true);
  };

  const openAddModal = () => {
    setFormDate(new Date());
    setCustomer('');
    setSelectedCattle([]);
    setAddModalVisible(true);
  };

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || formDate;
    setShowDatePicker(Platform.OS === 'ios');
    setFormDate(currentDate);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const toggleCattleSelection = (cattle: any) => {
    if (selectedCattle.some(item => item.id === cattle.id)) {
      setSelectedCattle(selectedCattle.filter(item => item.id !== cattle.id));
    } else {
      setSelectedCattle([...selectedCattle, cattle]);
    }
  };

  const handleSave = () => {
    if (!customer || selectedCattle.length === 0) {
      Alert.alert('Error', 'Por favor complete todos los campos y seleccione al menos un animal');
      return;
    }

    const totalAmount = selectedCattle.reduce((sum, cattle) => sum + cattle.price, 0);

    const newSale = {
      id: Date.now().toString(),
      date: formDate.toISOString().split('T')[0],
      customer,
      cattleCount: selectedCattle.length,
      totalAmount,
      items: selectedCattle
    };

    setSales([newSale, ...sales]);
    setAddModalVisible(false);
    Alert.alert('Éxito', 'Venta registrada correctamente');
  };

  const filteredSales = filterMonth === 'Todos' 
    ? sales 
    : sales.filter(sale => {
        const date = new Date(sale.date);
        return date.getMonth() === months.indexOf(filterMonth) - 1;
      });

  const renderSaleItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.saleCard}
      onPress={() => openDetailsModal(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.amountText}>${item.totalAmount}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.customerText}>{item.customer}</Text>
        <Text style={styles.cattleCount}>{item.cattleCount} {item.cattleCount === 1 ? 'animal' : 'animales'}</Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.viewDetails}>Ver detalles</Text>
        <Ionicons name="chevron-forward" size={16} color="#27ae60" />
      </View>
    </TouchableOpacity>
  );

  const renderCattleItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[
        styles.cattleItem, 
        selectedCattle.some(c => c.id === item.id) && styles.selectedCattle
      ]}
      onPress={() => toggleCattleSelection(item)}
    >
      <View style={styles.cattleInfo}>
        <Text style={styles.cattleName}>{item.name}</Text>
        <Text style={styles.cattleId}>{item.identifier}</Text>
      </View>
      <View style={styles.cattlePriceContainer}>
        <Text style={styles.cattlePrice}>${item.price}</Text>
        {selectedCattle.some(c => c.id === item.id) && (
          <Ionicons name="checkmark-circle" size={20} color="#27ae60" />
        )}
      </View>
    </TouchableOpacity>
  );

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ventas</Text>
        <Text style={styles.subtitle}>Registro de todas tus transacciones</Text>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrar por mes:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthsContainer}
        >
          {months.map((month) => (
            <TouchableOpacity
              key={month}
              style={[
                styles.monthButton,
                filterMonth === month && styles.selectedMonthButton
              ]}
              onPress={() => setFilterMonth(month)}
            >
              <Text 
                style={[
                  styles.monthText,
                  filterMonth === month && styles.selectedMonthText
                ]}
              >
                {month}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredSales}
        renderItem={renderSaleItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={60} color="#ddd" />
            <Text style={styles.emptyText}>No hay ventas registradas</Text>
            <Text style={styles.emptySubtext}>Agrega una nueva venta para comenzar</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modal de detalles de venta */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailsModalVisible}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalles de la venta</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedSale && (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fecha:</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedSale.date)}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cliente:</Text>
                  <Text style={styles.detailValue}>{selectedSale.customer}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total:</Text>
                  <Text style={styles.detailValue}>${selectedSale.totalAmount}</Text>
                </View>
                
                <Text style={styles.itemsTitle}>Animales vendidos:</Text>
                
                <ScrollView>
                  {selectedSale.items.map((item: any, index: number) => (
                    <View key={item.id} style={styles.itemContainer}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemId}>{item.identifier}</Text>
                      </View>
                      <Text style={styles.itemPrice}>${item.price}</Text>
                    </View>
                  ))}
                </ScrollView>
                
                <View style={styles.totalContainer}>
                  <Text style={styles.totalText}>Total: ${selectedSale.totalAmount}</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal para agregar nueva venta */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva venta</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Fecha</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    {formDate.toLocaleDateString()}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                </TouchableOpacity>
                
                {showDatePicker && (
                  <DateTimePicker
                    value={formDate}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                  />
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Cliente</Text>
                <TextInput
                  style={styles.input}
                  value={customer}
                  onChangeText={setCustomer}
                  placeholder="Nombre del comprador"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Animales</Text>
                <TouchableOpacity 
                  style={styles.selectCattleButton}
                  onPress={() => setSelectCattleModalVisible(true)}
                >
                  <Text style={styles.selectCattleText}>Seleccionar animales</Text>
                </TouchableOpacity>
                
                {selectedCattle.length > 0 && (
                  <View style={styles.selectedCattleContainer}>
                    <Text style={styles.selectedCattleCount}>
                      {selectedCattle.length} {selectedCattle.length === 1 ? 'animal' : 'animales'} seleccionado(s)
                    </Text>
                    {selectedCattle.map(cattle => (
                      <View key={cattle.id} style={styles.cattleItem}>
                        <View style={styles.cattleInfo}>
                          <Text style={styles.cattleName}>{cattle.name}</Text>
                          <Text style={styles.cattleId}>{cattle.identifier}</Text>
                        </View>
                        <Text style={styles.cattlePrice}>${cattle.price}</Text>
                      </View>
                    ))}
                    <View style={styles.totalContainer}>
                      <Text style={styles.totalText}>
                        Total: ${selectedCattle.reduce((sum, item) => sum + item.price, 0)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setAddModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para seleccionar ganado */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={selectCattleModalVisible}
        onRequestClose={() => setSelectCattleModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar animales</Text>
              <TouchableOpacity onPress={() => setSelectCattleModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={availableCattle}
              renderItem={renderCattleItem}
              keyExtractor={item => item.id}
            />
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => setSelectCattleModalVisible(false)}
              >
                <Text style={styles.saveButtonText}>Confirmar selección</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#777777',
  },
  listContainer: {
    padding: 15,
  },
  saleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  amountContainer: {
    backgroundColor: '#27ae60',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  amountText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 15,
  },
  customerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  cattleCount: {
    fontSize: 14,
    color: '#777777',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  viewDetails: {
    fontSize: 14,
    color: '#27ae60',
    marginRight: 5,
  },
  filterContainer: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
  },
  monthsContainer: {
    paddingRight: 20,
  },
  monthButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#f5f5f5',
  },
  selectedMonthButton: {
    backgroundColor: '#27ae60',
  },
  monthText: {
    color: '#333333',
  },
  selectedMonthText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#777777',
    marginTop: 5,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  detailRow: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailLabel: {
    width: '30%',
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  detailValue: {
    width: '70%',
    fontSize: 16,
    color: '#333333',
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    margin: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#333333',
  },
  itemId: {
    fontSize: 14,
    color: '#777777',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  totalContainer: {
    padding: 15,
    alignItems: 'flex-end',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  formGroup: {
    margin: 15,
  },
  formLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectCattleButton: {
    backgroundColor: '#3498db',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  selectCattleText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  selectedCattleContainer: {
    marginTop: 10,
  },
  selectedCattleCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27ae60',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 15,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#777777',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  cattleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectedCattle: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },
  cattleInfo: {
    flex: 1,
  },
  cattleName: {
    fontSize: 16,
    color: '#333333',
  },
  cattleId: {
    fontSize: 14,
    color: '#777777',
  },
  cattlePriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cattlePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginRight: 10,
  },
}); 