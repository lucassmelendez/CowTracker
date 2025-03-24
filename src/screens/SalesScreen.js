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
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';

const SalesScreen = () => {
  const router = useRouter();
  // Datos de ejemplo para ventas
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

  // Estado para filtros
  const [filterMonth, setFilterMonth] = useState('Todos');
  const months = ['Todos', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Estado para modales
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);

  // Estado para el formulario de nueva venta
  const [formDate, setFormDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customer, setCustomer] = useState('');
  const [selectedCattle, setSelectedCattle] = useState([]);
  
  // Simulación de ganado disponible para vender
  const availableCattle = [
    { id: 'c6', name: 'Vaca Holstein', identifier: 'BOV-2023-154', price: 1700 },
    { id: 'c7', name: 'Toro Angus', identifier: 'BOV-2023-167', price: 2100 },
    { id: 'c8', name: 'Novillo Brahman', identifier: 'BOV-2023-189', price: 1300 },
    { id: 'c9', name: 'Vaca Jersey', identifier: 'BOV-2023-201', price: 1600 },
  ];

  const [selectCattleModalVisible, setSelectCattleModalVisible] = useState(false);

  const openDetailsModal = (sale) => {
    setSelectedSale(sale);
    setDetailsModalVisible(true);
  };

  const openAddModal = () => {
    setFormDate(new Date());
    setCustomer('');
    setSelectedCattle([]);
    setAddModalVisible(true);
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || formDate;
    setShowDatePicker(Platform.OS === 'ios');
    setFormDate(currentDate);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const toggleCattleSelection = (cattle) => {
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

  // Filtrar ventas por mes si se ha seleccionado uno
  const filteredSales = filterMonth === 'Todos' 
    ? sales 
    : sales.filter(sale => {
        const date = new Date(sale.date);
        return date.getMonth() === months.indexOf(filterMonth) - 1;
      });

  const renderSaleItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
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

  const renderCattleItem = ({ item }) => (
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

                <Text style={styles.sectionTitle}>Animales vendidos</Text>
                
                {selectedSale.items.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <View>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemId}>{item.identifier}</Text>
                    </View>
                    <Text style={styles.itemPrice}>${item.price}</Text>
                  </View>
                ))}
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

            <Text style={styles.label}>Fecha</Text>
            <TouchableOpacity 
              style={styles.datePickerButton} 
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(formDate.toISOString())}</Text>
              <Ionicons name="calendar-outline" size={20} color="#555" />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={formDate}
                mode="date"
                display="default"
                onChange={onChangeDate}
              />
            )}

            <Text style={styles.label}>Cliente</Text>
            <TextInput 
              style={styles.input}
              value={customer}
              onChangeText={setCustomer}
              placeholder="Nombre del cliente"
            />

            <Text style={styles.label}>Animales seleccionados ({selectedCattle.length})</Text>
            <TouchableOpacity 
              style={styles.selectCattleButton}
              onPress={() => setSelectCattleModalVisible(true)}
            >
              <Text style={styles.selectCattleText}>Seleccionar animales</Text>
              <Ionicons name="chevron-forward" size={16} color="#27ae60" />
            </TouchableOpacity>

            {selectedCattle.length > 0 && (
              <View style={styles.selectedCattleList}>
                {selectedCattle.map(cattle => (
                  <View key={cattle.id} style={styles.selectedCattleItem}>
                    <Text style={styles.selectedCattleName}>{cattle.name}</Text>
                    <Text style={styles.selectedCattlePrice}>${cattle.price}</Text>
                  </View>
                ))}
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalAmount}>
                    ${selectedCattle.reduce((sum, cattle) => sum + cattle.price, 0)}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.modalButtons}>
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
                <Text style={styles.saveButtonText}>Registrar venta</Text>
              </TouchableOpacity>
            </View>
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
              contentContainerStyle={styles.cattleListContainer}
            />

            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={() => setSelectCattleModalVisible(false)}
            >
              <Text style={styles.confirmButtonText}>Confirmar selección</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#27ae60',
    padding: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginTop: 5,
  },
  filterContainer: {
    padding: 15,
    backgroundColor: '#fff',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 10,
  },
  monthsContainer: {
    paddingBottom: 10,
  },
  monthButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  selectedMonthButton: {
    backgroundColor: '#27ae60',
  },
  monthText: {
    color: '#555',
    fontWeight: '500',
  },
  selectedMonthText: {
    color: '#fff',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#555',
  },
  amountContainer: {
    backgroundColor: '#f0f8f2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 5,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  cardBody: {
    marginBottom: 12,
  },
  customerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cattleCount: {
    fontSize: 14,
    color: '#777',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  viewDetails: {
    fontSize: 14,
    color: '#27ae60',
    marginRight: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#27ae60',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#777',
    marginTop: 10,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#555',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  itemId: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  selectCattleButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  selectCattleText: {
    fontSize: 16,
    color: '#27ae60',
  },
  selectedCattleList: {
    marginTop: 15,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 10,
  },
  selectedCattleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedCattleName: {
    fontSize: 14,
    color: '#333',
  },
  selectedCattlePrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#27ae60',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cattleListContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  cattleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedCattle: {
    backgroundColor: '#f0f8f2',
  },
  cattleInfo: {
    flex: 1,
  },
  cattleName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  cattleId: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  cattlePriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cattlePrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#27ae60',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#27ae60',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SalesScreen; 