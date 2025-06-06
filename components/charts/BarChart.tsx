import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart as RNBarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface BarChartProps {
  data: { [key: string]: number };
  title: string;
  color?: string;
  yAxisSuffix?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  title, 
  color = '#36A2EB',
  yAxisSuffix = ''
}) => {
  const labels = Object.keys(data);
  const values = Object.values(data);
  const maxValue = Math.max(...values);

  if (values.length === 0 || maxValue === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No hay datos disponibles</Text>
        </View>
      </View>
    );
  }

  const chartData = {
    labels: labels.map(label => 
      label.length > 8 ? label.substring(0, 8) + '...' : label
    ),
    datasets: [
      {
        data: values,
        color: (opacity = 1) => color,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <RNBarChart
        data={chartData}
        width={width - 60}
        height={220}
        yAxisLabel=""
        yAxisSuffix={yAxisSuffix}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => color,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: color,
          },
        }}
        style={styles.chart}
        verticalLabelRotation={30}
        showValuesOnTopOfBars={true}
      />
      
      {/* Estadísticas adicionales */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Máximo</Text>
            <Text style={styles.statValue}>{maxValue}{yAxisSuffix}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>
              {values.reduce((sum, val) => sum + val, 0)}{yAxisSuffix}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Promedio</Text>
            <Text style={styles.statValue}>
              {(values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1)}{yAxisSuffix}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#777',
    fontStyle: 'italic',
  },
  statsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
}); 