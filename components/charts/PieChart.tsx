import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart as RNPieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface PieChartData {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

interface PieChartProps {
  data: { [key: string]: number };
  title: string;
  colors?: string[];
}

const defaultColors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
  '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
];

export const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  title, 
  colors = defaultColors 
}) => {
  const chartData: PieChartData[] = Object.entries(data).map(([key, value], index) => ({
    name: key,
    population: value,
    color: colors[index % colors.length],
    legendFontColor: '#333',
    legendFontSize: 12,
  }));

  const total = Object.values(data).reduce((sum, value) => sum + value, 0);

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <RNPieChart
        data={chartData}
        width={width - 60}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        center={[10, 10]}
        absolute
      />
      
      {/* Estadísticas adicionales */}
      <View style={styles.statsContainer}>
        <Text style={styles.totalText}>Total: {total}</Text>
        <View style={styles.percentagesContainer}>
          {Object.entries(data).map(([key, value], index) => (
            <View key={key} style={styles.percentageItem}>
              <View 
                style={[
                  styles.colorIndicator, 
                  { backgroundColor: colors[index % colors.length] }
                ]} 
              />
              <Text style={styles.percentageText}>
                {key}: {((value / total) * 100).toFixed(1)}%
              </Text>
            </View>
          ))}
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
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  percentagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  percentageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
    marginVertical: 2,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  percentageText: {
    fontSize: 12,
    color: '#555',
  },
});