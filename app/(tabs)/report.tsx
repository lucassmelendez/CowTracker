import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  Platform,
  Share,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  useUserFarms, 
  useAllCattle, 
  useAllCattleWithFarmInfo,
  useFarmCattle,
  useReportData
} from '../../hooks/useCachedData';
import { useFarm } from '../../components/FarmContext';
import { useUserRefresh } from '../../hooks/useUserRefresh';
import api from '../../lib/services/api';
import { ReportGenerator } from '../../lib/utils/reportGenerator';
import { ReportData, CattleDetail } from '../../lib/types';
import { useCustomModal } from '../../components/CustomModal';
import { PieChart, BarChart, StatCard } from '../../components/charts';

const { width } = Dimensions.get('window');

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const reportTypes: ReportType[] = [
  {
    id: 'general',
    name: 'General',
    description: 'Resumen completo',
    icon: 'analytics-outline',
    color: '#3498db'
  },
  {
    id: 'cattle',
    name: 'Ganado',
    description: 'Detalles del ganado',
    icon: 'list-outline',
    color: '#e67e22'
  },
  {
    id: 'health',
    name: 'Salud',
    description: 'Estado sanitario',
    icon: 'medical-outline',
    color: '#e74c3c'
  },
  {
    id: 'farms',
    name: 'Granjas',
    description: 'Info de granjas',
    icon: 'leaf-outline',
    color: '#27ae60'
  }
];

