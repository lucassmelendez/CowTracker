import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'expo-router';
import SalesDetails from './sales-details';

interface Venta {
  id_venta: number;
  cantidad: number;
  precio_unitario: number;
  total: number;
  comprador: string;
}

export default function SalesListTab() {
  const router = useRouter();
  const { userInfo } = useAuth();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVentaId, setSelectedVentaId] = useState<number | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchVentas = async () => {
    try {
      const response = await fetch(`https://ct-backend-gray.vercel.app/api/ventas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userInfo?.token}`
        }
      });

      if (!response.ok) {
        console.error('Error al obtener ventas');
        return;
      }

      const data = await response.json();
      setVentas(data);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userInfo?.token) {
      fetchVentas();
    }
  }, [userInfo]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVentas();
  };

  const handleVentaPress = (ventaId: number) => {
    setSelectedVentaId(ventaId);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedVentaId(null);
  };

  const handleEditVenta = (ventaId: number) => {
    // TODO: Implementar navegación a pantalla de edición
    Alert.alert(
      'Editar Venta',
      `Funcionalidad de edición para venta #${ventaId} pendiente de implementar.`,
      [{ text: 'OK' }]
    );
  };

  const handleDeleteVenta = async (ventaId: number) => {
    try {
      const response = await fetch(
        `https://ct-backend-gray.vercel.app/api/ventas/${ventaId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${userInfo?.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        Alert.alert('Éxito', 'Venta eliminada correctamente');
        fetchVentas(); // Recargar la lista
      } else {
        throw new Error('Error al eliminar la venta');
      }
    } catch (error) {
      console.error('Error al eliminar venta:', error);
      Alert.alert('Error', 'No se pudo eliminar la venta');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const formatQuantity = (quantity: number) => {
    // Si es un número entero, no mostrar decimales
    if (quantity % 1 === 0) {
      return quantity.toString();
    }
    // Si tiene decimales, mostrar solo los necesarios
    return quantity.toFixed(2).replace(/\.?0+$/, '');
  };

  const renderVentaItem = ({ item }: { item: Venta }) => {
    // Determinar tipo de venta basándose en la cantidad de manera más precisa
    // Las ventas de leche tienden a tener cantidades altas (10+ litros típicamente)
    // Las ventas de ganado tienden a ser pocas unidades (1-10 animales típicamente)
    // También consideramos el precio unitario: leche es más barata por unidad
    const isLeche = item.precio_unitario < 50000 && item.cantidad >= 2;
    const isGanado = !isLeche;


    return (
      <TouchableOpacity 
        style={styles.ventaCard}
        onPress={() => handleVentaPress(item.id_venta)}
        activeOpacity={0.7}
      >
        <View style={styles.ventaHeader}>
          <View style={styles.ventaTypeContainer}>
            <Ionicons 
              name={isLeche ? "water" : "analytics"} 
              size={24} 
              color={isLeche ? "#3498db" : "#e67e22"} 
            />
            <Text style={[styles.ventaType, { color: isLeche ? "#3498db" : "#e67e22" }]}>
              {isLeche ? "Venta de Leche" : "Venta de Ganado"}
            </Text>
          </View>
          <Text style={styles.ventaDate}>
            Venta #{item.id_venta}
          </Text>
        </View>

        <View style={styles.ventaInfo}>
          <Text style={styles.compradorLabel}>Comprador:</Text>
          <Text style={styles.compradorText}>{item.comprador}</Text>
        </View>

        {/* Mostrar cantidad solo para leche con formato "Litros :" */}
        {isLeche && (
          <View style={styles.ventaInfo}>
            <Text style={styles.cantidadLabel}>Litros:</Text>
            <Text style={styles.cantidadText}>{formatQuantity(item.cantidad)} L</Text>
          </View>
        )}

        {/* Para ganado no mostrar cantidad */}
        
        <View style={styles.ventaInfo}>
          <Text style={styles.precioLabel}>
            {isLeche ? "Precio por litro:" : "Monto total:"}
          </Text>
          <Text style={styles.precioText}>
            {formatCurrency(item.precio_unitario)}
          </Text>
        </View>

        <View style={styles.ventaTotal}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalText}>{formatCurrency(item.total)}</Text>
        </View>

        {/* Indicador visual de que es clickeable */}
        <View style={styles.clickIndicator}>
          <Ionicons name="chevron-forward" size={16} color="#bdc3c7" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={styles.loadingText}>Cargando ventas...</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={styles.milkButton}
          onPress={() => router.push('/(tabs)/milk-sale')}
        >
          <Ionicons name="water" size={20} color="#fff" />
          <Text style={styles.buttonText}>Venta de Leche</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cattleButton}
          onPress={() => router.push('/(tabs)/cattle-sale')}
        >
          <Ionicons name="fish" size={20} color="#fff" />
          <Text style={styles.buttonText}>Venta de Ganado</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={ventas}
        renderItem={renderVentaItem}
        keyExtractor={(item) => item.id_venta.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>No hay ventas registradas</Text>
            <Text style={styles.emptySubtext}>
              Presiona los botones de arriba para agregar una nueva venta
            </Text>
          </View>
        }
              />
      </View>

      <SalesDetails
        visible={showDetailsModal}
        ventaId={selectedVentaId}
        onClose={handleCloseModal}
        onEdit={handleEditVenta}
        onDelete={handleDeleteVenta}
      />
    </>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  milkButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    flex: 0.48,
  },
  cattleButton: {
    backgroundColor: '#e67e22',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    flex: 0.48,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  list: {
    flex: 1,
    padding: 16,
  },
  ventaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ventaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ventaTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ventaType: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  ventaDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  ventaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  compradorLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  compradorText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  cantidadLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  cantidadText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  precioLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  precioText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  ventaTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  totalLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  totalText: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: 'bold',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  clickIndicator: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
}); 