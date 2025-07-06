import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  subtitle,
  trend
}) => {
  // Función para determinar el tamaño de fuente basado en la longitud del valor
  const getValueFontSize = (value: string | number): number => {
    const valueStr = value.toString();
    
    // Si el valor es muy largo, usar fuente más pequeña
    if (valueStr.length > 10) {
      return 20; // Fuente más pequeña para valores muy largos
    } else if (valueStr.length > 7) {
      return 24; // Fuente mediana para valores largos
    } else {
      return 28; // Fuente normal para valores cortos
    }
  };

  const displayValue = value.toString();
  const fontSize = getValueFontSize(displayValue);

  return (
    <View style={[styles.container, { borderLeftColor: color }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Ionicons name={icon as any} size={24} color="#ffffff" />
        </View>
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { fontSize }]} numberOfLines={1} adjustsFontSizeToFit>
            {displayValue}
          </Text>
          {trend && (
            <View style={styles.trendContainer}>
              <Ionicons 
                name={trend.isPositive ? 'trending-up' : 'trending-down'} 
                size={16} 
                color={trend.isPositive ? '#27ae60' : '#e74c3c'} 
              />
              <Text style={[
                styles.trendText, 
                { color: trend.isPositive ? '#27ae60' : '#e74c3c' }
              ]}>
                {Math.abs(trend.value)}%
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
      {subtitle && <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>}
      
      {/* Barra de progreso visual */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: color }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    minWidth: 160, // Aumentar el ancho mínimo
    maxWidth: 200, // Establecer un ancho máximo
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Cambiar a flex-start para mejor alineación
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0, // Evitar que se comprima
  },
  valueContainer: {
    alignItems: 'flex-end',
    flex: 1, // Tomar el espacio restante
    marginLeft: 8, // Espacio entre icono y valor
  },
  value: {
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'right',
    flexShrink: 1, // Permitir que se comprima si es necesario
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 12,
    color: '#777777',
    marginBottom: 8,
    textAlign: 'left',
    lineHeight: 16,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    width: '70%',
    borderRadius: 2,
  },
}); 