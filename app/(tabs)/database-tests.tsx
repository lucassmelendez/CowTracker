import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import testService from '../../lib/services/testService';
import { TestSuite, TestResult, TestReport } from '../../lib/types/tests';

const { width } = Dimensions.get('window');

export default function DatabaseTestsScreen() {
  const router = useRouter();
  const [testSuite, setTestSuite] = useState<TestSuite | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [testHistory, setTestHistory] = useState<TestReport[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);

  useEffect(() => {
    loadTestHistory();
  }, []);

  const loadTestHistory = () => {
    const history = testService.getTestHistory();
    setTestHistory(history);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setShowResults(false);
    setCurrentTest('Iniciando pruebas...');
    
    try {
      const suite = await testService.runTestSuite();
      setTestSuite(suite);
      setShowResults(true);
      loadTestHistory();
      
      Alert.alert(
        '¡Pruebas Completadas!',
        `Se ejecutaron ${suite.results.length} pruebas con una tasa de éxito del ${suite.successRate.toFixed(1)}%`,
        [{ text: 'Ver Resultados', onPress: () => setShowResults(true) }]
      );
    } catch (error) {
      console.error('Error ejecutando pruebas:', error);
      Alert.alert('Error', 'Ocurrió un error al ejecutar las pruebas');
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 4) return '#27ae60';
    if (score >= 3) return '#f39c12';
    if (score >= 2) return '#e67e22';
    return '#e74c3c';
  };

  const getScoreText = (score: number): string => {
    if (score >= 4) return 'Excelente';
    if (score >= 3) return 'Bueno';
    if (score >= 2) return 'Regular';
    return 'Necesita Mejoras';
  };

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'concurrency': return 'people-outline';
      case 'performance': return 'speedometer-outline';
      case 'integrity': return 'shield-checkmark-outline';
      case 'backup': return 'save-outline';
      case 'stress': return 'warning-outline';
      default: return 'cog-outline';
    }
  };

  const showTestDetail = (test: TestResult) => {
    setSelectedTest(test);
    setShowDetailModal(true);
  };

  const renderTestCard = (test: TestResult, index: number) => {
    const testDef = testSuite?.tests.find(t => t.id === test.id);
    
    return (
      <TouchableOpacity
        key={test.id}
        style={[styles.testCard, test.success ? styles.successCard : styles.failCard]}
        onPress={() => showTestDetail(test)}
      >
        <View style={styles.testHeader}>
          <View style={styles.testInfo}>
            <Ionicons 
              name={getCategoryIcon(testDef?.category || 'default')} 
              size={20} 
              color={test.success ? '#27ae60' : '#e74c3c'} 
            />
            <Text style={styles.testNumber}>P{index + 1}</Text>
            <Text style={styles.testName}>{testDef?.name || test.id}</Text>
          </View>
          <View style={styles.testStatus}>
            <Ionicons 
              name={test.success ? 'checkmark-circle' : 'close-circle'} 
              size={24} 
              color={test.success ? '#27ae60' : '#e74c3c'} 
            />
          </View>
        </View>
        
        <Text style={styles.testDescription} numberOfLines={2}>
          {testDef?.description || 'Descripción no disponible'}
        </Text>
        
        <View style={styles.testMetrics}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Tiempo</Text>
            <Text style={styles.metricValue}>{test.executionTime}ms</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Estado</Text>
            <Text style={[styles.metricValue, { color: test.success ? '#27ae60' : '#e74c3c' }]}>
              {test.success ? 'Exitoso' : 'Fallido'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderScoreCard = (title: string, score: number, description: string) => (
    <View style={styles.scoreCard}>
      <Text style={styles.scoreTitle}>{title}</Text>
      <View style={styles.scoreCircle}>
        <Text style={[styles.scoreNumber, { color: getScoreColor(score) }]}>
          {score}
        </Text>
      </View>
      <Text style={[styles.scoreText, { color: getScoreColor(score) }]}>
        {getScoreText(score)}
      </Text>
      <Text style={styles.scoreDescription}>{description}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pruebas de Base de Datos</Text>
        <Text style={styles.subtitle}>
          Sistema de evaluación de rendimiento y confiabilidad
        </Text>
      </View>

      {/* Control Panel */}
      <View style={styles.controlPanel}>
        <TouchableOpacity
          style={[styles.runButton, isRunning && styles.disabledButton]}
          onPress={runAllTests}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.buttonText}>Ejecutando...</Text>
            </>
          ) : (
            <>
              <Ionicons name="play-circle" size={24} color="white" />
              <Text style={styles.buttonText}>Ejecutar Todas las Pruebas</Text>
            </>
          )}
        </TouchableOpacity>

        {isRunning && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{currentTest}</Text>
            <ActivityIndicator size="large" color="#3498db" />
          </View>
        )}
      </View>

      {/* Results Section */}
      {showResults && testSuite && (
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Resultados de las Pruebas</Text>
          
          {/* Overall Metrics */}
          <View style={styles.metricsContainer}>
            <View style={styles.overallMetric}>
              <Text style={styles.metricBigNumber}>
                {testSuite.successRate.toFixed(1)}%
              </Text>
              <Text style={styles.metricBigLabel}>Tasa de Éxito</Text>
            </View>
            
            <View style={styles.overallMetric}>
              <Text style={styles.metricBigNumber}>
                {testSuite.results.filter(r => r.success).length}/{testSuite.results.length}
              </Text>
              <Text style={styles.metricBigLabel}>Pruebas Exitosas</Text>
            </View>
            
            <View style={styles.overallMetric}>
              <Text style={styles.metricBigNumber}>
                {(testSuite.executionTime / 1000).toFixed(1)}s
              </Text>
              <Text style={styles.metricBigLabel}>Tiempo Total</Text>
            </View>
          </View>

          {/* Score Cards */}
          <View style={styles.scoresContainer}>
            {renderScoreCard('Desempeño', testSuite.overallScore.D, 'Velocidad de ejecución')}
            {renderScoreCard('Integridad', testSuite.overallScore.I, 'Consistencia de datos')}
            {renderScoreCard('Carga del Sistema', testSuite.overallScore.CS, 'Rendimiento bajo carga')}
            {renderScoreCard('Tolerancia a Fallos', testSuite.overallScore.TF, 'Recuperación de errores')}
          </View>

          {/* Test Results */}
          <Text style={styles.sectionTitle}>Detalle de Pruebas</Text>
          <View style={styles.testsContainer}>
            {testSuite.results.map((test, index) => renderTestCard(test, index))}
          </View>
        </View>
      )}

      {/* Test History */}
      {testHistory.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Historial de Pruebas</Text>
          {testHistory.slice(-3).map((report, index) => (
            <View key={report.suiteId} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyDate}>
                  {new Date(report.timestamp).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
                <Text style={styles.historyRate}>
                  {report.successRate.toFixed(1)}% éxito
                </Text>
              </View>
              <Text style={styles.historyTests}>
                {report.passedTests}/{report.totalTests} pruebas exitosas
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Test Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedTest && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Detalle de Prueba</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowDetailModal(false)}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.statusBadge}>
                    <Ionicons 
                      name={selectedTest.success ? 'checkmark-circle' : 'close-circle'} 
                      size={24} 
                      color={selectedTest.success ? '#27ae60' : '#e74c3c'} 
                    />
                    <Text style={[styles.statusText, { 
                      color: selectedTest.success ? '#27ae60' : '#e74c3c' 
                    }]}>
                      {selectedTest.success ? 'Exitoso' : 'Fallido'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>ID de Prueba:</Text>
                    <Text style={styles.detailValue}>{selectedTest.id}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tiempo de Ejecución:</Text>
                    <Text style={styles.detailValue}>{selectedTest.executionTime}ms</Text>
                  </View>

                  {selectedTest.errorMessage && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorLabel}>Error:</Text>
                      <Text style={styles.errorMessage}>{selectedTest.errorMessage}</Text>
                    </View>
                  )}

                  {selectedTest.details && (
                    <View style={styles.detailsContainer}>
                      <Text style={styles.detailLabel}>Detalles:</Text>
                      <Text style={styles.detailsText}>
                        {JSON.stringify(selectedTest.details, null, 2)}
                      </Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  controlPanel: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  runButton: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  progressText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '500',
  },
  resultsSection: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  overallMetric: {
    alignItems: 'center',
  },
  metricBigNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3498db',
  },
  metricBigLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  scoresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  scoreCard: {
    backgroundColor: 'white',
    width: (width - 60) / 2,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  scoreTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  scoreCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  scoreDescription: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  testsContainer: {
    gap: 10,
  },
  testCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  successCard: {
    borderLeftColor: '#27ae60',
  },
  failCard: {
    borderLeftColor: '#e74c3c',
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  testInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  testNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3498db',
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  testName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  testStatus: {
    marginLeft: 10,
  },
  testDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 10,
    lineHeight: 16,
  },
  testMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: '#7f8c8d',
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  historySection: {
    margin: 20,
  },
  historyCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  historyDate: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
  },
  historyRate: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '600',
  },
  historyTests: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: width * 0.9,
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    gap: 15,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#fdf2f2',
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  errorLabel: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
    marginBottom: 5,
  },
  errorMessage: {
    fontSize: 12,
    color: '#c0392b',
    lineHeight: 16,
  },
  detailsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 10,
  },
  detailsText: {
    fontSize: 10,
    color: '#2c3e50',
    fontFamily: 'monospace',
    lineHeight: 14,
  },
}); 