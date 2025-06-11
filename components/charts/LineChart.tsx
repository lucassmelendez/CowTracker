import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface LineChartProps {
  data: Record<string, number>;
  title: string;
  color?: string;
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({ 
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

  // Calcular puntos de la línea
  const points = values.map((value, index) => {
    const x = padding + (index * (chartWidth - 2 * padding)) / (values.length - 1);
    const y = padding + ((maxValue - value) / valueRange) * (chartHeight - 2 * padding);
    return { x, y, value };
  });

  // Crear el path de la línea
  const pathData = points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
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
          
          {/* Línea principal */}
          <Path
            d={pathData}
            stroke={color}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Puntos en la línea */}
          {points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={color}
              stroke="#fff"
              strokeWidth="2"
            />
          ))}
          
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
        </Svg>
      </View>
      
      {/* Leyenda con valores */}
      <View style={styles.legend}>
        {labels.map((label, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: color }]} />
            <Text style={styles.legendText}>
              {label}: {values[index]}
            </Text>
          </View>
        ))}
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
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
}); 