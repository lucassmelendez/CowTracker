import React, { useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../components/AuthContext';

interface UseUserRefreshOptions {
  intervalMs?: number; // Intervalo en milisegundos para refrescar
  enableAutoRefresh?: boolean; // Si debe refrescar automáticamente
}

export const useUserRefresh = (options: UseUserRefreshOptions = {}) => {
  const { 
    intervalMs = 30000, // 30 segundos por defecto
    enableAutoRefresh = true 
  } = options;
  
  const { refreshUserInfo, userInfo } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(0);
  const REFRESH_COOLDOWN = 5000; // 5 segundos de cooldown mínimo

  // Función para refrescar con cooldown
  const refreshWithCooldown = async () => {
    const now = Date.now();
    
    // Solo refrescar si ha pasado suficiente tiempo desde el último refresh
    if (now - lastRefreshRef.current < REFRESH_COOLDOWN) {
      console.log('🔄 Saltando refresh de usuario (cooldown activo)');
      return;
    }
    
    console.log('🔄 Refrescando información del usuario en explore...');
    lastRefreshRef.current = now;
    
    try {
      await refreshUserInfo();
    } catch (error) {
      console.error('❌ Error al refrescar información del usuario:', error);
    }
  };

  // Refrescar cuando la pantalla obtiene foco
  useFocusEffect(
    React.useCallback(() => {
      if (enableAutoRefresh && userInfo) {
        refreshWithCooldown();
      }
    }, [enableAutoRefresh, userInfo?.uid])
  );

  // Refrescar periódicamente cuando la aplicación está activa
  useEffect(() => {
    if (!enableAutoRefresh || !userInfo) {
      return;
    }

    // Limpiar intervalo anterior si existe
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Crear nuevo intervalo
    intervalRef.current = setInterval(() => {
      refreshWithCooldown();
    }, intervalMs);

    // Cleanup al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enableAutoRefresh, userInfo?.uid, intervalMs]);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    refreshUserInfo: refreshWithCooldown
  };
}; 