import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';

import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useFarm } from '../../components/FarmContext';
import { useAuth } from '../../components/AuthContext';
import { useUserFarms, useAllFarms, useFarmCattle, useAllCattleWithFarmInfo, useCacheManager } from '../../hooks/useCachedData';
import { useUserRefresh } from '../../hooks/useUserRefresh';
import { createStyles, tw } from '../../styles/tailwind';
import PremiumUpgradeModal from '../../components/PremiumUpgradeModal';

interface CattleItem {
  id_ganado?: string | number;
  _id?: string;
  numero_identificacion?: string;
  identificationNumber?: string;
  nombre?: string;
  id_estado_salud?: number;
  id_produccion?: number;
  id_genero?: number;

  nota?: string;
  notes?: string;
  id_finca?: string | number;
  finca?: {
    nombre: string;
    _id?: string;
    id_finca?: string | number;
  };
  farmName?: string;
  farmId?: string;
  // Campos adicionales para compatibilidad con datos de respaldo
  tipo?: string;
  type?: string;
  raza?: string;
  breed?: string;
  genero?: {
    descripcion: string;
  };
  estado_salud?: {
    descripcion: string;
  };
  produccion?: {
    descripcion: string;
  };
}

export default function CattleTab() {
  const router = useRouter();
  const { selectedFarm } = useFarm();
  const { isAdmin, isTrabajador, userInfo } = useAuth();
  const [cattle, setCattle] = useState<CattleItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { invalidateCache } = useCacheManager();
  const lastRefreshRef = useRef<number>(0);
  const REFRESH_COOLDOWN = 2000; // 2 segundos de cooldown entre refreshes
  
  // Hook para refrescar automáticamente la información del usuario
  useUserRefresh({
    intervalMs: 30000, // Refrescar cada 30 segundos
    enableAutoRefresh: true
  });

  // Determinar si estamos mostrando todas las granjas o una específica
  const isShowingAllFarms = !selectedFarm || selectedFarm._id === 'all-farms';
  const selectedFarmId = isShowingAllFarms ? null : selectedFarm._id;

  // Hooks con caché - usar useUserFarms para obtener solo las granjas del usuario
  const { 
    data: userFarms, 
    loading: userFarmsLoading, 
    error: userFarmsError,
    refresh: refreshUserFarms 
  } = useUserFarms();

  // Solo usar useAllFarms si es admin
  const { 
    data: allFarms, 
    loading: allFarmsLoading, 
    error: allFarmsError,
    refresh: refreshAllFarms 
  } = useAllFarms();

  // Determinar qué granjas usar según el rol del usuario
  const farmsToUse = isAdmin() ? allFarms : userFarms;
  const farmsLoading = isAdmin() ? allFarmsLoading : userFarmsLoading;
  const farmsError = isAdmin() ? allFarmsError : userFarmsError;
  const refreshFarms = isAdmin() ? refreshAllFarms : refreshUserFarms;

  // Solo obtener ganado con información de granja si es admin o si el usuario tiene granjas
  const shouldLoadAllCattle = isAdmin() && isShowingAllFarms;
  const userHasFarms = userFarms && userFarms.length > 0;

  const { 
    data: allCattleWithFarmInfo, 
    loading: allCattleLoading, 
    error: allCattleError,
    refresh: refreshAllCattle 
  } = useAllCattleWithFarmInfo();

  const { 
    data: farmCattle, 
    loading: farmCattleLoading, 
    error: farmCattleError,
    refresh: refreshFarmCattle 
  } = useFarmCattle(selectedFarmId);

  // Determinar el estado de carga y datos a mostrar
  const loading = isShowingAllFarms ? (farmsLoading || (shouldLoadAllCattle ? allCattleLoading : false)) : farmCattleLoading;
  const dataError = isShowingAllFarms ? (farmsError || (shouldLoadAllCattle ? allCattleError : null)) : farmCattleError;

  const styles = {
    container: createStyles(tw.container),
    loadingContainer: createStyles(tw.loadingContainer),
    loadingText: createStyles(tw.loadingText),
    header: createStyles('bg-white p-5 border-b border-gray-200'),
    title: createStyles('text-2xl font-bold text-gray-800 mb-1'),
    subtitle: createStyles('text-sm text-gray-600'),
    errorText: createStyles('text-xs text-red-500 mt-1'),
    debugText: createStyles('text-xs text-gray-400 mt-1'),
    listContainer: createStyles('p-4'),
    cattleItem: createStyles(tw.listItem),
    cattleHeader: createStyles('flex-row justify-between items-center mb-2'),
    cattleName: createStyles(tw.listItemTitle + ' flex-1'),
    statusBadge: createStyles('px-2 py-1 rounded-full'),
    statusText: createStyles('text-white text-xs font-bold'),
    cattleDetails: createStyles('gap-1'),
    detailText: createStyles('text-sm text-gray-600'),
    notesText: createStyles('text-xs text-gray-500 mt-1'),
    emptyContainer: createStyles('flex-1 justify-center items-center py-12'),
    emptyText: createStyles('text-base text-gray-600 text-center mb-5'),
    addButton: createStyles('bg-green-600 px-5 py-2 rounded-full'),
    addButtonText: createStyles('text-white text-base font-bold'),
    fab: createStyles('absolute bottom-5 right-5 w-14 h-14 rounded-full bg-green-600 justify-center items-center shadow-lg'),
    fabText: createStyles('text-white text-2xl font-bold'),
    debugButton: createStyles('bg-green-600 px-5 py-2 rounded-full mt-2'),
    debugButtonText: createStyles('text-white text-base font-bold'),
  };

  // Función para limpiar caché corrupto
  const clearCorruptedCache = async () => {
    console.log('Limpiando caché corrupto...');
    await invalidateCache('cattle');
    // Refrescar después de limpiar
    if (isShowingAllFarms) {
      await refreshAllCattle();
    } else {
      await refreshFarmCattle();
    }
  };

  // Refrescar datos cuando la pantalla obtiene foco
  useFocusEffect(
    React.useCallback(() => {
      const now = Date.now();
      
      // Solo refrescar si ha pasado suficiente tiempo desde el último refresh
      if (now - lastRefreshRef.current < REFRESH_COOLDOWN) {
        console.log('Pantalla obtuvo foco, pero saltando refresh (cooldown activo)');
        return;
      }
      
      console.log('Pantalla obtuvo foco, refrescando datos...');
      lastRefreshRef.current = now;
      
      // Refrescar inmediatamente sin esperar
      const refreshData = async () => {
        if (isShowingAllFarms) {
          await Promise.all([refreshAllCattle(), refreshFarms()]);
        } else {
          await refreshFarmCattle();
        }
      };
      
      refreshData();
    }, [selectedFarmId, isShowingAllFarms]) // Reducir dependencias para evitar bucle
  );

  // Agregar un efecto adicional para refrescar cuando cambian los datos del caché
  useEffect(() => {
    if (isShowingAllFarms) {
      // Si es admin, mostrar todo el ganado
      if (isAdmin()) {
        setCattle(allCattleWithFarmInfo || []);
      } 
      // Si no es admin pero tiene granjas, filtrar ganado solo de sus granjas
      else if (userHasFarms && allCattleWithFarmInfo) {
        const userFarmIds = userFarms?.map(farm => farm._id || farm.id_finca) || [];
        
        const filteredCattle = allCattleWithFarmInfo.filter(cattle => {
          // Intentar obtener el ID de la granja del ganado de diferentes formas
          const cattleFarmId = cattle.farmId || 
                              cattle.finca?.nombre; // Usar nombre como identificador
          
          return cattleFarmId && userFarmIds.includes(cattleFarmId.toString());
        });
        
        setCattle(filteredCattle);
      }
      // Si no es admin y no tiene granjas, no mostrar ganado
      else {
        setCattle([]);
      }
    } else {
      // Verificar si los datos están en formato incorrecto
      if (farmCattle && typeof farmCattle === 'object' && !Array.isArray(farmCattle)) {
        console.log('¡Datos en formato incorrecto detectados! Limpiando caché...');
        clearCorruptedCache();
        return;
      }
      
      setCattle(farmCattle || []);
    }
  }, [allCattleWithFarmInfo, farmCattle, isShowingAllFarms, selectedFarmId]); // Reducir dependencias

  // Efecto separado para manejar cambios en la granja seleccionada
  useEffect(() => {
    // Solo log cuando realmente cambia la granja seleccionada
    if (selectedFarmId) {
      console.log('Granja seleccionada:', selectedFarmId);
    }
  }, [selectedFarmId]); // Solo log, sin refresh automático

  // Manejar errores
  useEffect(() => {
    if (dataError) {
      setError(dataError);
      console.error('Error en explore:', dataError);
      // Limpiar error después de 3 segundos
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    } else {
      setError(null);
    }
  }, [dataError]);

  const onRefresh = async () => {
    console.log('Refrescando manualmente...');
    try {
      // Invalidar caché antes de refrescar para obtener datos frescos del servidor
      await invalidateCache('farms');
      await invalidateCache('cattle');
      
      if (isShowingAllFarms) {
        const promises = [refreshFarms()];
        // Solo refrescar todo el ganado si es admin
        if (isAdmin()) {
          promises.push(refreshAllCattle());
        }
        await Promise.all(promises);
      } else {
        await refreshFarmCattle();
      }
      
      console.log('Datos de explore refrescados desde el servidor');
    } catch (error) {
      console.error('Error al refrescar datos:', error);
    }
  };

  const navigateToDetail = (id: string) => {
    router.push(`/cattle-details?id=${id}`);
  };

  const navigateToAdd = () => {
    // Verificar límite de ganado para usuarios no premium
    const isPremium = userInfo?.id_premium === 2 || userInfo?.id_premium === 3; // 2 = Premium, 3 = Empleado
    
    if (!isPremium && cattle.length >= 2) {
      setShowPremiumModal(true);
      return;
    }
    
    router.push('/(tabs)/add-cattle');
  };

  const renderCattleItem = ({ item }: { item: CattleItem }) => {
    // Función auxiliar para obtener el color del estado de salud
    const getStatusColor = (status: number) => {
      switch (status) {
        case 1: return tw.colors.success; // Saludable
        case 2: return tw.colors.warning; // En tratamiento
        case 3: return tw.colors.error; // Enfermo
        case 4: return tw.colors.secondary; // Muerto
        default: return '#bdc3c7';
      }
    };

    // Función auxiliar para formatear el estado de salud
    const formatStatus = (status: number) => {
      switch (status) {
        case 1: return 'Saludable';
        case 2: return 'En tratamiento';
        case 3: return 'Enfermo';
        case 4: return 'Muerto';
        default: return 'Desconocido';
      }
    };

    const formatProduccion = (id_produccion: number) => {
      switch (id_produccion) {
        case 1: return 'Leche';
        case 2: return 'Carne';
        case 3: return 'Mixto';
        default: return 'No especificado';
      }
    };

    const formatGenero = (id_genero: number) => {
      switch (id_genero) {
        case 1: return 'Macho';
        case 2: return 'Hembra';
        default: return 'No especificado';
      }
    };

    const cattleId = item.id_ganado || item._id;
    const cattleName = item.nombre || `Ganado ${item.numero_identificacion || item.identificationNumber || cattleId}`;
    const farmName = item.finca?.nombre || item.farmName || 'Granja no especificada';
    const notes = item.nota || item.notes;

    return (
      <TouchableOpacity 
        style={styles.cattleItem} 
        onPress={() => navigateToDetail(cattleId?.toString() || '')}
      >
        <View style={styles.cattleHeader}>
          <Text style={styles.cattleName}>{cattleName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.id_estado_salud || 0) }]}>
            <Text style={styles.statusText}>
              {item.estado_salud?.descripcion || formatStatus(item.id_estado_salud || 0)}
            </Text>
          </View>
        </View>
        
        <View style={styles.cattleDetails}>
          <Text style={styles.detailText}>
            ID: {item.numero_identificacion || item.identificationNumber || 'No especificado'}
          </Text>
          <Text style={styles.detailText}>
            Género: {item.genero?.descripcion || formatGenero(item.id_genero || 0)}
          </Text>
          <Text style={styles.detailText}>
            Producción: {item.produccion?.descripcion || formatProduccion(item.id_produccion || 0)}
          </Text>
          {isShowingAllFarms && (
            <Text style={styles.detailText}>Granja: {farmName}</Text>
          )}
        </View>
        
        {notes && (
          <Text style={styles.notesText}>Notas: {notes}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const getSubtitle = () => {
    if (loading) return 'Cargando...';
    
    if (isShowingAllFarms) {
      if (isAdmin()) {
        const totalFarms = allFarms?.length || 0;
        const totalCattle = cattle.length;
        return `${totalCattle} animales en ${totalFarms} granjas`;
      } else if (userHasFarms) {
        const userFarmCount = userFarms?.length || 0;
        const totalCattle = cattle.length;
        return `${totalCattle} animales en ${userFarmCount} granjas asignadas`;
      } else {
        return 'No tienes granjas asignadas. Contacta al administrador.';
      }
    } else {
      const farmName = selectedFarm?.name || 'Granja seleccionada';
      const cattleCount = cattle.length;
      return `${cattleCount} animales en ${farmName}`;
    }
  };

  // Determinar si mostrar el botón de agregar ganado
  const canAddCattle = isAdmin() || (userHasFarms && (!isShowingAllFarms || selectedFarmId));

  // Determinar el mensaje cuando no hay ganado
  const getEmptyMessage = () => {
    if (isShowingAllFarms) {
      if (isAdmin()) {
        return 'No hay ganado registrado en el sistema';
      } else if (!userHasFarms) {
        return 'No tienes granjas asignadas.\nContacta al administrador para obtener acceso a las granjas.';
      } else {
        return 'No hay ganado registrado en tus granjas';
      }
    } else {
      return `No hay ganado registrado en ${selectedFarm?.name || 'esta granja'}`;
    }
  };

  if (loading && cattle.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tw.colors.primary} />
        <Text style={styles.loadingText}>Cargando ganado...</Text>
      </View>
    );
  }

  return (
      <View style={styles.container}>
        <View style={styles.header}>
        <Text style={styles.title}>Ganado</Text>
        <Text style={styles.subtitle}>{getSubtitle()}</Text>
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        </View>

      <FlatList
        data={cattle}
        renderItem={renderCattleItem}
        keyExtractor={(item) => (item.id_ganado || item._id)?.toString() || Math.random().toString()}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={[tw.colors.primary]}
          />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{getEmptyMessage()}</Text>
            {canAddCattle && (
              <TouchableOpacity style={styles.addButton} onPress={navigateToAdd}>
                <Text style={styles.addButtonText}>Agregar Ganado</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {canAddCattle && (
        <TouchableOpacity style={styles.fab} onPress={navigateToAdd}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      {/* Modal de Premium */}
      <PremiumUpgradeModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        title="¡Actualiza tu cuenta a Premium!"
        subtitle="Los usuarios no premium solo pueden tener máximo 2 animales. Actualiza a premium para agregar ganado ilimitado."
      />
    </View>
  );
}
