import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../components/AuthContext';

interface Ganado {
  id_ganado: number;
  nombre: string;
  numero_identificacion: string;
  precio_compra: number;
  nota?: string;
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

interface SalesDetailsProps {
  visible: boolean;
  ventaId: number | null;
  onClose: () => void;
  onEdit: (ventaId: number) => void;
  onDelete: (ventaId: number) => void;
}

export default function SalesDetails({ 
  visible, 
  ventaId, 
  onClose, 
  onEdit, 
  onDelete 
}: SalesDetailsProps) {
  const { userInfo } = useAuth();
  const [venta, setVenta] = useState<VentaDetalle | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchVentaDetails = async () => {
    if (!ventaId || !userInfo?.token) return;

    setLoading(true);
    try {
      // Obtener detalles básicos de la venta
      const ventaResponse = await fetch(
        `https://ct-backend-gray.vercel.app/api/ventas/${ventaId}`,
        {
          headers: {
            'Authorization': `Bearer ${userInfo.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!ventaResponse.ok) {
        throw new Error('Error al obtener detalles de la venta');
      }

      const ventaData = await ventaResponse.json();

      // Obtener ganados asociados si los hay
      try {
        const ganadosResponse = await fetch(
          `https://ct-backend-gray.vercel.app/api/ventas/${ventaId}/ganado`,
          {
            headers: {
              'Authorization': `Bearer ${userInfo.token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        let ganados = [];
        if (ganadosResponse.ok) {
          const ganadosData = await ganadosResponse.json();
          // Los datos vienen directamente como array de relaciones venta_ganado
          ganados = Array.isArray(ganadosData) ? ganadosData : (ganadosData.data || []);
        }

        setVenta({
          ...ventaData,
          ganados
        });
      } catch (error) {
        // Si no se pueden obtener los ganados, mostrar solo la venta
        setVenta(ventaData);
      }

    } catch (error) {
      console.error('Error al cargar detalles:', error);
      Alert.alert('Error', 'No se pudieron cargar los detalles de la venta');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && ventaId) {
      fetchVentaDetails();
    }
  }, [visible, ventaId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const formatQuantity = (quantity: number) => {
    if (quantity % 1 === 0) {
      return quantity.toString();
    }
    return quantity.toFixed(2).replace(/\.?0+$/, '');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (ventaId) {
      setShowDeleteModal(false);
      onDelete(ventaId);
      onClose();
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleEdit = () => {
    if (ventaId) {
      onEdit(ventaId);
      onClose();
    }
  };

  if (!venta && !loading) {
    return null;
  }

  // Determinar tipo de venta de manera más precisa
  // Las ventas de leche tienden a tener cantidades altas (10+ litros típicamente)
  // Las ventas de ganado tienden a ser pocas unidades (1-10 animales típicamente)
  // También consideramos el precio unitario: leche es más barata por unidad
  const isLeche = venta && (venta.cantidad >= 10 || (venta.cantidad > 1 && venta.precio_unitario < 50000));
  const tipoVenta = isLeche ? 'Venta de Leche' : 'Venta de Ganado';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#2c3e50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles de Venta</Text>
          <View style={styles.placeholder} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>Cargando detalles...</Text>
          </View>
        ) : venta ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Información principal */}
            <View style={styles.mainCard}>
              <View style={styles.ventaTypeContainer}>
                <Ionicons 
                  name={isLeche ? "water" : "fish"} 
                  size={28} 
                  color={isLeche ? "#3498db" : "#e67e22"} 
                />
                <Text style={[styles.ventaType, { color: isLeche ? "#3498db" : "#e67e22" }]}>
                  {tipoVenta}
                </Text>
              </View>
              
              <Text style={styles.ventaId}>Venta #{venta.id_venta}</Text>
              <Text style={styles.fecha}>{formatDate(venta.fecha_venta)}</Text>
            </View>

            {/* Información del comprador */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Información del Comprador</Text>
              <View style={styles.infoRow}>
                <Ionicons name="person" size={20} color="#7f8c8d" />
                <Text style={styles.infoText}>{venta.comprador}</Text>
              </View>
            </View>

            {/* Información de cantidad y precio */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Detalles de la Venta</Text>
              
              {isLeche && (
                <View style={styles.infoRow}>
                  <Ionicons name="water" size={20} color="#3498db" />
                  <Text style={styles.infoLabel}>Cantidad:</Text>
                  <Text style={styles.infoValue}>{formatQuantity(venta.cantidad)} L</Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Ionicons name="pricetag" size={20} color="#7f8c8d" />
                <Text style={styles.infoLabel}>
                  {isLeche ? 'Precio por litro:' : 'Monto total:'}
                </Text>
                <Text style={styles.infoValue}>{formatCurrency(venta.precio_unitario)}</Text>
              </View>

              <View style={[styles.infoRow, styles.totalRow]}>
                <Ionicons name="cash" size={20} color="#27ae60" />
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>{formatCurrency(venta.total)}</Text>
              </View>
            </View>

            {/* Ganado asociado */}
            {venta.ganados && venta.ganados.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {isLeche ? 'Ganado Asociado a la Venta' : 'Ganado Vendido'}
                </Text>
                {venta.ganados.map((relacion, index) => (
                  <View key={relacion.id_venta_ganado} style={styles.ganadoItem}>
                    <View style={styles.ganadoInfo}>
                      <Ionicons name="fish" size={18} color="#e67e22" />
                      <Text style={styles.ganadoNombre}>{relacion.ganado.nombre}</Text>
                      <Text style={styles.ganadoId}>ID: {relacion.ganado.id_ganado}</Text>
                      {relacion.ganado.numero_identificacion && (
                        <Text style={styles.ganadoNumero}>#{relacion.ganado.numero_identificacion}</Text>
                      )}
                    </View>
                    <Text style={styles.ganadoPrecio}>{formatCurrency(relacion.ganado.precio_compra)}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        ) : null}

        {/* Botones de acción */}
        {venta && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Ionicons name="pencil" size={20} color="#fff" />
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash" size={20} color="#fff" />
              <Text style={styles.buttonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Modal de confirmación de eliminación */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={cancelDelete}
        >
          <View style={styles.deleteModalOverlay}>
            <View style={styles.deleteModalContainer}>
              <View style={styles.deleteModalHeader}>
                <Ionicons name="warning" size={48} color="#e74c3c" />
                <Text style={styles.deleteModalTitle}>Confirmar Eliminación</Text>
              </View>
              
              <Text style={styles.deleteModalMessage}>
                ¿Estás seguro de que deseas eliminar esta venta?
              </Text>
              <Text style={styles.deleteModalSubMessage}>
                Esta acción no se puede deshacer.
              </Text>

              <View style={styles.deleteModalButtons}>
                <TouchableOpacity 
                  style={styles.cancelDeleteButton} 
                  onPress={cancelDelete}
                >
                  <Text style={styles.cancelDeleteText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.confirmDeleteButton} 
                  onPress={confirmDelete}
                >
                  <Ionicons name="trash" size={18} color="#fff" />
                  <Text style={styles.confirmDeleteText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  content: {
    flex: 1,
    padding: 20,
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ventaTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ventaType: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
  },
  ventaId: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
    marginBottom: 4,
  },
  fecha: {
    fontSize: 14,
    color: '#95a5a6',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 12,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  totalLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  totalValue: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: 'bold',
  },
  ganadoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  ganadoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ganadoNombre: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    marginLeft: 8,
  },
  ganadoId: {
    fontSize: 12,
    color: '#95a5a6',
    marginLeft: 8,
  },
  ganadoNumero: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  ganadoPrecio: {
    fontSize: 14,
    color: '#e67e22',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  editButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginRight: 12,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Estilos del modal de confirmación de eliminación
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 12,
  },
  deleteModalMessage: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  deleteModalSubMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelDeleteButton: {
    backgroundColor: '#ecf0f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    flex: 0.45,
    alignItems: 'center',
  },
  cancelDeleteText: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmDeleteButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    flex: 0.45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDeleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
}); 