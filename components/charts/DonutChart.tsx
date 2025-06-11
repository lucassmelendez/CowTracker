import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface DonutChartProps {
  data: Record<string, number>;
  title: string;
  colors?: string[];
  size?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ 
  data, 
  title, 
  colors = ['#3498db', '#e74c3c', '#f39c12', '#27ae60', '#9b59b6'],
  size = 200 
}) => {
  const values = Object.values(data);
  const labels = Object.keys(data);
  const total = values.reduce((sum, value) => sum + value, 0);
  
  if (total === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No hay datos disponibles</Text>
        </View>
      </View>
    );
  }

  const radius = size / 2 - 20;
  const innerRadius = radius * 0.6; // Para crear el efecto de dona
  const centerX = size / 2;
  const centerY = size / 2;

  let currentAngle = -90; // Empezar desde arriba

  const segments = values.map((value, index) => {
    const percentage = (value / total) * 100;
    const angle = (value / total) * 360;
    
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    // Convertir ángulos a radianes
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    // Calcular puntos del arco exterior
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    // Calcular puntos del arco interior
    const x3 = centerX + innerRadius * Math.cos(endAngleRad);
    const y3 = centerY + innerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(startAngleRad);
    const y4 = centerY + innerRadius * Math.sin(startAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');
    
    currentAngle += angle;
    
    return {
      path: pathData,
      color: colors[index % colors.length],
      label: labels[index],
      value,
      percentage: percentage.toFixed(1)
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          {segments.map((segment, index) => (
            <Path
              key={index}
              d={segment.path}
              fill={segment.color}
              stroke="#fff"
              strokeWidth="2"
            />
          ))}
          
          {/* Texto central con total */}
          <SvgText
            x={centerX}
            y={centerY - 5}
            fontSize="18"
            fontWeight="bold"
            fill="#333"
            textAnchor="middle"
          >
            {total}
          </SvgText>
          <SvgText
            x={centerX}
            y={centerY + 15}
            fontSize="12"
            fill="#666"
            textAnchor="middle"
          >
            Total
          </SvgText>
        </Svg>
      </View>
      
      {/* Leyenda */}
      <View style={styles.legend}>
        {segments.map((segment, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: segment.color }]} />
            <Text style={styles.legendText}>
              {segment.label}: {segment.value} ({segment.percentage}%)
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
    flexDirection: 'column',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
}); 