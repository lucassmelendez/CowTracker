import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  FlatList,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../components/AuthContext';
import { useFarm } from '../../components/FarmContext';

interface Venta {
  id_venta: number;
  cantidad: number;
  precio_unitario: number;
  total: number;
  comprador: string;
  created_at: string;
  ganados?: any[];
}

export default function ProductionScreen() {
  const router = useRouter();
  const { userInfo } = useAuth();
  const { selectedFarm } = useFarm();
  
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVentas();
  }, []);

  const loadVentas = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://ct-backend-gray.vercel.app/api/ventas', {
        headers: {
          'Authorization': `Bearer ${userInfo?.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Ordenar por fecha más reciente y tomar solo las 10 más recientes
        const sortedVentas = data.sort((a: Venta, b: Venta) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 10);
        setVentas(sortedVentas);
      } else {
        console.error('Error al cargar ventas:', response.status);
        setVentas([]);
      }
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      setVentas([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVentas();
    setRefreshing(false);
  };

  const navigateToMilkSale = () => {
    router.push('/(tabs)/milk-sale');
  };

  const navigateToCattleSale = () => {
    router.push('/(tabs)/cattle-sale');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const renderVentaItem = ({ item }: { item: Venta }) => {
    const isLeche = item.cantidad > 50; // Asumimos que más de 50 unidades es leche (litros)
    
    return (
      <View style={styles.ventaCard}>
        <View style={styles.ventaHeader}>
          <View style={styles.ventaTypeContainer}>
            <Ionicons 
              name={isLeche ? "water" : "fish"} 
              size={24} 
              color={isLeche ? "#3498db" : "#e67e22"} 
            />
            <Text style={styles.ventaType}>
              {isLeche ? "Leche" : "Ganado"}
            </Text>
          </View>
          <Text style={styles.ventaDate}>{formatDate(item.created_at)}</Text>
        </View>
        
        <View style={styles.ventaContent}>
          <View style={styles.ventaInfo}>
            <Text style={styles.compradorText}>
              <Text style={styles.label}>Comprador: </Text>
              {item.comprador}
            </Text>
            <Text style={styles.cantidadText}>
              <Text style={styles.label}>Cantidad: </Text>
              {item.cantidad} {isLeche ? "litros" : "cabezas"}
            </Text>
            {isLeche && (
              <Text style={styles.precioText}>
                <Text style={styles.label}>Precio/L: </Text>
                {formatCurrency(item.precio_unitario)}
              </Text>
            )}
          </View>
          <View style={styles.ventaTotal}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>{formatCurrency(item.total)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Producción</Text>
        <Text style={styles.subtitle}>
          {selectedFarm ? `Granja: ${selectedFarm.name}` : 'Gestiona las ventas y producción'}
        </Text>
      </View>

      {/* Opciones de Venta - 50% superior */}
      <View style={styles.salesOptionsContainer}>
        <View style={styles.salesOptionsGrid}>
          <TouchableOpacity style={styles.optionCard} onPress={navigateToMilkSale}>
            <View style={styles.iconContainer}>
              <Ionicons name="water" size={40} color="#3498db" />
            </View>
            <Text style={styles.optionTitle}>Venta de Leche</Text>
            <Text style={styles.optionDescription}>
              Registra ventas de leche de tus vacas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionCard} onPress={navigateToCattleSale}>
            <View style={styles.iconContainer}>
              <Ionicons name="fish" size={40} color="#e67e22" />
            </View>
            <Text style={styles.optionTitle}>Venta de Ganado</Text>
            <Text style={styles.optionDescription}>
              Registra ventas de ganado
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de Ventas Recientes - 50% inferior */}
      <View style={styles.recentSalesContainer}>
        <View style={styles.recentSalesHeader}>
          <Text style={styles.recentSalesTitle}>Ventas Recientes</Text>
          <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
            <Ionicons 
              name="refresh" 
              size={24} 
              color="#27ae60" 
              style={refreshing ? styles.rotating : {}}
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#27ae60" />
            <Text style={styles.loadingText}>Cargando ventas...</Text>
          </View>
        ) : ventas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#bdc3c7" />
            <Text style={styles.emptyText}>No hay ventas registradas</Text>
            <Text style={styles.emptySubtext}>
              Comienza registrando tu primera venta arriba
            </Text>
          </View>
        ) : (
          <FlatList
            data={ventas}
            renderItem={renderVentaItem}
            keyExtractor={(item) => item.id_venta.toString()}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.ventasList}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#27ae60',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  // Estilos para opciones de venta (50% superior)
  salesOptionsContainer: {
    flex: 0.5,
    padding: 16,
    justifyContent: 'center',
  },
  salesOptionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 160,
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 50,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 16,
  },
  // Estilos para ventas recientes (50% inferior)
  recentSalesContainer: {
    flex: 0.5,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  recentSalesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  recentSalesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  rotating: {
    transform: [{ rotate: '360deg' }],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#777777',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#777777',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 8,
    textAlign: 'center',
  },
  ventasList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  ventaCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
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
    color: '#333333',
    marginLeft: 8,
  },
  ventaDate: {
    fontSize: 14,
    color: '#777777',
  },
  ventaContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  ventaInfo: {
    flex: 1,
  },
  compradorText: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 4,
  },
  cantidadText: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 4,
  },
  precioText: {
    fontSize: 14,
    color: '#555555',
  },
  label: {
    fontWeight: '500',
    color: '#333333',
  },
  ventaTotal: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: '#777777',
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
  },
});