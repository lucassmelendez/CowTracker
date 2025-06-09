import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../lib/services/api';
import { useFarm } from '../../components/FarmContext';
import { useAuth } from '../../components/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useCustomModal } from '../../components/CustomModal';
import { 
  showVeterinaryNotification, 
  setupNotificationResponseListener, 
  setupNotificationListener 
} from '../../lib/services/notificationService';
import * as Notifications from 'expo-notifications';

export default function VeterinaryDataPage() {
  const [cattle, setCattle] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const router = useRouter();
  const { selectedFarm } = useFarm();
  const { isVeterinario } = useAuth();
  const { showSuccess, ModalComponent } = useCustomModal();
    // Referencias para los listeners de notificaciones
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);

  // Configurar listeners de notificaciones
  useEffect(() => {
    // Listener para cuando el usuario interactúa con una notificación
    responseListener.current = setupNotificationResponseListener((response) => {
      const { data } = response.notification.request.content;
      console.log('Notificación presionada:', data);
      
      // Aquí podemos manejar la navegación basada en los datos de la notificación
      if (data.type === 'veterinary' && data.cattleId) {
        router.push(`/add-veterinary-record?id=${data.cattleId}`);
      }
    });
    
    // Listener para cuando una notificación es recibida mientras la app está abierta
    notificationListener.current = setupNotificationListener((notification) => {
      console.log('Notificación recibida en primer plano:', notification);
      // Podemos mostrar un mensaje adicional o actualizar la UI
    });
    
    // Limpiar listeners cuando el componente se desmonta
    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
    };
  }, [router]);
  useFocusEffect(
    React.useCallback(() => {
      loadCattle();
      
      // Mostrar una notificación informativa cuando el usuario accede a la pantalla
      // (solo si es un veterinario)
      if (isVeterinario()) {
        setTimeout(() => {
          showVeterinaryNotification(
            'Sistema de Notificaciones Activo',
            'Las notificaciones de registros veterinarios están activadas',
            { type: 'system', action: 'notification-system-active' }
          );
        }, 1000); // Esperar un segundo para no sobrecargar la UI
      }
      
      return () => {}; // Cleanup function
    }, [selectedFarm, isVeterinario])
  );

  const loadCattle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let cattleData: any[] = [];
      
      // Si seleccionó la opción "Todas las granjas"
      if (!selectedFarm || selectedFarm?._id === 'all-farms') {
        const farmsResponse = await api.farms.getAll();
        const farmsData = Array.isArray(farmsResponse) ? farmsResponse : [];
        
        const allCattlePromises = farmsData.map((farm: any) => 
          api.farms.getCattle(farm._id)
            .then((cattleResponse: any) => {
              const cattle = Array.isArray(cattleResponse) ? cattleResponse : cattleResponse?.data || [];
              // Añadimos el nombre de la granja a cada animal
              return cattle.map((animal: any) => ({
                ...animal,
                farmName: farm.name
              }));
            })
            .catch((err: any) => {
              console.error(`Error al cargar ganado de granja ${farm.name}:`, err);
              return [];
            })
        );
        
        // Esperamos que todas las promesas se resuelvan
        const allCattleResults = await Promise.all(allCattlePromises);
        
        // Combinamos todos los resultados
        cattleData = allCattleResults.flat();
      }
      // Si seleccionó una granja específica
      else if (selectedFarm?._id) {
        // Cargamos ganado de esa granja específica
        const cattleResponse = await api.farms.getCattle(selectedFarm._id);
        const rawCattleData = Array.isArray(cattleResponse) ? cattleResponse : (cattleResponse as any)?.data || [];
        // Añadimos el nombre de la granja a cada animal
        cattleData = rawCattleData.map((animal: any) => ({
          ...animal,
          farmName: selectedFarm.name
        }));
      }
      
      setCattle(cattleData);
      setDataLoaded(true);
    } catch (err) {
      console.error('Error cargando ganado:', err);
      setError('Error al cargar el ganado');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCattle();
  };

  // Función para obtener un ID confiable para la navegación
  const getReliableCattleId = (cattle: any): string => {
    if (cattle._id) return cattle._id.toString();
    if (cattle.id_ganado) return cattle.id_ganado.toString();
    if (cattle.numero_identificacion) return cattle.numero_identificacion.toString();
    if (cattle.identificationNumber) return cattle.identificationNumber.toString();
    return `unknown-${Math.random().toString(36).substring(2, 15)}`;
  };  const navigateToAddVeterinaryRecord = async (cattle: any) => {
    const cattleId = getReliableCattleId(cattle);
    const cattleName = getCattleName(cattle);
    
    // Mostrar notificación nativa en la barra de estado con datos adicionales
    await showVeterinaryNotification(
      'Agregar Registro Veterinario',
      `Iniciando registro médico para ${cattleName}`,
      {
        cattleId,
        cattleName,
        action: 'add-veterinary-record',
        timestamp: new Date().toISOString()
      }
    );
    
    // Navegar a la pantalla de agregar registro veterinario
    router.push(`/add-veterinary-record?id=${cattleId}`);
  };  const navigateToEditVeterinaryRecord = async (cattle: any) => {
    const cattleId = getReliableCattleId(cattle);
    const cattleName = getCattleName(cattle);
    // Pasar los datos existentes como parámetros de consulta
    const vetInfo = getVeterinaryInfo(cattle).vetInfo;
    
    const params = new URLSearchParams({
      id: cattleId,
      mode: 'edit',
      // Pasar los datos existentes
      ...(vetInfo.fecha_ini_tratamiento && { fecha_ini_tratamiento: vetInfo.fecha_ini_tratamiento }),
      ...(vetInfo.fecha_fin_tratamiento && { fecha_fin_tratamiento: vetInfo.fecha_fin_tratamiento }),
      ...(vetInfo.diagnostico && { diagnostico: vetInfo.diagnostico }),
      ...(vetInfo.tratamiento && { tratamiento: vetInfo.tratamiento }),
      ...(vetInfo.nota && { nota: vetInfo.nota }),
      ...(vetInfo.medicamento && { medicamento: vetInfo.medicamento }),
      ...(vetInfo.dosis && { dosis: vetInfo.dosis }),
      ...(vetInfo.cantidad_horas && { cantidad_horas: vetInfo.cantidad_horas.toString() }),
    });
    
    // Mostrar notificación nativa en la barra de estado con datos adicionales
    await showVeterinaryNotification(
      'Editar Registro Veterinario',
      `Editando registro médico para ${cattleName}`,
      {
        cattleId,
        cattleName,
        action: 'edit-veterinary-record',
        timestamp: new Date().toISOString(),
        hasVeterinaryInfo: true
      }
    );
    
    router.push(`/add-veterinary-record?${params.toString()}`);
  };

  const navigateToCattleDetail = (cattle: any) => {
    const cattleId = getReliableCattleId(cattle);
    router.push({
      pathname: '/(tabs)/cattle-details',
      params: { id: cattleId }
    });
  };

  // Función para obtener el identificador del ganado de forma consistente
  const getCattleIdentifier = (cattle: any): string => {
    if (cattle.numero_identificacion) return cattle.numero_identificacion;
    if (cattle.identificationNumber) return cattle.identificationNumber;
    if (cattle.id_ganado) return `${cattle.id_ganado}`;
    return 'Sin ID';
  };
  
  // Función para obtener el nombre del ganado de forma consistente
  const getCattleName = (cattle: any): string => {
    // Priorizar nombre propio si existe
    if (cattle.nombre && cattle.nombre.trim() !== '') return cattle.nombre;
    if (cattle.name && cattle.name.trim() !== '') return cattle.name;
    
    // Si no tiene nombre, usar identificador
    let identifier = getCattleIdentifier(cattle);
    if (identifier && identifier !== 'Sin ID') return `Ganado #${identifier}`;
    
    return 'Sin nombre';
  };
  
  // Función para obtener el texto del género de forma consistente
  const getGenderText = (cattle: any): string => {
    // Si tiene objeto genero (backend)
    if (cattle.genero && cattle.genero.descripcion) {
      const descripcion = cattle.genero.descripcion.toLowerCase();
      return descripcion === 'macho' ? 'Macho' : (descripcion === 'hembra' ? 'Hembra' : descripcion);
    }
    
    // Si tiene campo gender (frontend)
    if (cattle.gender) {
      const gender = cattle.gender.toLowerCase();
      return gender === 'macho' ? 'Macho' : (gender === 'hembra' ? 'Hembra' : gender);
    }

    // Si tiene campo genero pero es un string
    if (cattle.genero && typeof cattle.genero === 'string') {
      const genero = cattle.genero.toLowerCase();
      return genero === 'macho' ? 'Macho' : (genero === 'hembra' ? 'Hembra' : genero);
    }
    
    // Si tiene id_genero
    if (cattle.id_genero === 1) return 'Macho';
    if (cattle.id_genero === 2) return 'Hembra';
    
    return 'No especificado';
  };
  
  // Función para formatear fechas de manera segura
  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return 'No especificada';
    
    try {
      const date = new Date(dateStr);
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) return 'Fecha inválida';
      
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Error en formato';
    }
  };
  
  // Función para calcular días desde o hasta una fecha
  const getDaysInfo = (dateStr?: string): string => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      const today = new Date();
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) return '';
      
      // Calcular diferencia en días
      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        return `(en ${diffDays} día${diffDays !== 1 ? 's' : ''})`;
      } else if (diffDays < 0) {
        const absDiffDays = Math.abs(diffDays);
        return `(hace ${absDiffDays} día${absDiffDays !== 1 ? 's' : ''})`;
      } else {
        return '(hoy)';
      }
    } catch (error) {
      console.error('Error calculando información de días:', error);
      return '';
    }
  };

  // Función para calcular y mostrar información sobre el tiempo restante de tratamiento
  const getTreatmentRemainingInfo = (vetInfo: any): { text: string, isUrgent: boolean, hasEnded: boolean } => {
    if (!vetInfo) return { text: '', isUrgent: false, hasEnded: false };
    
    try {
      // Si tiene fecha de fin explícita
      if (vetInfo.fecha_fin_tratamiento) {
        const endDate = new Date(vetInfo.fecha_fin_tratamiento);
        const now = new Date();
        
        // Si la fecha de fin ya pasó
        if (endDate < now) {
          const diffTime = now.getTime() - endDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return { 
            text: `Tratamiento finalizado hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`, 
            isUrgent: false,
            hasEnded: true
          };
        } else {
          const diffTime = endDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return { 
            text: `Finaliza en ${diffDays} día${diffDays !== 1 ? 's' : ''}`, 
            isUrgent: diffDays <= 1,
            hasEnded: false
          };
        }
      }
      // Si tiene fecha de inicio y cantidad de horas, calculamos
      else if (vetInfo.fecha_ini_tratamiento && vetInfo.cantidad_horas) {
        const startDate = new Date(vetInfo.fecha_ini_tratamiento);
        const hours = typeof vetInfo.cantidad_horas === 'string' ? 
          parseInt(vetInfo.cantidad_horas) : vetInfo.cantidad_horas;
        
        if (!isNaN(hours) && hours > 0) {
          // Calcular fecha de finalización
          const endDate = new Date(startDate);
          endDate.setHours(endDate.getHours() + hours);
          
          const now = new Date();
          
          // Si la fecha calculada ya pasó
          if (endDate < now) {
            const diffTime = now.getTime() - endDate.getTime();
            const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
            
            if (diffHours < 24) {
              return { 
                text: `Tratamiento finalizado hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`, 
                isUrgent: false,
                hasEnded: true
              };
            } else {
              const diffDays = Math.ceil(diffHours / 24);
              return { 
                text: `Tratamiento finalizado hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`, 
                isUrgent: false,
                hasEnded: true
              };
            }
          } else {
            const diffTime = endDate.getTime() - now.getTime();
            const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
            
            if (diffHours < 24) {
              return { 
                text: `Finaliza en ${diffHours} hora${diffHours !== 1 ? 's' : ''}`, 
                isUrgent: diffHours <= 3,
                hasEnded: false
              };
            } else {
              const diffDays = Math.ceil(diffHours / 24);
              return { 
                text: `Finaliza en ${diffDays} día${diffDays !== 1 ? 's' : ''}`, 
                isUrgent: diffDays <= 1,
                hasEnded: false
              };
            }
          }
        }
      }
      
      // Si no tenemos suficiente información
      return { text: 'Sin fecha de finalización', isUrgent: false, hasEnded: false };
    } catch (error) {
      console.error('Error calculando información del tiempo restante:', error);
      return { text: '', isUrgent: false, hasEnded: false };
    }
  };

  // Función para normalizar datos veterinarios - simplificada para Supabase
  const getVeterinaryInfo = (item: any = {}): { 
    hasVeterinaryInfo: boolean, 
    vetInfo: any 
  } => {
    // Verificar si el ítem es válido
    if (!item) return { hasVeterinaryInfo: false, vetInfo: {} };
    
    // Verificar si tiene información veterinaria según la estructura de Supabase
    const vetInfo = item.informacion_veterinaria || {};
    const hasVeterinaryInfo = !!item.informacion_veterinaria;
    
    if (!hasVeterinaryInfo) {
      return { hasVeterinaryInfo: false, vetInfo: {} };
    }
    
    return { hasVeterinaryInfo, vetInfo };
  };

  const renderCattleItem = ({ item }: { item: any }) => {
    // Validar que el ítem es válido
    if (!item) {
      return null; // No renderizar nada si el ítem es nulo o indefinido
    }
    
    // Función para obtener el nombre de la granja
    const getFarmName = () => {
      // Verificar si tiene ID de finca (diferentes nombres de propiedad)
      const farmId = item.farmId || item.id_finca;
      
      if (!farmId) return 'Sin granja asignada';
      
      // Si tenemos el nombre de la granja en los datos del ganado, lo mostramos
      if (item.farmName || (item.finca && item.finca.nombre)) {
        return item.farmName || item.finca.nombre;
      }
      
      // Si estamos en modo "granja específica", podemos usar el nombre de la granja seleccionada
      if (selectedFarm && selectedFarm._id === farmId) {
        return selectedFarm.name;
      }
      
      return `Granja: ${farmId}`;
    };

    // Verificar si tiene información veterinaria
    const { hasVeterinaryInfo, vetInfo } = getVeterinaryInfo(item);

    // Obtener información del tiempo restante de tratamiento
    const treatmentInfo = getTreatmentRemainingInfo(vetInfo);

    return (
      <TouchableOpacity
        style={styles.cattleCard}
        onPress={() => navigateToCattleDetail(item)}
      >
        <View style={styles.cattleHeader}>
          <Text style={styles.cattleIdentifier}>
            {getCattleIdentifier(item)}
          </Text>
          <Text style={styles.cattleName}>
            {getCattleName(item)}
          </Text>
        </View>

        <View style={styles.cattleInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Género:</Text>
            <Text style={styles.infoValue}>
              {getGenderText(item)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estado de salud:</Text>
            <Text style={styles.infoValue}>{item.healthStatus || (item.estado_salud && item.estado_salud.descripcion) || 'No especificado'}</Text>
          </View>
        </View>
        
        {hasVeterinaryInfo && (
          <View style={styles.veterinaryInfoContainer}>
            <View style={styles.veterinaryHeader}>
              <Ionicons name="medkit" size={16} color="#27ae60" />
              <Text style={styles.veterinaryHeaderText}>
                Información Veterinaria
              </Text>
            </View>

            {/* Fecha del tratamiento */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha inicio:</Text>
              <Text style={styles.infoValue}>
                {formatDate(vetInfo?.fecha_ini_tratamiento || vetInfo?.fecha_tratamiento)}
                {getDaysInfo(vetInfo?.fecha_ini_tratamiento || vetInfo?.fecha_tratamiento) && (
                  <Text style={styles.daysInfo}>
                    {' '}{getDaysInfo(vetInfo?.fecha_ini_tratamiento || vetInfo?.fecha_tratamiento)}
                  </Text>
                )}
              </Text>
            </View>

            {/* Fecha fin del tratamiento */}
            {vetInfo?.fecha_fin_tratamiento && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fecha fin:</Text>
                <Text style={styles.infoValue}>
                  {formatDate(vetInfo.fecha_fin_tratamiento)}
                  {getDaysInfo(vetInfo.fecha_fin_tratamiento) && (
                    <Text style={styles.daysInfo}>
                      {' '}{getDaysInfo(vetInfo.fecha_fin_tratamiento)}
                    </Text>
                  )}
                </Text>
              </View>
            )}
            
            {/* Diagnóstico */}
            {vetInfo?.diagnostico && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Diagnóstico:</Text>
                <Text style={styles.infoValue}>{vetInfo.diagnostico}</Text>
              </View>
            )}
            
            {/* Tratamiento */}
            {vetInfo?.tratamiento && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tratamiento:</Text>
                <Text style={styles.infoValue}>{vetInfo.tratamiento}</Text>
              </View>
            )}

            {/* Medicamento */}
            {vetInfo?.medicamento && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Medicamento:</Text>
                <Text style={styles.infoValue}>{vetInfo.medicamento}</Text>
              </View>
            )}

            {/* Dosis */}
            {vetInfo?.dosis && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Dosis:</Text>
                <Text style={styles.infoValue}>{vetInfo.dosis}</Text>
              </View>
            )}

            {/* Cantidad de Horas */}
            {vetInfo?.cantidad_horas && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Duración:</Text>
                <Text style={styles.infoValue}>{vetInfo.cantidad_horas} horas</Text>
              </View>
            )}
            
            {/* Nota */}
            {vetInfo?.nota && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nota:</Text>
                <Text style={styles.infoValue}>{vetInfo.nota}</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Información del tiempo restante de tratamiento */}
        {hasVeterinaryInfo && treatmentInfo.text && (
          <View style={styles.treatmentInfoContainer}>
            <Text style={styles.treatmentInfoText}>
              {treatmentInfo.text}
            </Text>
          </View>
        )}
        
        {/* Botones de acción - Solo para veterinarios */}
        {isVeterinario() && (
          <View style={styles.actionButtonsContainer}>            <TouchableOpacity
              style={styles.addRecordButton}
              onPress={() => navigateToAddVeterinaryRecord(item)}
            >
              <Ionicons name="medical" size={14} color="#fff" />
              <Text style={styles.addRecordButtonText}>
                Agregar
              </Text>
            </TouchableOpacity>

            {/* Botón de editar - Solo si ya tiene información veterinaria */}
            {hasVeterinaryInfo && (
              <TouchableOpacity
                style={styles.editRecordButton}
                onPress={() => navigateToEditVeterinaryRecord(item)}
              >
                <Ionicons name="create-outline" size={14} color="#fff" />
                <Text style={styles.editRecordButtonText}>
                  Editar
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getSubtitle = () => {
    if (selectedFarm && selectedFarm._id !== 'all-farms') {
      return `Granja: ${selectedFarm.name}`;
    }
    if (isVeterinario()) {
      return "Seleccione un ganado para ver o agregar registros veterinarios";
    }
    return "Visualización de registros veterinarios";
  };

  if (loading && !refreshing && !dataLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={styles.loadingText}>Cargando ganado...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={50} color="#e74c3c" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadCattle}>
          <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cattle.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="information-circle" size={50} color="#777777" />
        <Text style={styles.emptyText}>
          {selectedFarm && selectedFarm._id !== 'all-farms' 
            ? `No hay ganado en la granja "${selectedFarm.name}"`
            : 'No tienes ganado registrado'
          }
        </Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/add-cattle')}
        >
          <Text style={styles.addButtonText}>Agregar ganado</Text>
        </TouchableOpacity>
      </View>
    );
  }  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Registros Veterinarios</Text>
        <Text style={styles.subtitle}>
          {getSubtitle()}
        </Text>
      </View>
            
      <FlatList
        data={cattle}
        renderItem={renderCattleItem}
        keyExtractor={(item) => {
          // Asegurarnos de que siempre devuelva un string único
          if (item._id) return item._id.toString();
          if (item.id_ganado) return `ganado-${item.id_ganado}`;
          if (item.numero_identificacion) return `id-${item.numero_identificacion}`;
          if (item.identificationNumber) return `num-${item.identificationNumber}`;
          // Último recurso usando un timestamp para garantizar unicidad
          return `item-${Math.random().toString(36).substring(2, 15)}`;
        }}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={["#27ae60"]} 
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  header: {
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 5,
  },
  listContainer: {
    paddingBottom: 20,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#27ae60',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#777777',
    textAlign: 'center',
  },
  addButton: {
    marginTop: 20,
    backgroundColor: '#27ae60',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cattleCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cattleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cattleIdentifier: {
    fontSize: 14,
    color: '#777777',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 10,
  },
  cattleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  cattleInfo: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 14,
    color: '#777777',
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  veterinaryInfoContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#27ae60',
  },
  veterinaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  veterinaryHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#27ae60',
    marginLeft: 6,
  },
  daysInfo: {
    fontSize: 12,
    color: '#777777',
    fontStyle: 'italic',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  addRecordButton: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 5,
    width: '48%',
    minHeight: 36,
  },
  addRecordButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 11,
    textAlign: 'center',
  },
  editRecordButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 5,
    width: '48%',
    minHeight: 36,
  },
  editRecordButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 11,
    textAlign: 'center',
  },
  treatmentInfoContainer: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#ffc107',
  },
  treatmentInfoText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
});