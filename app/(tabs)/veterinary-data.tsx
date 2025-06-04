import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../lib/services/api';
import { useFarm } from '../../components/FarmContext';
import { useFocusEffect } from '@react-navigation/native';

export default function VeterinaryDataPage() {
  const [cattle, setCattle] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const router = useRouter();
  const { selectedFarm } = useFarm();

  useFocusEffect(
    React.useCallback(() => {
      loadCattle();
      return () => {}; // Cleanup function
    }, [selectedFarm])
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
    if (cattle.identificationNumber) return cattle.identificationNumber.toString();
    if (cattle.numero_identificacion) return cattle.numero_identificacion.toString();
    return `unknown-${Math.random().toString(36).substring(2, 15)}`;
  };

  const navigateToAddVeterinaryRecord = (cattle: any) => {
    const cattleId = getReliableCattleId(cattle);
    router.push(`/add-veterinary-record?id=${cattleId}`);
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
    if (cattle.identificationNumber) return cattle.identificationNumber;
    if (cattle.numero_identificacion) return cattle.numero_identificacion;
    if (cattle.id_ganado) return `${cattle.id_ganado}`;
    return 'Sin ID';
  };
  
  // Función para obtener el nombre del ganado de forma consistente
  const getCattleName = (cattle: any): string => {
    // Priorizar nombre propio si existe
    if (cattle.name && cattle.name.trim() !== '') return cattle.name;
    if (cattle.nombre && cattle.nombre.trim() !== '') return cattle.nombre;
    
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
  
  // Función para verificar si un registro veterinario está desactualizado
  const isVeterinaryRecordOutdated = (vetInfo: any): boolean => {
    // Si no hay fecha de próxima revisión, no podemos determinar si está desactualizado
    if (!vetInfo?.proxima_revision && !vetInfo?.nextCheckup) return false;
    
    try {
      const proximaRevision = new Date(vetInfo.proxima_revision || vetInfo.nextCheckup);
      const hoy = new Date();
      
      // Desactualizado si la fecha de próxima revisión ya pasó
      return proximaRevision < hoy;
    } catch (error) {
      console.error('Error verificando actualización del registro:', error);
      return false;
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
    // Función para normalizar datos veterinarios
  const normalizeVeterinaryInfo = (item: any = {}): { 
    hasVeterinaryInfo: boolean, 
    vetInfo: any 
  } => {
    // Verificar si el ítem es válido
    if (!item) return { hasVeterinaryInfo: false, vetInfo: {} };
    
    // Verificar si tiene información veterinaria (según el modelo backend o frontend)
    const backendInfo = item.informacion_veterinaria || {};
    const frontendInfo = item.veterinaryInfo || {};
    const hasVeterinaryInfo = !!item.informacion_veterinaria || !!item.veterinaryInfo;
    
    if (!hasVeterinaryInfo) {
      return { hasVeterinaryInfo: false, vetInfo: {} };
    }
    
    // Calcular fecha de próxima revisión si no existe pero hay información de periodicidad
    let proximaRevision = backendInfo?.proxima_revision || frontendInfo?.nextCheckup;
    
    // Si no hay fecha de próxima revisión pero hay información de periodicidad y fecha de tratamiento
    if (!proximaRevision && (backendInfo?.periodicidad || frontendInfo?.checkupInterval)) {
      const periodicidad = backendInfo?.periodicidad || frontendInfo?.checkupInterval;
      const fechaTratamiento = backendInfo?.fecha_tratamiento || frontendInfo?.date;
      
      if (fechaTratamiento && periodicidad && typeof periodicidad === 'number') {
        try {
          const fechaBase = new Date(fechaTratamiento);
          if (!isNaN(fechaBase.getTime())) {
            // Sumar los días de periodicidad para obtener la próxima revisión
            const fechaProximaRevision = new Date(fechaBase);
            fechaProximaRevision.setDate(fechaBase.getDate() + periodicidad);
            proximaRevision = fechaProximaRevision.toISOString();
          }
        } catch (error) {
          console.error('Error calculando próxima revisión:', error);
        }
      }
    }
    
    // Priorizar modelo de backend, pero asegurar que todos los campos estén presentes
    const vetInfo = {
      // Campos comunes normalizados
      fecha_tratamiento: backendInfo?.fecha_tratamiento || frontendInfo?.date,
      diagnostico: backendInfo?.diagnostico || frontendInfo?.diagnosis,
      tratamiento: backendInfo?.tratamiento || frontendInfo?.treatment,
      nota: backendInfo?.nota || frontendInfo?.notes,
      
      // Campos adicionales que podrían estar presentes
      veterinario: backendInfo?.veterinario || frontendInfo?.veterinarian,
      medicamentos: backendInfo?.medicamentos || frontendInfo?.medications,
      dosis: backendInfo?.dosis || frontendInfo?.dosage,
      proxima_revision: proximaRevision,
      
      // Mantener las referencias originales para compatibilidad
      ...backendInfo,
      ...frontendInfo,
    };
    
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
    };    // Verificar si tiene información veterinaria (según el modelo backend o frontend)
    const { hasVeterinaryInfo, vetInfo } = normalizeVeterinaryInfo(item);

    return (      <TouchableOpacity
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
            <Text style={styles.infoLabel}>Raza:</Text>
            <Text style={styles.infoValue}>{item.breed || item.raza || 'No especificada'}</Text>
          </View>
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
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Granja:</Text>
            <Text style={styles.infoValue}>{getFarmName()}</Text>
          </View>
        </View>        {hasVeterinaryInfo && (
          <View style={[
            styles.veterinaryInfoContainer,
            // Aplicar estilo diferenciado si el registro está desactualizado
            isVeterinaryRecordOutdated(vetInfo) && styles.outdatedVeterinaryContainer
          ]}>
            <View style={styles.veterinaryHeader}>
              <Ionicons 
                name={isVeterinaryRecordOutdated(vetInfo) ? "alert-circle" : "medkit"} 
                size={16} 
                color={isVeterinaryRecordOutdated(vetInfo) ? "#e74c3c" : "#27ae60"} 
              />
              <Text 
                style={[
                  styles.veterinaryHeaderText,
                  isVeterinaryRecordOutdated(vetInfo) && styles.outdatedText
                ]}
              >
                {isVeterinaryRecordOutdated(vetInfo) 
                  ? "Información Veterinaria (Desactualizada)" 
                  : "Información Veterinaria"
                }
              </Text>
            </View>
              {/* Fecha del tratamiento */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Fecha:</Text>
              <Text style={styles.infoValue}>
                {formatDate(vetInfo?.fecha_tratamiento || vetInfo?.date)}{' '}
                <Text style={styles.daysInfo}>
                  {getDaysInfo(vetInfo?.fecha_tratamiento || vetInfo?.date)}
                </Text>
              </Text>
            </View>

            {/* Veterinario */}
            {(vetInfo?.veterinario || vetInfo?.veterinarian) && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Veterinario:</Text>
                <Text style={styles.infoValue}>{vetInfo?.veterinario || vetInfo?.veterinarian}</Text>
              </View>
            )}
            
            {/* Diagnóstico */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Diagnóstico:</Text>
              <Text style={styles.infoValue}>{vetInfo?.diagnostico || vetInfo?.diagnosis || 'No especificado'}</Text>
            </View>
            
            {/* Tratamiento */}
            {(vetInfo?.tratamiento || vetInfo?.treatment) && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tratamiento:</Text>
                <Text style={styles.infoValue}>{vetInfo?.tratamiento || vetInfo?.treatment}</Text>
              </View>
            )}
            
            {/* Medicamentos */}
            {(vetInfo?.medicamentos || vetInfo?.medications) && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Medicamentos:</Text>
                <Text style={styles.infoValue}>{vetInfo?.medicamentos || vetInfo?.medications}</Text>
              </View>
            )}
            
            {/* Dosis */}
            {(vetInfo?.dosis || vetInfo?.dosage) && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Dosis:</Text>
                <Text style={styles.infoValue}>{vetInfo?.dosis || vetInfo?.dosage}</Text>
              </View>
            )}
            
            {/* Notas adicionales */}
            {(vetInfo?.nota || vetInfo?.notes) && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Notas:</Text>
                <Text style={styles.infoValue}>{vetInfo?.nota || vetInfo?.notes}</Text>
              </View>
            )}
              {/* Fecha de próxima revisión */}
            {(vetInfo?.proxima_revision || vetInfo?.nextCheckup) && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Próx. revisión:</Text>
                <Text style={[
                  styles.infoValue, 
                  styles.highlightedValue,
                  isVeterinaryRecordOutdated(vetInfo) && styles.outdatedText
                ]}>
                  {formatDate(vetInfo?.proxima_revision || vetInfo?.nextCheckup)}{' '}
                  <Text style={[styles.daysInfo, isVeterinaryRecordOutdated(vetInfo) && styles.outdatedText]}>
                    {getDaysInfo(vetInfo?.proxima_revision || vetInfo?.nextCheckup)}
                  </Text>
                  {isVeterinaryRecordOutdated(vetInfo) && " ⚠️ Vencida"}
                </Text>
              </View>
            )}
          </View>
        )}        <TouchableOpacity
          style={[
            styles.addRecordButton,
            isVeterinaryRecordOutdated(vetInfo) && styles.urgentButton
          ]}
          onPress={() => navigateToAddVeterinaryRecord(item)}
        >
          <Ionicons 
            name={isVeterinaryRecordOutdated(vetInfo) ? "warning-outline" : "medical"} 
            size={16} 
            color="#fff" 
          />
          <Text style={styles.addRecordButtonText}>
            {hasVeterinaryInfo 
              ? (isVeterinaryRecordOutdated(vetInfo) 
                ? 'Actualizar registro médico (Urgente)' 
                : 'Actualizar registro médico')
              : 'Agregar registro médico'
            }
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const getSubtitle = () => {
    if (selectedFarm && selectedFarm._id !== 'all-farms') {
      return `Granja: ${selectedFarm.name}`;
    }
    return "Seleccione un ganado para ver o agregar registros veterinarios";
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
          onPress={() => router.push('/add-cattle')}
        >
          <Text style={styles.addButtonText}>Agregar ganado</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
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
          if (item.identificationNumber) return `id-${item.identificationNumber}`;
          if (item.numero_identificacion) return `num-${item.numero_identificacion}`;
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
  addRecordButton: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
  },
  addRecordButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },  // Estilos para información veterinaria
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
  },  // Estilo para valores destacados
  highlightedValue: {
    fontWeight: '600',
    color: '#2980b9',
  },  // Estilos para registro veterinario desactualizado
  outdatedVeterinaryContainer: {
    borderLeftColor: '#e74c3c',
    backgroundColor: '#FFF5F5',
  },
  outdatedText: {
    color: '#e74c3c',
    fontWeight: '600',
  },  // Estilo para botón de acción urgente
  urgentButton: {
    backgroundColor: '#e74c3c',
  },
  // Estilo para información de días
  daysInfo: {
    fontSize: 12,
    color: '#777777',
    fontStyle: 'italic',
  },
});