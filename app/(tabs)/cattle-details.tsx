import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
  Share,
  Linking,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../components/AuthContext';
import { supabase } from '../../lib/config/supabase';
import { useCacheManager } from '../../hooks/useCachedData';
import cachedApi from '../../lib/services/cachedApi';
import QRCode from 'react-native-qrcode-svg';

export default function CattleDetailPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cattleId = params?.id;
  const { userInfo } = useAuth();
  
  const [cattle, setCattle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  useEffect(() => {
    loadCattleDetails();
  }, [cattleId]);

  const loadCattleDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!cattleId) {
        setError('ID de ganado no proporcionado');
        return;
      }

      // Obtener los detalles del ganado con información relacionada
      const { data: ganadoData, error: ganadoError } = await supabase
        .from('ganado')
        .select(`
          *,
          finca:id_finca (nombre),
          estado_salud:id_estado_salud (descripcion),
          genero:id_genero (descripcion),
          produccion:id_produccion (descripcion),
          informacion_veterinaria:id_informacion_veterinaria (
            fecha_tratamiento,
            diagnostico,
            tratamiento,
            nota
          )
        `)
        .eq('id_ganado', cattleId)
        .single();

      if (ganadoError) {
        throw ganadoError;
      }

      if (!ganadoData) {
        setError('No se encontró el ganado');
        return;
      }

      setCattle(ganadoData);
    } catch (err) {
      console.error('Error al cargar detalles del ganado:', err);
      setError('Error al cargar los detalles del ganado');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      // Asegurar que cattleId sea del tipo correcto
      const id = Array.isArray(cattleId) ? cattleId[0] : cattleId;
      
      if (!id) {
        Alert.alert('Error', 'ID de ganado no válido');
        return;
      }

      // Usar el sistema de caché para eliminar la vaca
      await cachedApi.deleteCattle(id);

      Alert.alert('Éxito', 'Ganado eliminado correctamente');
      router.back();
    } catch (err) {
      console.error('Error al eliminar ganado:', err);
      Alert.alert('Error', 'No se pudo eliminar el ganado');
    }
  };

  const handleEdit = () => {
    router.push({
      pathname: '/add-cattle',
      params: { id: cattleId, mode: 'edit' }
    });
  };

  const generateQRContent = () => {
    // Crear una URL profunda que apunte a la página de detalles
    const deepLink = `cowtracker://cattle/${cattle?.id_ganado}`;
    
    return JSON.stringify({
      deepLink,
      data: {
        id: cattle?.id_ganado,
        identifier: cattle?.numero_identificacion,
        name: cattle?.nombre
      }
    });
  };

  const handleShareQR = async () => {
    try {
      const deepLink = `cowtracker://cattle/${cattle?.id_ganado}`;
      
      await Share.share({
        message: `Escanea este código QR para ver los detalles del ganado: ${cattle.nombre} (ID: ${cattle.numero_identificacion})\n\nEnlace directo: ${deepLink}`,
        title: 'Código QR del Ganado'
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir el código QR');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#777777" />
          <Text style={styles.loadingText}>Cargando detalles...</Text>
        </View>
      </View>
    );
  }

  if (error || !cattle) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.name}>{error || 'No se encontró el ganado'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.identifier}>
            ID: {cattle.numero_identificacion || 'Sin identificación'}
          </Text>
          <Text style={styles.name}>
            {cattle.nombre || 'Sin nombre'}
          </Text>
          
          <View style={styles.tagContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {cattle.genero?.descripcion || 'Sin género'}
              </Text>
            </View>
            <View style={[styles.tag, { backgroundColor: cattle.estado_salud?.descripcion === 'Saludable' ? '#4CAF50' : '#f44336' }]}>
              <Text style={styles.tagText}>
                {cattle.estado_salud?.descripcion || 'Estado desconocido'}
              </Text>
            </View>
          </View>
        </View>

        {/* Información General */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Información General</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tipo de Producción</Text>
            <Text style={styles.infoValue}>
              {cattle.produccion?.descripcion || 'No especificado'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Precio de Compra</Text>
            <Text style={styles.infoValue}>
              ${cattle.precio_compra || 'No especificado'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Granja</Text>
            <Text style={styles.infoValue}>
              {cattle.finca?.nombre || 'No asignada'}
            </Text>
          </View>

          {cattle.nota && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Notas</Text>
              <Text style={styles.infoValue}>
                {cattle.nota}
              </Text>
            </View>
          )}
        </View>

        {/* Información Veterinaria */}
        {cattle.informacion_veterinaria && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Información Veterinaria</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha de Tratamiento</Text>
              <Text style={styles.infoValue}>
                {new Date(cattle.informacion_veterinaria.fecha_tratamiento).toLocaleDateString()}
              </Text>
            </View>

            {cattle.informacion_veterinaria.diagnostico && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Diagnóstico</Text>
                <Text style={styles.infoValue}>
                  {cattle.informacion_veterinaria.diagnostico}
                </Text>
              </View>
            )}

            {cattle.informacion_veterinaria.tratamiento && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tratamiento</Text>
                <Text style={styles.infoValue}>
                  {cattle.informacion_veterinaria.tratamiento}
                </Text>
              </View>
            )}

            {cattle.informacion_veterinaria.nota && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Notas Veterinarias</Text>
                <Text style={styles.infoValue}>
                  {cattle.informacion_veterinaria.nota}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Botones de Acción */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEdit}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => setDeleteModalVisible(true)}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>

        {/* Botón QR */}
        <View style={styles.qrButtonContainer}>
          <TouchableOpacity 
            style={styles.qrButton}
            onPress={() => setQrModalVisible(true)}
          >
            <Ionicons name="qr-code-outline" size={24} color="#fff" />
            <Text style={styles.buttonText}>Generar QR</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Eliminación</Text>
            <Text style={styles.modalText}>
              ¿Estás seguro de que deseas eliminar este ganado? Esta acción no se puede deshacer.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  handleDelete();
                }}
              >
                <Text style={styles.modalButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal del Código QR */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={qrModalVisible}
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.qrModalContent}>
            <Text style={styles.modalTitle}>Código QR del Ganado</Text>
            
            <View style={styles.qrContainer}>
              <QRCode
                value={generateQRContent()}
                size={200}
                backgroundColor="white"
                color="black"
              />
            </View>

            <Text style={styles.qrInfo}>
              ID: {cattle?.numero_identificacion}{'\n'}
              Nombre: {cattle?.nombre}
            </Text>

            <Text style={styles.qrInstructions}>
              Escanea este código QR para ver los detalles del ganado directamente en la aplicación
            </Text>

            <View style={styles.qrButtonsContainer}>
              <TouchableOpacity
                style={[styles.qrActionButton, styles.shareButton]}
                onPress={handleShareQR}
              >
                <Ionicons name="share-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Compartir</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.qrActionButton, styles.closeButton]}
                onPress={() => setQrModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cerrar</Text>
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
    backgroundColor: '#27ae60',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  identifier: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 5,
    marginBottom: 5,
  },
  tagText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    margin: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoLabel: {
    fontSize: 15,
    color: '#777777',
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    color: '#333333',
    flex: 1,
    textAlign: 'right',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#777777',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    marginRight: 5,
  },
  confirmButton: {
    backgroundColor: '#e74c3c',
    marginLeft: 5,
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#3498db',
    padding: 12,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  qrButtonContainer: {
    padding: 10,
    marginBottom: 30,
  },
  qrButton: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
  },
  qrModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginVertical: 20,
  },
  qrInfo: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  qrInstructions: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },
  qrButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  qrActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  shareButton: {
    backgroundColor: '#3498db',
  },
  closeButton: {
    backgroundColor: '#e0e0e0',
  },
}); 