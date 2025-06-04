import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export interface ReportData {
  totalCattle: number;
  totalFarms: number;
  cattleByFarm: { [key: string]: number };
  cattleByHealth: { [key: string]: number };
  cattleByGender: { [key: string]: number };
  cattleByBreed: { [key: string]: number };
  medicalRecordsCount: number;
  averageCattlePerFarm: number;
}

export interface CattleDetail {
  id: string;
  name: string;
  identifier: string;
  breed: string;
  gender: string;
  health: string;
  farmName: string;
  notes?: string;
}

export class ReportGenerator {
  static generateHTMLReport(
    reportData: ReportData, 
    reportType: string, 
    farmName: string,
    cattleDetails?: CattleDetail[]
  ): string {
    const currentDate = new Date().toLocaleDateString('es-ES');
    
    const htmlHeader = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Informe CowTracker</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #27ae60;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #27ae60;
            margin: 0;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .section {
            margin-bottom: 30px;
          }
          .section h2 {
            color: #27ae60;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
          }
          .stat-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #27ae60;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #27ae60;
          }
          .stat-label {
            color: #666;
            font-size: 14px;
          }
          .data-list {
            list-style: none;
            padding: 0;
          }
          .data-list li {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .data-list li:last-child {
            border-bottom: none;
          }
          .percentage {
            color: #27ae60;
            font-weight: bold;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .table th, .table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          .table th {
            background-color: #27ae60;
            color: white;
          }
          .table tr:nth-child(even) {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
    `;

    const htmlFooter = `
        <div class="footer">
          <p>Informe generado por CowTracker - ${currentDate}</p>
          <p>Sistema de Gestión Ganadera</p>
        </div>
      </body>
      </html>
    `;

    let htmlContent = '';

    switch (reportType) {
      case 'general':
        htmlContent = this.generateGeneralHTMLContent(reportData, farmName);
        break;
      case 'cattle':
        htmlContent = this.generateCattleHTMLContent(reportData, farmName, cattleDetails);
        break;
      case 'health':
        htmlContent = this.generateHealthHTMLContent(reportData, farmName);
        break;
      case 'farms':
        htmlContent = this.generateFarmsHTMLContent(reportData, farmName);
        break;
      default:
        htmlContent = this.generateGeneralHTMLContent(reportData, farmName);
    }

    return htmlHeader + htmlContent + htmlFooter;
  }

  private static generateGeneralHTMLContent(reportData: ReportData, farmName: string): string {
    return `
      <div class="header">
        <h1>Informe General de Ganado</h1>
        <p><strong>Alcance:</strong> ${farmName}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
      </div>

      <div class="section">
        <h2>Resumen Ejecutivo</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${reportData.totalFarms}</div>
            <div class="stat-label">Total de Granjas</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${reportData.totalCattle}</div>
            <div class="stat-label">Total de Ganado</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${reportData.averageCattlePerFarm}</div>
            <div class="stat-label">Promedio por Granja</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${reportData.medicalRecordsCount}</div>
            <div class="stat-label">Registros Médicos</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Distribución por Granja</h2>
        <ul class="data-list">
          ${Object.entries(reportData.cattleByFarm).map(([farm, count]) => 
            `<li><strong>${farm}:</strong> ${count} animales <span class="percentage">(${((count/reportData.totalCattle)*100).toFixed(1)}%)</span></li>`
          ).join('')}
        </ul>
      </div>

      <div class="section">
        <h2>Estado de Salud</h2>
        <ul class="data-list">
          ${Object.entries(reportData.cattleByHealth).map(([health, count]) => 
            `<li><strong>${health}:</strong> ${count} animales <span class="percentage">(${((count/reportData.totalCattle)*100).toFixed(1)}%)</span></li>`
          ).join('')}
        </ul>
      </div>

      <div class="section">
        <h2>Distribución por Género</h2>
        <ul class="data-list">
          ${Object.entries(reportData.cattleByGender).map(([gender, count]) => 
            `<li><strong>${gender}:</strong> ${count} animales <span class="percentage">(${((count/reportData.totalCattle)*100).toFixed(1)}%)</span></li>`
          ).join('')}
        </ul>
      </div>

      <div class="section">
        <h2>Distribución por Raza</h2>
        <ul class="data-list">
          ${Object.entries(reportData.cattleByBreed).map(([breed, count]) => 
            `<li><strong>${breed}:</strong> ${count} animales <span class="percentage">(${((count/reportData.totalCattle)*100).toFixed(1)}%)</span></li>`
          ).join('')}
        </ul>
      </div>
    `;
  }

  private static generateCattleHTMLContent(reportData: ReportData, farmName: string, cattleDetails?: CattleDetail[]): string {
    const detailsTable = cattleDetails ? `
      <div class="section">
        <h2>Detalle de Animales</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Identificación</th>
              <th>Nombre</th>
              <th>Raza</th>
              <th>Género</th>
              <th>Estado de Salud</th>
              <th>Granja</th>
            </tr>
          </thead>
          <tbody>
            ${cattleDetails.map(cattle => `
              <tr>
                <td>${cattle.identifier}</td>
                <td>${cattle.name}</td>
                <td>${cattle.breed}</td>
                <td>${cattle.gender}</td>
                <td>${cattle.health}</td>
                <td>${cattle.farmName}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : '';

    return `
      <div class="header">
        <h1>Informe Detallado de Ganado</h1>
        <p><strong>Alcance:</strong> ${farmName}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
      </div>

      <div class="section">
        <h2>Estadísticas Generales</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${reportData.totalCattle}</div>
            <div class="stat-label">Total de Animales</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${Object.keys(reportData.cattleByFarm).length}</div>
            <div class="stat-label">Granjas con Ganado</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Desglose por Granja</h2>
        <ul class="data-list">
          ${Object.entries(reportData.cattleByFarm).map(([farm, count]) => 
            `<li><strong>${farm}:</strong> ${count} animales <span class="percentage">(${((count/reportData.totalCattle)*100).toFixed(1)}%)</span></li>`
          ).join('')}
        </ul>
      </div>

      <div class="section">
        <h2>Desglose por Raza</h2>
        <ul class="data-list">
          ${Object.entries(reportData.cattleByBreed).map(([breed, count]) => 
            `<li><strong>${breed}:</strong> ${count} animales <span class="percentage">(${((count/reportData.totalCattle)*100).toFixed(1)}%)</span></li>`
          ).join('')}
        </ul>
      </div>

      ${detailsTable}
    `;
  }

  private static generateHealthHTMLContent(reportData: ReportData, farmName: string): string {
    const healthEntries = Object.entries(reportData.cattleByHealth);
    const mostCommonHealth = healthEntries.length > 0 ? healthEntries.sort((a, b) => b[1] - a[1])[0][0] : 'N/A';
    const sickAnimals = reportData.cattleByHealth['Enfermo'] || 0;
    const inTreatment = reportData.cattleByHealth['En tratamiento'] || 0;

    return `
      <div class="header">
        <h1>Informe de Salud del Ganado</h1>
        <p><strong>Alcance:</strong> ${farmName}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
      </div>

      <div class="section">
        <h2>Resumen de Salud</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${reportData.totalCattle}</div>
            <div class="stat-label">Animales Evaluados</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${reportData.medicalRecordsCount}</div>
            <div class="stat-label">Registros Médicos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${reportData.totalCattle > 0 ? (reportData.medicalRecordsCount/reportData.totalCattle).toFixed(1) : 0}</div>
            <div class="stat-label">Promedio por Animal</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${sickAnimals + inTreatment}</div>
            <div class="stat-label">Requieren Atención</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Estado de Salud Actual</h2>
        <ul class="data-list">
          ${Object.entries(reportData.cattleByHealth).map(([health, count]) => 
            `<li><strong>${health}:</strong> ${count} animales <span class="percentage">(${((count/reportData.totalCattle)*100).toFixed(1)}%)</span></li>`
          ).join('')}
        </ul>
      </div>

      <div class="section">
        <h2>Análisis de Salud</h2>
        <ul class="data-list">
          <li><strong>Estado más común:</strong> ${mostCommonHealth}</li>
          <li><strong>Animales enfermos:</strong> ${sickAnimals}</li>
          <li><strong>Animales en tratamiento:</strong> ${inTreatment}</li>
        </ul>
      </div>

      <div class="section">
        <h2>Recomendaciones</h2>
        <ul class="data-list">
          <li>Mantener registros médicos actualizados</li>
          <li>Realizar chequeos regulares del ganado</li>
          <li>Seguir protocolos de vacunación</li>
          <li>Monitorear animales con problemas de salud</li>
          <li>Implementar medidas preventivas</li>
        </ul>
      </div>
    `;
  }

  private static generateFarmsHTMLContent(reportData: ReportData, farmName: string): string {
    const farmEntries = Object.entries(reportData.cattleByFarm);
    const farmWithMostCattle = farmEntries.length > 0 ? farmEntries.sort((a, b) => b[1] - a[1])[0][0] : 'N/A';
    const farmWithLeastCattle = farmEntries.length > 0 ? farmEntries.sort((a, b) => a[1] - b[1])[0][0] : 'N/A';

    return `
      <div class="header">
        <h1>Informe de Granjas</h1>
        <p><strong>Alcance:</strong> ${farmName}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
      </div>

      <div class="section">
        <h2>Resumen de Granjas</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${reportData.totalFarms}</div>
            <div class="stat-label">Total de Granjas</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${reportData.totalCattle}</div>
            <div class="stat-label">Total de Ganado</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${reportData.averageCattlePerFarm}</div>
            <div class="stat-label">Promedio por Granja</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Detalle por Granja</h2>
        <ul class="data-list">
          ${Object.entries(reportData.cattleByFarm).map(([farm, count]) => 
            `<li><strong>${farm}:</strong><br>
             - Ganado: ${count} animales<br>
             - Porcentaje del total: <span class="percentage">${((count/reportData.totalCattle)*100).toFixed(1)}%</span></li>`
          ).join('')}
        </ul>
      </div>

      <div class="section">
        <h2>Análisis de Distribución</h2>
        <ul class="data-list">
          <li><strong>Granja con más ganado:</strong> ${farmWithMostCattle}</li>
          <li><strong>Granja con menos ganado:</strong> ${farmWithLeastCattle}</li>
          <li><strong>Distribución equilibrada:</strong> ${reportData.averageCattlePerFarm > 0 ? 'Sí' : 'No'}</li>
        </ul>
      </div>

      <div class="section">
        <h2>Recomendaciones</h2>
        <ul class="data-list">
          <li>Balancear la distribución de ganado entre granjas</li>
          <li>Optimizar el uso de recursos por granja</li>
          <li>Considerar la capacidad de cada granja</li>
          <li>Evaluar la eficiencia operativa</li>
        </ul>
      </div>
    `;
  }

  static async exportToHTML(
    reportData: ReportData, 
    reportType: string, 
    farmName: string,
    cattleDetails?: CattleDetail[]
  ): Promise<void> {
    try {
      const htmlContent = this.generateHTMLReport(reportData, reportType, farmName, cattleDetails);
      const fileName = `informe_${reportType}_${new Date().getTime()}.html`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/html',
          dialogTitle: 'Compartir Informe',
        });
      } else {
        Alert.alert('Éxito', `Informe guardado como ${fileName}`);
      }
    } catch (error) {
      console.error('Error exportando informe:', error);
      Alert.alert('Error', 'No se pudo exportar el informe');
    }
  }

  static generateCSVReport(reportData: ReportData, reportType: string): string {
    let csvContent = '';
    const date = new Date().toLocaleDateString('es-ES');

    switch (reportType) {
      case 'general':
        csvContent = `Informe General de Ganado - ${date}\n\n`;
        csvContent += `Categoría,Cantidad\n`;
        csvContent += `Total Granjas,${reportData.totalFarms}\n`;
        csvContent += `Total Ganado,${reportData.totalCattle}\n`;
        csvContent += `Promedio por Granja,${reportData.averageCattlePerFarm}\n`;
        csvContent += `Registros Médicos,${reportData.medicalRecordsCount}\n\n`;
        
        csvContent += `Distribución por Granja\n`;
        csvContent += `Granja,Cantidad,Porcentaje\n`;
        Object.entries(reportData.cattleByFarm).forEach(([farm, count]) => {
          csvContent += `${farm},${count},${((count/reportData.totalCattle)*100).toFixed(1)}%\n`;
        });
        break;

      case 'health':
        csvContent = `Informe de Salud - ${date}\n\n`;
        csvContent += `Estado de Salud,Cantidad,Porcentaje\n`;
        Object.entries(reportData.cattleByHealth).forEach(([health, count]) => {
          csvContent += `${health},${count},${((count/reportData.totalCattle)*100).toFixed(1)}%\n`;
        });
        break;

      default:
        csvContent = this.generateCSVReport(reportData, 'general');
    }

    return csvContent;
  }

  static async exportToCSV(reportData: ReportData, reportType: string): Promise<void> {
    try {
      const csvContent = this.generateCSVReport(reportData, reportType);
      const fileName = `informe_${reportType}_${new Date().getTime()}.csv`;
      const fileUri = FileSystem.documentDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Compartir Informe CSV',
        });
      } else {
        Alert.alert('Éxito', `Informe CSV guardado como ${fileName}`);
      }
    } catch (error) {
      console.error('Error exportando CSV:', error);
      Alert.alert('Error', 'No se pudo exportar el informe CSV');
    }
  }
} 