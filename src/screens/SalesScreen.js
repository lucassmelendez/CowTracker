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
import { getShadowStyle } from '../utils/styles';
import { salesStyles } from '../styles/salesStyles';

const SalesScreen = () => {
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
  const [selectedSale, setSelectedSale] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [formDate, setFormDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customer, setCustomer] = useState('');
  const [selectedCattle, setSelectedCattle] = useState([]);
  
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

  const filteredSales = filterMonth === 'Todos' 
    ? sales 
    : sales.filter(sale => {
        const date = new Date(sale.date);
        return date.getMonth() === months.indexOf(filterMonth) - 1;
      });

  const renderSaleItem = ({ item }) => (
    <TouchableOpacity 
      style={salesStyles.saleCard}
      onPress={() => openDetailsModal(item)}
    >
      <View style={salesStyles.cardHeader}>
        <Text style={salesStyles.dateText}>{formatDate(item.date)}</Text>
        <View style={salesStyles.amountContainer}>
          <Text style={salesStyles.amountText}>${item.totalAmount}</Text>
        </View>
      </View>

      <View style={salesStyles.cardBody}>
        <Text style={salesStyles.customerText}>{item.customer}</Text>
        <Text style={salesStyles.cattleCount}>{item.cattleCount} {item.cattleCount === 1 ? 'animal' : 'animales'}</Text>
      </View>

      <View style={salesStyles.cardFooter}>
        <Text style={salesStyles.viewDetails}>Ver detalles</Text>
        <Ionicons name="chevron-forward" size={16} color="#27ae60" />
      </View>
    </TouchableOpacity>
  );

  const renderCattleItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        salesStyles.cattleItem, 
        selectedCattle.some(c => c.id === item.id) && salesStyles.selectedCattle
      ]}
      onPress={() => toggleCattleSelection(item)}
    >
      <View style={salesStyles.cattleInfo}>
        <Text style={salesStyles.cattleName}>{item.name}</Text>
        <Text style={salesStyles.cattleId}>{item.identifier}</Text>
      </View>
      <View style={salesStyles.cattlePriceContainer}>
        <Text style={salesStyles.cattlePrice}>${item.price}</Text>
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
    <View style={salesStyles.container}>
      <View style={salesStyles.header}>
        <Text style={salesStyles.title}>Ventas</Text>
        <Text style={salesStyles.subtitle}>Registro de todas tus transacciones</Text>
      </View>

      <View style={salesStyles.filterContainer}>
        <Text style={salesStyles.filterLabel}>Filtrar por mes:</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={salesStyles.monthsContainer}
        >
          {months.map((month) => (
            <TouchableOpacity
              key={month}
              style={[
                salesStyles.monthButton,
                filterMonth === month && salesStyles.selectedMonthButton
              ]}
              onPress={() => setFilterMonth(month)}
            >
              <Text 
                style={[
                  salesStyles.monthText,
                  filterMonth === month && salesStyles.selectedMonthText
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
        contentContainerStyle={salesStyles.listContainer}
        ListEmptyComponent={
          <View style={salesStyles.emptyContainer}>
            <Ionicons name="cart-outline" size={60} color="#ddd" />
            <Text style={salesStyles.emptyText}>No hay ventas registradas</Text>
            <Text style={salesStyles.emptySubtext}>Agrega una nueva venta para comenzar</Text>
          </View>
        }
      />

      <TouchableOpacity style={salesStyles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modal de detalles de venta */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailsModalVisible}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={salesStyles.modalContainer}>
          <View style={salesStyles.modalContent}>
            <View style={salesStyles.modalHeader}>
              <Text style={salesStyles.modalTitle}>Detalles de la venta</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedSale && (
              <>
                <View style={salesStyles.detailRow}>
                  <Text style={salesStyles.detailLabel}>Fecha:</Text>
                  <Text style={salesStyles.detailValue}>{formatDate(selectedSale.date)}</Text>
                </View>
                
                <View style={salesStyles.detailRow}>
                  <Text style={salesStyles.detailLabel}>Cliente:</Text>
                  <Text style={salesStyles.detailValue}>{selectedSale.customer}</Text>
                </View>
                
                <View style={salesStyles.detailRow}>
                  <Text style={salesStyles.detailLabel}>Total:</Text>
                  <Text style={salesStyles.detailValue}>${selectedSale.totalAmount}</Text>
                </View>
                
                <Text style={salesStyles.itemsTitle}>Animales vendidos:</Text>
                
                <ScrollView style={{ maxHeight: 200 }}>
                  {selectedSale.items.map((item, index) => (
                    <View key={item.id} style={salesStyles.itemContainer}>
                      <View style={salesStyles.itemInfo}>
                        <Text style={salesStyles.itemName}>{item.name}</Text>
                        <Text style={salesStyles.itemId}>{item.identifier}</Text>
                      </View>
                      <Text style={salesStyles.itemPrice}>${item.price}</Text>
                    </View>
                  ))}
                </ScrollView>
                
                <View style={salesStyles.totalContainer}>
                  <Text style={salesStyles.totalText}>Total: ${selectedSale.totalAmount}</Text>
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
        <View style={salesStyles.modalContainer}>
          <View style={salesStyles.modalContent}>
            <View style={salesStyles.modalHeader}>
              <Text style={salesStyles.modalTitle}>Nueva venta</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView>
              <View style={salesStyles.formGroup}>
                <Text style={salesStyles.formLabel}>Fecha</Text>
                <TouchableOpacity 
                  style={salesStyles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={salesStyles.dateText}>
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
              
              <View style={salesStyles.formGroup}>
                <Text style={salesStyles.formLabel}>Cliente</Text>
                <TextInput
                  style={salesStyles.input}
                  value={customer}
                  onChangeText={setCustomer}
                  placeholder="Nombre del comprador"
                />
              </View>
              
              <View style={salesStyles.formGroup}>
                <Text style={salesStyles.formLabel}>Animales</Text>
                <TouchableOpacity 
                  style={salesStyles.selectCattleButton}
                  onPress={() => setSelectCattleModalVisible(true)}
                >
                  <Text style={salesStyles.selectCattleText}>Seleccionar animales</Text>
                </TouchableOpacity>
                
                {selectedCattle.length > 0 && (
                  <View style={salesStyles.selectedCattleContainer}>
                    <Text style={salesStyles.selectedCattleCount}>
                      {selectedCattle.length} {selectedCattle.length === 1 ? 'animal' : 'animales'} seleccionado(s)
                    </Text>
                    {selectedCattle.map(cattle => (
                      <View key={cattle.id} style={salesStyles.cattleItem}>
                        <View style={salesStyles.cattleInfo}>
                          <Text style={salesStyles.cattleName}>{cattle.name}</Text>
                          <Text style={salesStyles.cattleId}>{cattle.identifier}</Text>
                        </View>
                        <Text style={salesStyles.cattlePrice}>${cattle.price}</Text>
                      </View>
                    ))}
                    <View style={salesStyles.totalContainer}>
                      <Text style={salesStyles.totalText}>
                        Total: ${selectedCattle.reduce((sum, item) => sum + item.price, 0)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              
              <View style={salesStyles.buttonContainer}>
                <TouchableOpacity 
                  style={salesStyles.cancelButton}
                  onPress={() => setAddModalVisible(false)}
                >
                  <Text style={salesStyles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={salesStyles.saveButton}
                  onPress={handleSave}
                >
                  <Text style={salesStyles.saveButtonText}>Guardar</Text>
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
        <View style={salesStyles.modalContainer}>
          <View style={salesStyles.modalContent}>
            <View style={salesStyles.modalHeader}>
              <Text style={salesStyles.modalTitle}>Seleccionar ganado</Text>
              <TouchableOpacity onPress={() => setSelectCattleModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={availableCattle}
              renderItem={renderCattleItem}
              keyExtractor={item => item.id}
              style={{ maxHeight: 300 }}
            />
            
            <View style={salesStyles.buttonContainer}>
              <TouchableOpacity 
                style={salesStyles.saveButton}
                onPress={() => setSelectCattleModalVisible(false)}
              >
                <Text style={salesStyles.saveButtonText}>Confirmar selección</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SalesScreen; 