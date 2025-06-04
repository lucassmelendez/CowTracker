import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
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
import api from '../../lib/services/api';
import { ReportGenerator } from '../../lib/utils/reportGenerator';
import { ReportData, CattleDetail } from '../../lib/types';

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

  // Efecto para cargar datos cuando cambia la granja
  useEffect(() => {
    const loadReportData = async () => {
      // Intentar cargar desde caché primero
      const cacheLoaded = await loadFromCache();
      
      if (cacheLoaded && isDataFresh()) {
        console.log('Usando datos del caché (frescos)');
        return;
      }
      
      // Si no hay caché o los datos no están frescos, generar nuevos datos
      console.log('Generando nuevos datos de informe');
      await generateReportData();
    };

    if (farms && allCattle) {
      // Esperar a que los datos de la granja específica estén listos
      if (selectedFarm && farmCattleLoading) {
        return;
      }
      loadReportData();
    }
  }, [farms, allCattle, farmCattle, selectedFarm, farmCattleLoading]);

  // Efecto para refrescar datos de granja cuando cambia la selección
  useEffect(() => {
    if (selectedFarm?._id) {
      refreshFarmCattle();
    }
  }, [selectedFarm?._id]);

  const generateReportData = async () => {
    if (!farms || !allCattle) return;

    setReportLoading(true);
    try {
      // Usar los datos correctos según la granja seleccionada
      let cattleData;
      if (selectedFarm) {
        cattleData = farmCattle || [];
      } else {
        cattleData = allCattle;
      }
      
      const data: ReportData = {
        totalCattle: cattleData.length,
        totalFarms: selectedFarm ? 1 : farms.length,
        cattleByFarm: {},
        cattleByHealth: {},
        cattleByGender: {},
        cattleByBreed: {},
        medicalRecordsCount: 0,
        averageCattlePerFarm: selectedFarm ? cattleData.length : (farms.length > 0 ? Math.round(allCattle.length / farms.length) : 0)
      };

      // Preparar detalles del ganado para exportación
      const details: CattleDetail[] = cattleData.map(cattle => ({
        id: cattle.id_ganado?.toString() || cattle._id || '',
        name: cattle.nombre || cattle.name || 'Sin nombre',
        identifier: cattle.numero_identificacion || cattle.identificationNumber || 'Sin ID',
        breed: cattle.raza || cattle.breed || 'No especificado',
        gender: cattle.genero?.descripcion || cattle.gender || 'No especificado',
        health: cattle.estado_salud?.descripcion || cattle.healthStatus || 'No especificado',
        farmName: cattle.finca?.nombre || cattle.farmName || 'Sin granja',
        notes: cattle.nota || cattle.notes || ''
      }));

      // Agrupar ganado por granja
      if (selectedFarm) {
        data.cattleByFarm[selectedFarm.name] = cattleData.length;
      } else {
        cattleData.forEach(cattle => {
          const farmName = cattle.finca?.nombre || cattle.farmName || 'Sin granja';
          data.cattleByFarm[farmName] = (data.cattleByFarm[farmName] || 0) + 1;
        });
      }

      // Agrupar por estado de salud
      cattleData.forEach(cattle => {
        const health = cattle.estado_salud?.descripcion || cattle.healthStatus || 'No especificado';
        data.cattleByHealth[health] = (data.cattleByHealth[health] || 0) + 1;
      });

      // Agrupar por género
      cattleData.forEach(cattle => {
        const gender = cattle.genero?.descripcion || cattle.gender || 'No especificado';
        data.cattleByGender[gender] = (data.cattleByGender[gender] || 0) + 1;
      });

      // Agrupar por raza
      cattleData.forEach(cattle => {
        const breed = cattle.raza || cattle.breed || 'No especificado';
        data.cattleByBreed[breed] = (data.cattleByBreed[breed] || 0) + 1;
      });

      // Contar registros médicos
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

      // Actualizar estado y guardar en caché
      setReportData(data);
      setCattleDetails(details);
      
      const farmName = selectedFarm ? selectedFarm.name : 'Todas las granjas';
      await saveToCache(data, details, farmName);
      
    } catch (error) {
      console.error('Error generando datos del informe:', error);
      setReportError('No se pudieron generar los datos del informe');
      Alert.alert('Error', 'No se pudieron generar los datos del informe');
    } finally {
      setReportLoading(false);
    }
  };

  // Función para forzar actualización de datos
  const refreshReportData = async () => {
    await invalidateCache();
    await generateReportData();
  };

  const generateReport = () => {
    if (!reportData) {
      Alert.alert('Error', 'No hay datos disponibles para generar el informe');
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
• Promedio de ganado por granja: ${data.averageCattlePerFarm}
• Registros médicos totales: ${data.medicalRecordsCount}

DISTRIBUCIÓN POR GRANJA
-----------------------
${Object.entries(data.cattleByFarm).map(([farm, count]) => 
  `• ${farm}: ${count} animales`).join('\n')}

DISTRIBUCIÓN POR ESTADO DE SALUD
--------------------------------
${Object.entries(data.cattleByHealth).map(([health, count]) => 
  `• ${health}: ${count} animales`).join('\n')}

DISTRIBUCIÓN POR GÉNERO
-----------------------
${Object.entries(data.cattleByGender).map(([gender, count]) => 
  `• ${gender}: ${count} animales`).join('\n')}

DISTRIBUCIÓN POR RAZA
---------------------
${Object.entries(data.cattleByBreed).map(([breed, count]) => 
  `• ${breed}: ${count} animales`).join('\n')}

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
• Distribución por granja: ${Object.keys(data.cattleByFarm).length} granjas

DESGLOSE POR GRANJA
-------------------
${Object.entries(data.cattleByFarm).map(([farm, count]) => 
  `• ${farm}: ${count} animales (${((count/data.totalCattle)*100).toFixed(1)}%)`).join('\n')}

DESGLOSE POR RAZA
-----------------
${Object.entries(data.cattleByBreed).map(([breed, count]) => 
  `• ${breed}: ${count} animales (${((count/data.totalCattle)*100).toFixed(1)}%)`).join('\n')}

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
• Promedio de ganado por granja: ${data.averageCattlePerFarm}

DETALLE POR GRANJA
------------------
${Object.entries(data.cattleByFarm).map(([farm, count]) => 
  `• ${farm}:
  - Ganado: ${count} animales
  - Porcentaje del total: ${((count/data.totalCattle)*100).toFixed(1)}%`).join('\n')}

ANÁLISIS DE DISTRIBUCIÓN
------------------------
• Granja con más ganado: ${Object.entries(data.cattleByFarm).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
• Granja con menos ganado: ${Object.entries(data.cattleByFarm).sort((a, b) => a[1] - b[1])[0]?.[0] || 'N/A'}
• Distribución equilibrada: ${data.averageCattlePerFarm > 0 ? 'Sí' : 'No'}

RECOMENDACIONES
---------------
• Balancear la distribución de ganado entre granjas
• Optimizar el uso de recursos por granja
• Considerar la capacidad de cada granja

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
    
    await ReportGenerator.exportToHTML(
      reportData, 
      selectedReportType, 
      selectedFarmName,
      selectedReportType === 'cattle' ? cattleDetails : undefined
    );
  };

  const handleExportCSV = async () => {
    if (!reportData) return;
    
    setExportModalVisible(false);
    await ReportGenerator.exportToCSV(reportData, selectedReportType);
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

  const renderStatCard = (title: string, value: string | number, icon: string, color: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statCardHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={styles.statCardValue}>{value}</Text>
      </View>
      <Text style={styles.statCardTitle}>{title}</Text>
    </View>
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

        {/* Estadísticas rápidas */}
        {reportData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen</Text>
            <View style={styles.statsGrid}>
              {renderStatCard('Ganado Total', reportData.totalCattle, 'list', '#3498db')}
              {renderStatCard('Granjas', reportData.totalFarms, 'business', '#27ae60')}
              {renderStatCard('Registros Médicos', reportData.medicalRecordsCount, 'medical', '#e74c3c')}
              {renderStatCard('Promedio/Granja', reportData.averageCattlePerFarm, 'analytics', '#f39c12')}
            </View>
          </View>
        )}

        {/* Distribuciones */}
        {reportData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Distribuciones</Text>
            
            {/* Estado de Salud */}
            <View style={styles.distributionCard}>
              <View style={styles.distributionHeader}>
                <Ionicons name="medical" size={20} color="#e74c3c" />
                <Text style={styles.distributionTitle}>Estado de Salud</Text>
              </View>
              {Object.entries(reportData.cattleByHealth).map(([health, count]) => (
                <View key={health} style={styles.distributionItem}>
                  <Text style={styles.distributionLabel}>{health}</Text>
                  <View style={styles.distributionValueContainer}>
                    <Text style={styles.distributionValue}>{count}</Text>
                    <Text style={styles.distributionPercentage}>
                      ({((count/reportData.totalCattle)*100).toFixed(1)}%)
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Género */}
            <View style={styles.distributionCard}>
              <View style={styles.distributionHeader}>
                <Ionicons name="people" size={20} color="#9b59b6" />
                <Text style={styles.distributionTitle}>Género</Text>
              </View>
              {Object.entries(reportData.cattleByGender).map(([gender, count]) => (
                <View key={gender} style={styles.distributionItem}>
                  <Text style={styles.distributionLabel}>{gender}</Text>
                  <View style={styles.distributionValueContainer}>
                    <Text style={styles.distributionValue}>{count}</Text>
                    <Text style={styles.distributionPercentage}>
                      ({((count/reportData.totalCattle)*100).toFixed(1)}%)
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Razas */}
            <View style={styles.distributionCard}>
              <View style={styles.distributionHeader}>
                <Ionicons name="paw" size={20} color="#e67e22" />
                <Text style={styles.distributionTitle}>Razas</Text>
              </View>
              {Object.entries(reportData.cattleByBreed).slice(0, 5).map(([breed, count]) => (
                <View key={breed} style={styles.distributionItem}>
                  <Text style={styles.distributionLabel}>{breed}</Text>
                  <View style={styles.distributionValueContainer}>
                    <Text style={styles.distributionValue}>{count}</Text>
                    <Text style={styles.distributionPercentage}>
                      ({((count/reportData.totalCattle)*100).toFixed(1)}%)
                    </Text>
                  </View>
                </View>
              ))}
            </View>
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
    gap: 12,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: (width - 48) / 2 - 6,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  statCardTitle: {
    fontSize: 14,
    color: '#777777',
    fontWeight: '500',
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