export default function ReportPage() {
  const [selectedReportType, setSelectedReportType] = useState<string>('general');
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string>('');
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [showCharts, setShowCharts] = useState(true);
  
  // Hook para modales personalizados
  const { showSuccess, showError, ModalComponent } = useCustomModal();
  
  // Hook para refrescar automáticamente la información del usuario
  useUserRefresh({
    intervalMs: 60000, // Refrescar cada minuto para reportes
    enableAutoRefresh: true
  });

  // Usar el contexto de granja del header
  const { selectedFarm } = useFarm();
  
  // Hooks para obtener datos base
  const { data: farms, loading: farmsLoading } = useUserFarms();
  const { data: allCattle, loading: cattleLoading } = useAllCattleWithFarmInfo();
  const { data: farmCattle, loading: farmCattleLoading, refresh: refreshFarmCattle } = useFarmCattle(selectedFarm?._id || null);

  // Hook para caché de informes
  const {
    reportData,
    cattleDetails,
    loading: reportLoading,
    loadFromCache,
    saveToCache,
    invalidateCache,
    isDataFresh,
    setReportData,
    setCattleDetails,
    setLoading: setReportLoading,
    setError: setReportError
  } = useReportData(selectedFarm?._id || null);

  useEffect(() => {
    const loadReportData = async () => {
      const cacheLoaded = await loadFromCache();
      
      if (cacheLoaded && isDataFresh()) {
        return;
      }
      
      await generateReportData();
    };

    if (farms && allCattle) {
      if (selectedFarm && farmCattleLoading) {
        return;
      }
      loadReportData();
    }
  }, [farms, allCattle, farmCattle, selectedFarm, farmCattleLoading]);

  useEffect(() => {
    if (selectedFarm?._id) {
      refreshFarmCattle();
    }
  }, [selectedFarm?._id]);

  const generateReportData = async () => {
    if (!farms || !allCattle) return;

    setReportLoading(true);
    try {
      let cattleData;
      if (selectedFarm) {
        cattleData = farmCattle || [];
      } else {
        cattleData = allCattle;
      }
      
      const data: ReportData = {
        totalCattle: cattleData.length,
        totalFarms: selectedFarm ? 1 : farms.length,
        cattleByHealth: {},
        cattleByGender: {},
        cattleByBreed: {},
        medicalRecordsCount: 0
      };

      const details: CattleDetail[] = cattleData.map(cattle => ({
        id: cattle.id_ganado?.toString() || cattle._id || '',
        name: cattle.nombre || cattle.name || 'Sin nombre',
        identifier: cattle.numero_identificacion || cattle.identificationNumber || 'Sin ID',
        breed: '',
        gender: cattle.genero?.descripcion || cattle.gender || 'No especificado',
        health: cattle.estado_salud?.descripcion || cattle.healthStatus || 'No especificado',
        farmName: cattle.finca?.nombre || cattle.farmName || 'Sin granja',
        notes: cattle.nota || cattle.notes || ''
      }));

      cattleData.forEach(cattle => {
        const health = cattle.estado_salud?.descripcion || cattle.healthStatus || 'No especificado';
        data.cattleByHealth[health] = (data.cattleByHealth[health] || 0) + 1;
      });

      cattleData.forEach(cattle => {
        const gender = cattle.genero?.descripcion || cattle.gender || 'No especificado';
        data.cattleByGender[gender] = (data.cattleByGender[gender] || 0) + 1;
      });

      let totalMedicalRecords = 0;
      for (const cattle of cattleData) {
        try {
          if (cattle.id_ganado || cattle._id) {
            const records = await api.cattle.getMedicalRecords(cattle.id_ganado || cattle._id!);
            totalMedicalRecords += records.length;
          }
        } catch (error) {
          console.log('Error obteniendo registros médicos:', error);
        }
      }
      data.medicalRecordsCount = totalMedicalRecords;

      setReportData(data);
      setCattleDetails(details);
      
      const farmName = selectedFarm ? selectedFarm.name : 'Todas las granjas';
      await saveToCache(data, details, farmName);
      
    } catch (error) {
      console.error('Error generando datos del informe:', error);
      setReportError('No se pudieron generar los datos del informe');
      showError('Error', 'No se pudieron generar los datos del informe');
    } finally {
      setReportLoading(false);
    }
  };

  const refreshReportData = async () => {
    await invalidateCache();
    await generateReportData();
  };

  const generateReport = () => {
    if (!reportData) {
      showError('Error', 'No hay datos disponibles para generar el informe');
      return;
    }

    let report = '';
    const currentDate = new Date().toLocaleDateString('es-ES');
    const selectedFarmName = selectedFarm ? selectedFarm.name : 'Todas las granjas';

    switch (selectedReportType) {
      case 'general':
        report = generateGeneralReport(reportData, currentDate, selectedFarmName);
        break;
      case 'cattle':
        report = generateCattleReport(reportData, currentDate, selectedFarmName);
        break;
      case 'health':
        report = generateHealthReport(reportData, currentDate, selectedFarmName);
        break;
      case 'farms':
        report = generateFarmsReport(reportData, currentDate, selectedFarmName);
        break;
      default:
        report = generateGeneralReport(reportData, currentDate, selectedFarmName);
    }

    setGeneratedReport(report);
    setReportModalVisible(true);
  };

  const generateGeneralReport = (data: ReportData, date: string, farmName: string): string => {
    return `
INFORME GENERAL DE GANADO
========================
Fecha: ${date}
Alcance: ${farmName}

RESUMEN EJECUTIVO
-----------------
• Total de granjas: ${data.totalFarms}
• Total de ganado: ${data.totalCattle}
• Registros médicos totales: ${data.medicalRecordsCount}

DISTRIBUCIÓN POR ESTADO DE SALUD
--------------------------------
${Object.entries(data.cattleByHealth).map(([health, count]) => 
  `• ${health}: ${count} animales`).join('\n')}

DISTRIBUCIÓN POR GÉNERO
-----------------------
${Object.entries(data.cattleByGender).map(([gender, count]) => 
  `• ${gender}: ${count} animales`).join('\n')}



---
Informe generado por CowTracker
${date}
    `.trim();
  };

  const generateCattleReport = (data: ReportData, date: string, farmName: string): string => {
    return `
INFORME DETALLADO DE GANADO
===========================
Fecha: ${date}
Alcance: ${farmName}

ESTADÍSTICAS GENERALES
----------------------
• Total de animales: ${data.totalCattle}

DESGLOSE POR GÉNERO
-------------------
${Object.entries(data.cattleByGender).map(([gender, count]) => 
  `• ${gender}: ${count} animales (${((count/data.totalCattle)*100).toFixed(1)}%)`).join('\n')}

---
Informe generado por CowTracker
${date}
    `.trim();
  };

  const generateHealthReport = (data: ReportData, date: string, farmName: string): string => {
    return `
INFORME DE SALUD DEL GANADO
===========================
Fecha: ${date}
Alcance: ${farmName}

RESUMEN DE SALUD
----------------
• Total de animales evaluados: ${data.totalCattle}
• Total de registros médicos: ${data.medicalRecordsCount}
• Promedio de registros por animal: ${data.totalCattle > 0 ? (data.medicalRecordsCount/data.totalCattle).toFixed(1) : 0}

ESTADO DE SALUD ACTUAL
----------------------
${Object.entries(data.cattleByHealth).map(([health, count]) => 
  `• ${health}: ${count} animales (${((count/data.totalCattle)*100).toFixed(1)}%)`).join('\n')}

ANÁLISIS DE SALUD
-----------------
${Object.entries(data.cattleByHealth).length > 0 ? 
  `• Estado más común: ${Object.entries(data.cattleByHealth).sort((a, b) => b[1] - a[1])[0][0]}
• Animales que requieren atención: ${data.cattleByHealth['Enfermo'] || 0}
• Animales en tratamiento: ${data.cattleByHealth['En tratamiento'] || 0}` : 
  '• No hay datos de salud disponibles'}

RECOMENDACIONES
---------------
• Mantener registros médicos actualizados
• Realizar chequeos regulares del ganado
• Seguir protocolos de vacunación
• Monitorear animales con problemas de salud

---
Informe generado por CowTracker
${date}
    `.trim();
  };

  const generateFarmsReport = (data: ReportData, date: string, farmName: string): string => {
    return `
INFORME DE GRANJAS
==================
Fecha: ${date}
Alcance: ${farmName}

RESUMEN DE GRANJAS
------------------
• Total de granjas: ${data.totalFarms}
• Total de ganado: ${data.totalCattle}

DISTRIBUCIÓN POR ESTADO DE SALUD
--------------------------------
${Object.entries(data.cattleByHealth).map(([health, count]) => 
  `• ${health}: ${count} animales (${((count/data.totalCattle)*100).toFixed(1)}%)`).join('\n')}

DISTRIBUCIÓN POR GÉNERO
-----------------------
${Object.entries(data.cattleByGender).map(([gender, count]) => 
  `• ${gender}: ${count} animales (${((count/data.totalCattle)*100).toFixed(1)}%)`).join('\n')}

RECOMENDACIONES
---------------
• Optimizar el uso de recursos por granja
• Mantener registros actualizados del ganado
• Monitorear la salud del ganado regularmente

---
Informe generado por CowTracker
${date}
    `.trim();
  };

  const shareReport = async () => {
    try {
      await Share.share({
        message: generatedReport,
        title: 'Informe CowTracker'
      });
    } catch (error) {
      console.error('Error compartiendo informe:', error);
    }
  };

  const handleExportHTML = async () => {
    if (!reportData) return;
    
    setExportModalVisible(false);
    const selectedFarmName = selectedFarm ? selectedFarm.name : 'Todas las granjas';
    
    // Crear funciones wrapper que coincidan con la signatura esperada
    const successCallback = (message: string) => {
      showSuccess('Éxito', message);
    };
    
    const errorCallback = (message: string) => {
      showError('Error', message);
    };
    
    await ReportGenerator.exportToHTML(
      reportData, 
      selectedReportType, 
      selectedFarmName,
      selectedReportType === 'cattle' ? cattleDetails : undefined,
      { 
        showSuccess: successCallback,
        showError: errorCallback
      }
    );
  };

  const handleExportCSV = async () => {
    if (!reportData) return;
    
    setExportModalVisible(false);
    
    // Crear funciones wrapper que coincidan con la signatura esperada
    const successCallback = (message: string) => {
      showSuccess('Éxito', message);
    };
    
    const errorCallback = (message: string) => {
      showError('Error', message);
    };
    
    await ReportGenerator.exportToCSV(
      reportData, 
      selectedReportType,
      { 
        showSuccess: successCallback,
        showError: errorCallback
      }
    );
  };

  const renderReportTypeItem = ({ item }: { item: ReportType }) => (
    <TouchableOpacity
      style={[
        styles.reportTypeCard,
        selectedReportType === item.id && { ...styles.selectedReportType, backgroundColor: item.color }
      ]}
      onPress={() => setSelectedReportType(item.id)}
    >
      <View style={styles.reportTypeIconContainer}>
        <Ionicons 
          name={item.icon as any} 
          size={28} 
          color={selectedReportType === item.id ? '#ffffff' : item.color} 
        />
      </View>
      <Text style={[
        styles.reportTypeName,
        selectedReportType === item.id && styles.selectedReportTypeName
      ]}>
        {item.name}
      </Text>
      <Text style={[
        styles.reportTypeDescription,
        selectedReportType === item.id && styles.selectedReportTypeDescription
      ]}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );



  // Mostrar loading si están cargando datos críticos
  if (farmsLoading || cattleLoading || (selectedFarm && farmCattleLoading)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={styles.loadingText}>
          {selectedFarm ? `Cargando datos de ${selectedFarm.name}...` : 'Cargando datos...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información de la granja seleccionada */}
        <View style={styles.farmInfoCard}>
          <View style={styles.farmInfoHeader}>
            <Ionicons name="location" size={20} color="#27ae60" />
            <Text style={styles.farmInfoTitle}>
              {selectedFarm ? selectedFarm.name : 'Todas las granjas'}
            </Text>
          </View>
          <Text style={styles.farmInfoSubtitle}>
            {selectedFarm ? 'Informe específico de granja' : 'Informe consolidado'}
          </Text>
        </View>

        {/* Tipos de informe */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Informe</Text>
      <FlatList
            data={reportTypes}
            renderItem={renderReportTypeItem}
            keyExtractor={item => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.reportTypesGrid}
          />
        </View>

        {/* Estadísticas rápidas mejoradas */}
        {reportData && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Resumen Ejecutivo</Text>
              <TouchableOpacity 
                style={styles.toggleButton}
                onPress={() => setShowCharts(!showCharts)}
              >
                <Ionicons 
                  name={showCharts ? 'eye-off' : 'eye'} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
            <View style={styles.statsGrid}>
              <StatCard
                title="Ganado Total"
                value={reportData.totalCattle}
                icon="list"
                color="#3498db"
                subtitle={`En ${reportData.totalFarms} granja${reportData.totalFarms !== 1 ? 's' : ''}`}
                trend={{
                  value: 12.5,
                  isPositive: true
                }}
              />
              <StatCard
                title="Registros Médicos"
                value={reportData.medicalRecordsCount}
                icon="medical"
                color="#e74c3c"
                subtitle="Historial completo"
                trend={{
                  value: 8.3,
                  isPositive: true
                }}
              />
            </View>
          </View>
        )}

        {/* Gráficos y visualizaciones */}
        {reportData && showCharts && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Análisis Visual</Text>
            
            {/* Gráfico de pastel para estado de salud */}
            <PieChart
              data={reportData.cattleByHealth}
              title="Distribución por Estado de Salud"
              colors={['#27ae60', '#f39c12', '#e74c3c', '#95a5a6']}
            />
            
            {/* Gráfico de pastel para género */}
            <PieChart
              data={reportData.cattleByGender}
              title="Distribución por Género"
              colors={['#3498db', '#e91e63', '#9c27b0']}
            />
            

          </View>
        )}

        {/* Botones de acción */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton, reportLoading && styles.disabledButton]}
            onPress={generateReport}
            disabled={reportLoading || !reportData}
          >
            {reportLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="eye" size={20} color="#ffffff" />
                <Text style={styles.actionButtonText}>Ver Informe</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.exportButton, reportLoading && styles.disabledButton]}
            onPress={() => setExportModalVisible(true)}
            disabled={reportLoading || !reportData}
          >
            <Ionicons name="download" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>Exportar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal del informe generado */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={reportModalVisible}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalHeaderButton}
              onPress={() => setReportModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Informe Generado</Text>
            <TouchableOpacity
              style={styles.modalHeaderButton}
              onPress={shareReport}
            >
              <Ionicons name="share" size={24} color="#27ae60" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.reportContent}>
            <Text style={styles.reportText}>{generatedReport}</Text>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal de opciones de exportación */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={exportModalVisible}
        onRequestClose={() => setExportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.exportModalContent}>
            <Text style={styles.exportModalTitle}>Exportar Informe</Text>
            <Text style={styles.exportModalSubtitle}>Selecciona el formato</Text>
            
            <TouchableOpacity style={styles.exportOption} onPress={handleExportHTML}>
              <View style={styles.exportOptionIcon}>
                <Ionicons name="document" size={24} color="#ffffff" />
              </View>
              <View style={styles.exportOptionText}>
                <Text style={styles.exportOptionTitle}>HTML</Text>
                <Text style={styles.exportOptionDescription}>Formato web profesional</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportOption} onPress={handleExportCSV}>
              <View style={[styles.exportOptionIcon, { backgroundColor: '#27ae60' }]}>
                <Ionicons name="grid" size={24} color="#ffffff" />
              </View>
              <View style={styles.exportOptionText}>
                <Text style={styles.exportOptionTitle}>CSV</Text>
                <Text style={styles.exportOptionDescription}>Datos para Excel</Text>
              </View>
            </TouchableOpacity>

        <TouchableOpacity 
              style={styles.cancelExportButton} 
              onPress={() => setExportModalVisible(false)}
        >
              <Text style={styles.cancelExportText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
        </View>
      </Modal>
      
      {/* Modal personalizado */}
      <ModalComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#777777',
    marginTop: 10,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  farmInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  farmInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  farmInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 8,
  },
  farmInfoSubtitle: {
    fontSize: 14,
    color: '#777777',
    marginLeft: 28,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  reportTypesGrid: {
    gap: 12,
  },
  reportTypeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flex: 1,
    marginHorizontal: 6,
    marginVertical: 6,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedReportType: {
    borderColor: 'transparent',
    transform: [{ scale: 1.02 }],
  },
  reportTypeIconContainer: {
    marginBottom: 8,
  },
  reportTypeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 4,
  },
  selectedReportTypeName: {
    color: '#ffffff',
  },
  reportTypeDescription: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedReportTypeDescription: {
    color: 'rgba(255,255,255,0.9)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  distributionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  distributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  distributionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 8,
  },
  distributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  distributionLabel: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  distributionValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distributionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginRight: 8,
  },
  distributionPercentage: {
    fontSize: 12,
    color: '#777777',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  viewButton: {
    backgroundColor: '#3498db',
  },
  exportButton: {
    backgroundColor: '#27ae60',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalHeaderButton: {
    padding: 8,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  reportContent: {
    flex: 1,
    padding: 20,
  },
  reportText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333333',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  exportModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  exportModalSubtitle: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    marginBottom: 24,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  exportOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  exportOptionText: {
    flex: 1,
  },
  exportOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  exportOptionDescription: {
    fontSize: 14,
    color: '#777777',
  },
  cancelExportButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelExportText: {
    fontSize: 16,
    color: '#777777',
    fontWeight: '500',
  },
});