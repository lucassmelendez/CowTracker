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
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { cattleDetailStyles } from '../styles/cattleDetailStyles';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../config/supabase';
import QRCode from 'react-native-qrcode-svg';

const CattleDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cattleId = params?.id;
  const { userInfo } = useAuth();
  
  const [cattle, setCattle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      const { error: deleteError } = await supabase
        .from('ganado')
        .delete()
        .eq('id_ganado', cattleId);

      if (deleteError) throw deleteError;

      Alert.alert('Éxito', 'Ganado eliminado correctamente');
      router.back();
    } catch (err) {
      console.error('Error al eliminar ganado:', err);
      Alert.alert('Error', 'No se pudo eliminar el ganado');
    }
  };

  const handleEdit = () => {
    router.push({
      pathname: '/edit-cattle',
      params: { id: cattleId }
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
      <View style={cattleDetailStyles.container}>
        <View style={cattleDetailStyles.loadingContainer}>
          <ActivityIndicator size="large" color={cattleDetailStyles.loadingText.color} />
          <Text style={cattleDetailStyles.loadingText}>Cargando detalles...</Text>
        </View>
      </View>
    );
  }

  if (error || !cattle) {
    return (
      <View style={cattleDetailStyles.container}>
        <View style={cattleDetailStyles.header}>
          <Text style={cattleDetailStyles.name}>{error || 'No se encontró el ganado'}</Text>
        </View>
        <TouchableOpacity 
          style={cattleDetailStyles.backButton}
          onPress={() => router.back()}
        >
          <Text style={cattleDetailStyles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={cattleDetailStyles.container}>
      <ScrollView>
        {/* Encabezado */}
        <View style={cattleDetailStyles.header}>
          <Text style={cattleDetailStyles.identifier}>
            ID: {cattle.numero_identificacion || 'Sin identificación'}
          </Text>
          <Text style={cattleDetailStyles.name}>
            {cattle.nombre || 'Sin nombre'}
          </Text>
          
          <View style={cattleDetailStyles.tagContainer}>
            <View style={cattleDetailStyles.tag}>
              <Text style={cattleDetailStyles.tagText}>
                {cattle.genero?.descripcion || 'Sin género'}
              </Text>
            </View>
            <View style={[cattleDetailStyles.tag, { backgroundColor: cattle.estado_salud?.descripcion === 'Saludable' ? '#4CAF50' : '#f44336' }]}>
              <Text style={cattleDetailStyles.tagText}>
                {cattle.estado_salud?.descripcion || 'Estado desconocido'}
              </Text>
            </View>
          </View>
        </View>

        {/* Información General */}
        <View style={cattleDetailStyles.infoCard}>
          <Text style={cattleDetailStyles.sectionTitle}>Información General</Text>
          
          <View style={cattleDetailStyles.infoRow}>
            <Text style={cattleDetailStyles.infoLabel}>Tipo de Producción</Text>
            <Text style={cattleDetailStyles.infoValue}>
              {cattle.produccion?.descripcion || 'No especificado'}
            </Text>
          </View>
          
          <View style={cattleDetailStyles.infoRow}>
            <Text style={cattleDetailStyles.infoLabel}>Precio de Compra</Text>
            <Text style={cattleDetailStyles.infoValue}>
              ${cattle.precio_compra || 'No especificado'}
            </Text>
          </View>
          
          <View style={cattleDetailStyles.infoRow}>
            <Text style={cattleDetailStyles.infoLabel}>Granja</Text>
            <Text style={cattleDetailStyles.infoValue}>
              {cattle.finca?.nombre || 'No asignada'}
            </Text>
          </View>

          {cattle.nota && (
            <View style={cattleDetailStyles.infoRow}>
              <Text style={cattleDetailStyles.infoLabel}>Notas</Text>
              <Text style={cattleDetailStyles.infoValue}>
                {cattle.nota}
              </Text>
            </View>
          )}
        </View>

        {/* Información Veterinaria */}
        {cattle.informacion_veterinaria && (
          <View style={cattleDetailStyles.infoCard}>
            <Text style={cattleDetailStyles.sectionTitle}>Información Veterinaria</Text>
            
            <View style={cattleDetailStyles.infoRow}>
              <Text style={cattleDetailStyles.infoLabel}>Fecha de Tratamiento</Text>
              <Text style={cattleDetailStyles.infoValue}>
                {new Date(cattle.informacion_veterinaria.fecha_tratamiento).toLocaleDateString()}
              </Text>
            </View>

            {cattle.informacion_veterinaria.diagnostico && (
              <View style={cattleDetailStyles.infoRow}>
                <Text style={cattleDetailStyles.infoLabel}>Diagnóstico</Text>
                <Text style={cattleDetailStyles.infoValue}>
                  {cattle.informacion_veterinaria.diagnostico}
                </Text>
              </View>
            )}

            {cattle.informacion_veterinaria.tratamiento && (
              <View style={cattleDetailStyles.infoRow}>
                <Text style={cattleDetailStyles.infoLabel}>Tratamiento</Text>
                <Text style={cattleDetailStyles.infoValue}>
                  {cattle.informacion_veterinaria.tratamiento}
                </Text>
              </View>
            )}

            {cattle.informacion_veterinaria.nota && (
              <View style={cattleDetailStyles.infoRow}>
                <Text style={cattleDetailStyles.infoLabel}>Notas Veterinarias</Text>
                <Text style={cattleDetailStyles.infoValue}>
                  {cattle.informacion_veterinaria.nota}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Botones de Acción */}
        <View style={cattleDetailStyles.buttonContainer}>
          <TouchableOpacity 
            style={cattleDetailStyles.editButton}
            onPress={handleEdit}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={cattleDetailStyles.buttonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={cattleDetailStyles.deleteButton}
            onPress={() => setDeleteModalVisible(true)}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={cattleDetailStyles.buttonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>

        {/* Botón QR */}
        <View style={cattleDetailStyles.qrButtonContainer}>
          <TouchableOpacity 
            style={cattleDetailStyles.qrButton}
            onPress={() => setQrModalVisible(true)}
          >
            <Ionicons name="qr-code-outline" size={24} color="#fff" />
            <Text style={cattleDetailStyles.buttonText}>Generar QR</Text>
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
        <View style={cattleDetailStyles.modalContainer}>
          <View style={cattleDetailStyles.modalContent}>
            <Text style={cattleDetailStyles.modalTitle}>Confirmar Eliminación</Text>
            <Text style={cattleDetailStyles.modalText}>
              ¿Estás seguro de que deseas eliminar este ganado? Esta acción no se puede deshacer.
            </Text>
            <View style={cattleDetailStyles.modalButtons}>
              <TouchableOpacity
                style={[cattleDetailStyles.modalButton, cattleDetailStyles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={cattleDetailStyles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[cattleDetailStyles.modalButton, cattleDetailStyles.confirmButton]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  handleDelete();
                }}
              >
                <Text style={cattleDetailStyles.modalButtonText}>Eliminar</Text>
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
        <View style={cattleDetailStyles.modalContainer}>
          <View style={cattleDetailStyles.qrModalContent}>
            <Text style={cattleDetailStyles.modalTitle}>Código QR del Ganado</Text>
            
            <View style={cattleDetailStyles.qrContainer}>
              <QRCode
                value={generateQRContent()}
                size={200}
                backgroundColor="white"
                color="black"
              />
            </View>

            <Text style={cattleDetailStyles.qrInfo}>
              ID: {cattle?.numero_identificacion}{'\n'}
              Nombre: {cattle?.nombre}
            </Text>

            <Text style={cattleDetailStyles.qrInstructions}>
              Escanea este código QR para ver los detalles del ganado directamente en la aplicación
            </Text>

            <View style={cattleDetailStyles.qrButtonsContainer}>
              <TouchableOpacity
                style={[cattleDetailStyles.qrActionButton, cattleDetailStyles.shareButton]}
                onPress={handleShareQR}
              >
                <Ionicons name="share-outline" size={20} color="#fff" />
                <Text style={cattleDetailStyles.buttonText}>Compartir</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[cattleDetailStyles.qrActionButton, cattleDetailStyles.closeButton]}
                onPress={() => setQrModalVisible(false)}
              >
                <Text style={cattleDetailStyles.buttonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CattleDetailScreen;