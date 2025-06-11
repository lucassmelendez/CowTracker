import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface AreaChartProps {
  data: Record<string, number>;
  title: string;
  color?: string;
  height?: number;
}

export const AreaChart: React.FC<AreaChartProps> = ({ 
  data, 
  title, 
  color = '#3498db',
  height = 200 
}) => {
  const chartWidth = width - 80;
  const chartHeight = height - 60;
  const padding = 40;

  const values = Object.values(data);
  const labels = Object.keys(data);
  
  if (values.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No hay datos disponibles</Text>
        </View>
      </View>
    );
  }

  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const valueRange = maxValue - minValue || 1;

  // Calcular puntos del área
  const points = values.map((value, index) => {
    const x = padding + (index * (chartWidth - 2 * padding)) / (values.length - 1);
    const y = padding + ((maxValue - value) / valueRange) * (chartHeight - 2 * padding);
    return { x, y, value };
  });

  // Crear el path del área
  const areaPath = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');

  // Completar el área hasta la base
  const baseY = chartHeight - padding;
  const completePath = `${areaPath} L ${points[points.length - 1].x} ${baseY} L ${points[0].x} ${baseY} Z`;

  // Crear el path de la línea superior
  const linePath = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');

  // Función para obtener color más claro para el gradiente
  const lightenColor = (color: string, amount: number) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
    const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
    const newB = Math.min(255, Math.floor(b + (255 - b) * amount));
    
    return `rgb(${newR}, ${newG}, ${newB})`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={color} stopOpacity="0.1" />
            </LinearGradient>
          </Defs>
          
          {/* Líneas de cuadrícula horizontales */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = padding + ratio * (chartHeight - 2 * padding);
            return (
              <Line
                key={index}
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="#e0e0e0"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Área rellena */}
          <Path
            d={completePath}
            fill="url(#areaGradient)"
          />
          
          {/* Línea superior */}
          <Path
            d={linePath}
            stroke={color}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Etiquetas del eje X */}
          {labels.map((label, index) => {
            const x = padding + (index * (chartWidth - 2 * padding)) / (values.length - 1);
            return (
              <SvgText
                key={index}
                x={x}
                y={chartHeight - 10}
                fontSize="12"
                fill="#666"
                textAnchor="middle"
              >
                {label.length > 8 ? label.substring(0, 8) + '...' : label}
              </SvgText>
            );
          })}
          
          {/* Etiquetas del eje Y */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = padding + ratio * (chartHeight - 2 * padding);
            const value = Math.round(maxValue - (ratio * valueRange));
            return (
              <SvgText
                key={index}
                x={padding - 10}
                y={y + 4}
                fontSize="10"
                fill="#666"
                textAnchor="end"
              >
                {value}
              </SvgText>
            );
          })}
        </Svg>
      </View>
      
      {/* Estadísticas */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Máximo</Text>
          <Text style={styles.statValue}>{maxValue}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Mínimo</Text>
          <Text style={styles.statValue}>{minValue}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Promedio</Text>
          <Text style={styles.statValue}>{Math.round(values.reduce((a, b) => a + b, 0) / values.length)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  noDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
}); 