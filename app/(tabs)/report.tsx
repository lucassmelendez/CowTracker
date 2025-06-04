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
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { 
  useUserFarms, 
  useAllCattle, 
  useAllCattleWithFarmInfo,
  useFarmCattle 
} from '../../hooks/useCachedData';
import api from '../../lib/services/api';
import { ReportGenerator, ReportData, CattleDetail } from '../../lib/utils/reportGenerator';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const reportTypes: ReportType[] = [
  {
    id: 'general',
    name: 'Informe General',
    description: 'Resumen completo de ganado y granjas',
    icon: 'document-text-outline'
  },
  {
    id: 'cattle',
    name: 'Informe de Ganado',
    description: 'Detalles específicos del ganado por granja',
    icon: 'list-outline'
  },
  {
    id: 'health',
    name: 'Informe de Salud',
    description: 'Estado de salud del ganado y registros médicos',
    icon: 'medical-outline'
  },
  {
    id: 'farms',
    name: 'Informe de Granjas',
    description: 'Información detallada de las granjas',
    icon: 'leaf-outline'
  }
];

export default function ReportPage() {
  const [selectedReportType, setSelectedReportType] = useState<string>('general');
  const [selectedFarm, setSelectedFarm] = useState<string>('all');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [cattleDetails, setCattleDetails] = useState<CattleDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string>('');
  const [exportModalVisible, setExportModalVisible] = useState(false);

  // Hooks para obtener datos
  const { data: farms, loading: farmsLoading } = useUserFarms();
  const { data: allCattle, loading: cattleLoading } = useAllCattleWithFarmInfo();
  const { data: farmCattle } = useFarmCattle(selectedFarm !== 'all' ? selectedFarm : null);

  useEffect(() => {
    if (farms && allCattle) {
      generateReportData();
    }
  }, [farms, allCattle, selectedFarm]);

  const generateReportData = async () => {
    if (!farms || !allCattle) return;

    setLoading(true);
    try {
      const cattleData = selectedFarm === 'all' ? allCattle : farmCattle || [];
      
      const data: ReportData = {
        totalCattle: cattleData.length,
        totalFarms: farms.length,
        cattleByFarm: {},
        cattleByHealth: {},
        cattleByGender: {},
        cattleByBreed: {},
        medicalRecordsCount: 0,
        averageCattlePerFarm: farms.length > 0 ? Math.round(allCattle.length / farms.length) : 0
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
      setCattleDetails(details);

      // Agrupar ganado por granja
      cattleData.forEach(cattle => {
        const farmName = cattle.finca?.nombre || cattle.farmName || 'Sin granja';
        data.cattleByFarm[farmName] = (data.cattleByFarm[farmName] || 0) + 1;
      });

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

      setReportData(data);
    } catch (error) {
      console.error('Error generando datos del informe:', error);
      Alert.alert('Error', 'No se pudieron generar los datos del informe');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    if (!reportData) {
      Alert.alert('Error', 'No hay datos disponibles para generar el informe');
      return;
    }

    let report = '';
    const currentDate = new Date().toLocaleDateString('es-ES');
    const selectedFarmName = selectedFarm === 'all' ? 'Todas las granjas' : 
      farms?.find(f => f._id === selectedFarm)?.name || 'Granja seleccionada';

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
    const selectedFarmName = selectedFarm === 'all' ? 'Todas las granjas' : 
      farms?.find(f => f._id === selectedFarm)?.name || 'Granja seleccionada';
    
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
        selectedReportType === item.id && styles.selectedReportType
      ]}
      onPress={() => setSelectedReportType(item.id)}
    >
      <View style={styles.reportTypeHeader}>
        <Ionicons 
          name={item.icon as any} 
          size={24} 
          color={selectedReportType === item.id ? '#ffffff' : '#27ae60'} 
        />
        <Text style={[
          styles.reportTypeName,
          selectedReportType === item.id && styles.selectedReportTypeName
        ]}>
          {item.name}
        </Text>
      </View>
      <Text style={[
        styles.reportTypeDescription,
        selectedReportType === item.id && styles.selectedReportTypeDescription
      ]}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  if (farmsLoading || cattleLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27ae60" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Informes</Text>
        <Text style={styles.subtitle}>Genera informes detallados de tu ganado</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipo de Informe</Text>
          <FlatList
            data={reportTypes}
            renderItem={renderReportTypeItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reportTypesList}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seleccionar Granja</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedFarm}
              onValueChange={(value) => setSelectedFarm(value)}
              style={styles.picker}
            >
              <Picker.Item label="Todas las granjas" value="all" />
              {farms?.map(farm => (
                <Picker.Item 
                  key={farm._id} 
                  label={farm.name} 
                  value={farm._id} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {reportData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vista Previa</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Total de ganado:</Text>
                <Text style={styles.previewValue}>{reportData.totalCattle}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Total de granjas:</Text>
                <Text style={styles.previewValue}>{reportData.totalFarms}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Registros médicos:</Text>
                <Text style={styles.previewValue}>{reportData.medicalRecordsCount}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.generateButton, loading && styles.disabledButton]}
            onPress={generateReport}
            disabled={loading || !reportData}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="document-text" size={20} color="#ffffff" />
                <Text style={styles.generateButtonText}>Ver Informe</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.exportButton, loading && styles.disabledButton]}
            onPress={() => setExportModalVisible(true)}
            disabled={loading || !reportData}
          >
            <Ionicons name="download" size={20} color="#ffffff" />
            <Text style={styles.exportButtonText}>Exportar</Text>
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
              style={styles.closeButton}
              onPress={() => setReportModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Informe Generado</Text>
            <TouchableOpacity
              style={styles.shareButton}
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
            <Text style={styles.exportModalSubtitle}>Selecciona el formato de exportación</Text>
            
            <TouchableOpacity style={styles.exportOption} onPress={handleExportHTML}>
              <Ionicons name="document" size={24} color="#27ae60" />
              <View style={styles.exportOptionText}>
                <Text style={styles.exportOptionTitle}>HTML</Text>
                <Text style={styles.exportOptionDescription}>Formato web con diseño profesional</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportOption} onPress={handleExportCSV}>
              <Ionicons name="grid" size={24} color="#27ae60" />
              <View style={styles.exportOptionText}>
                <Text style={styles.exportOptionTitle}>CSV</Text>
                <Text style={styles.exportOptionDescription}>Datos tabulares para Excel</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#27ae60',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#777777',
    marginTop: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  reportTypesList: {
    paddingRight: 20,
  },
  reportTypeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    minWidth: 200,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  selectedReportType: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },
  reportTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTypeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 8,
  },
  selectedReportTypeName: {
    color: '#ffffff',
  },
  reportTypeDescription: {
    fontSize: 14,
    color: '#777777',
    lineHeight: 18,
  },
  selectedReportTypeDescription: {
    color: 'rgba(255,255,255,0.9)',
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  picker: {
    height: 50,
  },
  previewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewLabel: {
    fontSize: 16,
    color: '#333333',
  },
  previewValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 30,
  },
  generateButton: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginRight: 10,
  },
  exportButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  exportButtonText: {
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
    paddingTop: 40,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  shareButton: {
    padding: 5,
  },
  reportContent: {
    flex: 1,
    padding: 20,
  },
  reportText: {
    fontSize: 14,
    lineHeight: 20,
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
    borderRadius: 15,
    padding: 25,
    width: '85%',
    maxWidth: 400,
  },
  exportModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 10,
  },
  exportModalSubtitle: {
    fontSize: 14,
    color: '#777777',
    textAlign: 'center',
    marginBottom: 25,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  exportOptionText: {
    marginLeft: 15,
    flex: 1,
  },
  exportOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  exportOptionDescription: {
    fontSize: 14,
    color: '#777777',
    marginTop: 2,
  },
  cancelExportButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelExportText: {
    fontSize: 16,
    color: '#777777',
  },
});