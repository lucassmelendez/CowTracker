import { 
  DatabaseTest, 
  TestResult, 
  TestSuite, 
  TestReport, 
  TestCriteria, 
  SimulatedDatabase, 
  DatabaseOperation,
  TestCategory 
} from '../types/tests';

// Tipo para resultado de operación individual
interface OperationResult {
  id: string;
  success: boolean;
  executionTime: number;
  errorMessage?: string;
  details?: any;
}

class TestService {
  private simulatedDB: SimulatedDatabase;
  private testHistory: TestReport[] = [];

  constructor() {
    this.simulatedDB = this.initializeDatabase();
  }

  private initializeDatabase(): SimulatedDatabase {
    return {
      tables: {
        ganado: this.generateSampleCattle(1000),
        granjas: this.generateSampleFarms(50),
        ventas: this.generateSampleSales(500),
        usuarios: this.generateSampleUsers(100),
        registros_medicos: this.generateSampleMedicalRecords(2000)
      },
      operations: [],
      isCorrupted: false,
      isOverloaded: false,
      connectionCount: 0
    };
  }

  private generateSampleCattle(count: number): any[] {
    const cattle = [];
    for (let i = 1; i <= count; i++) {
      cattle.push({
        id: i,
        nombre: `Ganado-${i}`,
        raza: ['Holstein', 'Angus', 'Brahman', 'Charolais'][Math.floor(Math.random() * 4)],
        edad: Math.floor(Math.random() * 10) + 1,
        peso: Math.floor(Math.random() * 200) + 300,
        granja_id: Math.floor(Math.random() * 50) + 1,
        estado: ['Activo', 'Vendido', 'Enfermo'][Math.floor(Math.random() * 3)]
      });
    }
    return cattle;
  }

  private generateSampleFarms(count: number): any[] {
    const farms = [];
    for (let i = 1; i <= count; i++) {
      farms.push({
        id: i,
        nombre: `Granja-${i}`,
        ubicacion: `Ubicación-${i}`,
        propietario_id: Math.floor(Math.random() * 100) + 1,
        area: Math.floor(Math.random() * 1000) + 100
      });
    }
    return farms;
  }

  private generateSampleSales(count: number): any[] {
    const sales = [];
    for (let i = 1; i <= count; i++) {
      sales.push({
        id: i,
        ganado_id: Math.floor(Math.random() * 1000) + 1,
        precio: Math.floor(Math.random() * 5000) + 1000,
        fecha: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        comprador: `Comprador-${i}`
      });
    }
    return sales;
  }

  private generateSampleUsers(count: number): any[] {
    const users = [];
    for (let i = 1; i <= count; i++) {
      users.push({
        id: i,
        nombre: `Usuario-${i}`,
        email: `usuario${i}@example.com`,
        rol: ['admin', 'usuario', 'veterinario'][Math.floor(Math.random() * 3)]
      });
    }
    return users;
  }

  private generateSampleMedicalRecords(count: number): any[] {
    const records = [];
    for (let i = 1; i <= count; i++) {
      records.push({
        id: i,
        ganado_id: Math.floor(Math.random() * 1000) + 1,
        fecha: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        diagnostico: `Diagnóstico-${i}`,
        tratamiento: `Tratamiento-${i}`,
        veterinario_id: Math.floor(Math.random() * 20) + 1
      });
    }
    return records;
  }

  private async simulateOperation(operation: DatabaseOperation): Promise<OperationResult> {
    const startTime = Date.now();
    
    try {
      // Simular latencia de red
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
      
      // Incrementar contador de conexiones
      this.simulatedDB.connectionCount++;
      
      let success = true;
      let details = {};

      switch (operation.type) {
        case 'INSERT':
          if (this.simulatedDB.isOverloaded && Math.random() < 0.3) {
            throw new Error('Sistema sobrecargado - Inserción fallida');
          }
          this.simulatedDB.tables[operation.table].push(operation.data);
          details = { insertedRows: 1 };
          break;

        case 'SELECT':
          if (this.simulatedDB.isCorrupted && Math.random() < 0.2) {
            throw new Error('Datos corruptos detectados');
          }
          const results = this.simulatedDB.tables[operation.table] || [];
          details = { selectedRows: results.length };
          break;

        case 'UPDATE':
          if (this.simulatedDB.isOverloaded && Math.random() < 0.25) {
            throw new Error('Sistema sobrecargado - Actualización fallida');
          }
          const updateCount = Math.floor(Math.random() * 10) + 1;
          details = { updatedRows: updateCount };
          break;

        case 'DELETE':
          if (this.simulatedDB.isOverloaded && Math.random() < 0.2) {
            throw new Error('Sistema sobrecargado - Eliminación fallida');
          }
          const deleteCount = Math.floor(Math.random() * 5) + 1;
          details = { deletedRows: deleteCount };
          break;

        case 'BACKUP':
          if (Math.random() < 0.05) {
            throw new Error('Error de E/S durante backup');
          }
          details = { backupSize: '150MB', tablesBackedUp: Object.keys(this.simulatedDB.tables).length };
          break;

        case 'RESTORE':
          if (Math.random() < 0.1) {
            throw new Error('Archivo de backup corrupto');
          }
          details = { restoredTables: Object.keys(this.simulatedDB.tables).length };
          break;
      }

      this.simulatedDB.operations.push(operation);
      
      return {
        id: `op-${Date.now()}-${Math.random()}`,
        success: true,
        executionTime: Date.now() - startTime,
        details
      };

    } catch (error: any) {
      return {
        id: `op-${Date.now()}-${Math.random()}`,
        success: false,
        executionTime: Date.now() - startTime,
        errorMessage: error.message,
        details: { error: error.message }
      };
    } finally {
      this.simulatedDB.connectionCount--;
    }
  }

  // Método para calcular puntuaciones individuales por criterio
  private calculateIndividualScores(
    testResult: TestResult, 
    expectedCriteria: TestCriteria, 
    category: string
  ): TestCriteria {
    const { success, executionTime, errorMessage } = testResult;
    
    // Puntuación base según éxito/fallo
    const baseScore = success ? 5 : 1;
    
    // Ajustes por tiempo de ejecución
    let performanceAdjustment = 0;
    if (executionTime > 2000) performanceAdjustment = -2;
    else if (executionTime > 1000) performanceAdjustment = -1;
    else if (executionTime < 100) performanceAdjustment = 1;
    
    // Ajustes por categoría específica
    let categoryAdjustments = { D: 0, I: 0, CS: 0, TF: 0 };
    
    switch (category) {
      case 'concurrency':
        categoryAdjustments.CS = success ? 1 : -1; // Mejor carga del sistema si es exitoso
        categoryAdjustments.TF = success ? 1 : -2; // Tolerancia a fallos crítica
        break;
      case 'performance':
        categoryAdjustments.D = performanceAdjustment;
        categoryAdjustments.CS = executionTime > 1500 ? -1 : 0;
        break;
      case 'integrity':
        categoryAdjustments.I = success ? 1 : -2; // Integridad crítica
        categoryAdjustments.TF = success ? 0 : -1;
        break;
      case 'backup':
        categoryAdjustments.TF = success ? 1 : -2; // Tolerancia a fallos crítica
        categoryAdjustments.I = success ? 1 : -1; // Integridad importante
        break;
      case 'stress':
        categoryAdjustments.CS = success ? 1 : -2; // Carga del sistema crítica
        categoryAdjustments.TF = success ? 1 : -1;
        categoryAdjustments.D = executionTime > 1000 ? -1 : 0;
        break;
    }
    
    // Ajustes por errores específicos
    if (errorMessage) {
      if (errorMessage.includes('sobrecargado')) {
        categoryAdjustments.CS -= 1;
      }
      if (errorMessage.includes('corrupto')) {
        categoryAdjustments.I -= 1;
        categoryAdjustments.TF -= 1;
      }
      if (errorMessage.includes('interrupción')) {
        categoryAdjustments.TF -= 2;
      }
    }
    
    // Calcular puntuaciones finales (mínimo 1, máximo 5)
    return {
      D: Math.max(1, Math.min(5, expectedCriteria.D + categoryAdjustments.D + (success ? 0 : -1))),
      I: Math.max(1, Math.min(5, expectedCriteria.I + categoryAdjustments.I + (success ? 0 : -1))),
      CS: Math.max(1, Math.min(5, expectedCriteria.CS + categoryAdjustments.CS + (success ? 0 : -1))),
      TF: Math.max(1, Math.min(5, expectedCriteria.TF + categoryAdjustments.TF + (success ? 0 : -1)))
    };
  }

  // Definición de las 20 pruebas
  private getTestDefinitions(): DatabaseTest[] {
    return [
      {
        id: 'p1',
        name: 'Insert simultáneos - Prueba de concurrencia',
        description: 'Ejecutar múltiples inserciones simultáneas para probar la concurrencia',
        category: 'concurrency',
        expectedCriteria: { D: 4, I: 5, CS: 3, TF: 4 },
        execute: async () => {
          const promises = [];
          for (let i = 0; i < 10; i++) {
            promises.push(this.simulateOperation({
              type: 'INSERT',
              table: 'ganado',
              data: { id: Date.now() + i, nombre: `Concurrent-${i}` }
            }));
          }
          const results = await Promise.all(promises);
          const successCount = results.filter(r => r.success).length;
          
          const testResult = {
            id: 'p1',
            success: successCount >= 8,
            executionTime: Math.max(...results.map(r => r.executionTime)),
            details: { totalOperations: 10, successfulOperations: successCount },
            scores: { D: 0, I: 0, CS: 0, TF: 0 } // Placeholder
          };
          
          // Calcular puntuaciones individuales
          testResult.scores = this.calculateIndividualScores(testResult, { D: 4, I: 5, CS: 3, TF: 4 }, 'concurrency');
          
          return testResult;
        }
      },

      {
        id: 'p2',
        name: 'Carga de registros masivo',
        description: 'Insertar gran cantidad de registros de forma masiva',
        category: 'performance',
        expectedCriteria: { D: 1, I: 2, CS: 5, TF: 5 },
        execute: async () => {
          const startTime = Date.now();
          const batchSize = 1000;
          let successCount = 0;
          
          for (let i = 0; i < batchSize; i++) {
            const result = await this.simulateOperation({
              type: 'INSERT',
              table: 'ganado',
              data: { id: Date.now() + i, nombre: `Batch-${i}` }
            });
            if (result.success) successCount++;
          }
          
          const testResult = {
            id: 'p2',
            success: successCount >= batchSize * 0.95,
            executionTime: Date.now() - startTime,
            details: { batchSize, successCount, successRate: (successCount / batchSize) * 100 },
            scores: { D: 0, I: 0, CS: 0, TF: 0 } // Placeholder
          };
          
          // Calcular puntuaciones individuales
          testResult.scores = this.calculateIndividualScores(testResult, { D: 1, I: 2, CS: 5, TF: 5 }, 'performance');
          
          return testResult;
        }
      },

      {
        id: 'p3',
        name: 'Inserción basada en consulta',
        description: 'Insertar registros basándose en el resultado de una consulta',
        category: 'integrity',
        expectedCriteria: { D: 3, I: 4, CS: 3, TF: 3 },
        execute: async () => {
          const selectResult = await this.simulateOperation({
            type: 'SELECT',
            table: 'granjas'
          });
          
          if (!selectResult.success) {
            const testResult = {
              id: 'p3',
              success: false,
              executionTime: selectResult.executionTime,
              errorMessage: 'Falló la consulta base',
              scores: { D: 0, I: 0, CS: 0, TF: 0 } // Placeholder
            };
            
            testResult.scores = this.calculateIndividualScores(testResult, { D: 3, I: 4, CS: 3, TF: 3 }, 'integrity');
            return testResult;
          }
          
          const insertResult = await this.simulateOperation({
            type: 'INSERT',
            table: 'ganado',
            data: { granja_id: 1, nombre: 'Basado-en-consulta' }
          });
          
          const testResult = {
            id: 'p3',
            success: insertResult.success,
            executionTime: selectResult.executionTime + insertResult.executionTime,
            details: { consultaExitosa: selectResult.success, insercionExitosa: insertResult.success },
            scores: { D: 0, I: 0, CS: 0, TF: 0 } // Placeholder
          };
          
          testResult.scores = this.calculateIndividualScores(testResult, { D: 3, I: 4, CS: 3, TF: 3 }, 'integrity');
          return testResult;
        }
      },

      {
        id: 'p4',
        name: 'Consulta con subconsulta',
        description: 'Generar consulta basada en resultado de subconsulta',
        category: 'performance',
        expectedCriteria: { D: 3, I: 4, CS: 3, TF: 3 },
        execute: async () => {
          const subqueryResult = await this.simulateOperation({
            type: 'SELECT',
            table: 'granjas'
          });
          
          const mainQueryResult = await this.simulateOperation({
            type: 'SELECT',
            table: 'ganado'
          });
          
          const testResult = {
            id: 'p4',
            success: subqueryResult.success && mainQueryResult.success,
            executionTime: subqueryResult.executionTime + mainQueryResult.executionTime,
            details: { subconsultaExitosa: subqueryResult.success, consultaPrincipalExitosa: mainQueryResult.success },
            scores: { D: 0, I: 0, CS: 0, TF: 0 } // Placeholder
          };
          
          testResult.scores = this.calculateIndividualScores(testResult, { D: 3, I: 4, CS: 3, TF: 3 }, 'performance');
          return testResult;
        }
      },

      {
        id: 'p5',
        name: 'Join - Diferencia entre tablas',
        description: 'Realizar join para encontrar diferencias entre dos tablas',
        category: 'performance',
        expectedCriteria: { D: 3, I: 4, CS: 3, TF: 3 },
        execute: async () => {
          const table1Result = await this.simulateOperation({
            type: 'SELECT',
            table: 'ganado'
          });
          
          const table2Result = await this.simulateOperation({
            type: 'SELECT',
            table: 'granjas'
          });
          
          const testResult = {
            id: 'p5',
            success: table1Result.success && table2Result.success,
            executionTime: table1Result.executionTime + table2Result.executionTime,
            details: { joinExitoso: table1Result.success && table2Result.success },
            scores: { D: 0, I: 0, CS: 0, TF: 0 } // Placeholder
          };
          
          testResult.scores = this.calculateIndividualScores(testResult, { D: 3, I: 4, CS: 3, TF: 3 }, 'performance');
          return testResult;
        }
      },

      {
        id: 'p6',
        name: 'Exportar información a archivo',
        description: 'Exportar datos de tabla a archivo externo',
        category: 'performance',
        expectedCriteria: { D: 3, I: 4, CS: 3, TF: 3 },
        execute: async () => {
          const selectResult = await this.simulateOperation({
            type: 'SELECT',
            table: 'ganado'
          });
          
          // Simular exportación
          await new Promise(resolve => setTimeout(resolve, 200));
          
          const testResult = {
            id: 'p6',
            success: selectResult.success,
            executionTime: selectResult.executionTime + 200,
            details: { registrosExportados: selectResult.details?.selectedRows || 0 },
            scores: { D: 0, I: 0, CS: 0, TF: 0 } // Placeholder
          };
          
          testResult.scores = this.calculateIndividualScores(testResult, { D: 3, I: 4, CS: 3, TF: 3 }, 'performance');
          return testResult;
        }
      },

      {
        id: 'p7',
        name: 'Funciones varias',
        description: 'Ejecutar diversas funciones de base de datos',
        category: 'performance',
        expectedCriteria: { D: 3, I: 4, CS: 3, TF: 3 },
        execute: async () => {
          const operations = [
            this.simulateOperation({ type: 'SELECT', table: 'ganado' }),
            this.simulateOperation({ type: 'SELECT', table: 'granjas' }),
            this.simulateOperation({ type: 'SELECT', table: 'ventas' })
          ];
          
          const results = await Promise.all(operations);
          const successCount = results.filter(r => r.success).length;
          
          const testResult = {
            id: 'p7',
            success: successCount === results.length,
            executionTime: Math.max(...results.map(r => r.executionTime)),
            details: { funcionesEjecutadas: results.length, funcionesExitosas: successCount },
            scores: { D: 0, I: 0, CS: 0, TF: 0 } // Placeholder
          };
          
          testResult.scores = this.calculateIndividualScores(testResult, { D: 3, I: 4, CS: 3, TF: 3 }, 'performance');
          return testResult;
        }
      },

      {
        id: 'p8',
        name: 'Eliminar todos los registros',
        description: 'Eliminar todos los registros de una tabla',
        category: 'integrity',
        expectedCriteria: { D: 4, I: 5, CS: 3, TF: 4 },
        execute: async () => {
          const deleteResult = await this.simulateOperation({
            type: 'DELETE',
            table: 'ganado'
          });
          
          const testResult = {
            id: 'p8',
            success: deleteResult.success,
            executionTime: deleteResult.executionTime,
            details: deleteResult.details,
            scores: { D: 0, I: 0, CS: 0, TF: 0 } // Placeholder
          };
          
          testResult.scores = this.calculateIndividualScores(testResult, { D: 4, I: 5, CS: 3, TF: 4 }, 'integrity');
          return testResult;
        }
      },

      {
        id: 'p9',
        name: 'Eliminar rango de registros',
        description: 'Eliminar un rango específico de registros',
        category: 'integrity',
        expectedCriteria: { D: 4, I: 4, CS: 3, TF: 4 },
        execute: async () => {
          const deleteResult = await this.simulateOperation({
            type: 'DELETE',
            table: 'ganado',
            condition: 'id BETWEEN 1 AND 10'
          });
          
          const testResult = {
            id: 'p9',
            success: deleteResult.success,
            executionTime: deleteResult.executionTime,
            details: deleteResult.details,
            scores: { D: 0, I: 0, CS: 0, TF: 0 } // Placeholder
          };
          
          testResult.scores = this.calculateIndividualScores(testResult, { D: 4, I: 4, CS: 3, TF: 4 }, 'integrity');
          return testResult;
        }
      },

      {
        id: 'p10',
        name: 'Eliminar y recuperar con rollback',
        description: 'Eliminar registros y recuperarlos usando rollback',
        category: 'integrity',
        expectedCriteria: { D: 4, I: 5, CS: 3, TF: 5 },
        execute: async () => {
          const deleteResult = await this.simulateOperation({
            type: 'DELETE',
            table: 'ganado',
            condition: 'id BETWEEN 1 AND 5'
          });
          
          // Simular rollback
          await new Promise(resolve => setTimeout(resolve, 100));
          const rollbackSuccess = Math.random() > 0.1; // 90% de éxito
          
          const testResult = {
            id: 'p10',
            success: deleteResult.success && rollbackSuccess,
            executionTime: deleteResult.executionTime + 100,
            details: { eliminacionExitosa: deleteResult.success, rollbackExitoso: rollbackSuccess },
            scores: { D: 0, I: 0, CS: 0, TF: 0 } // Placeholder
          };
          
          testResult.scores = this.calculateIndividualScores(testResult, { D: 4, I: 5, CS: 3, TF: 5 }, 'integrity');
          return testResult;
        }
      },

      {
        id: 'p11',
        name: 'Actualización de campo',
        description: 'Actualizar un campo específico',
        category: 'integrity',
        expectedCriteria: { D: 4, I: 4, CS: 3, TF: 4 },
        execute: async () => {
          const updateResult = await this.simulateOperation({
            type: 'UPDATE',
            table: 'ganado',
            data: { peso: 450 }
          });
          
          const testResult = {
            id: 'p11',
            success: updateResult.success,
            executionTime: updateResult.executionTime,
            details: updateResult.details,
            scores: { D: 0, I: 0, CS: 0, TF: 0 } // Placeholder
          };
          
          testResult.scores = this.calculateIndividualScores(testResult, { D: 4, I: 4, CS: 3, TF: 4 }, 'integrity');
          return testResult;
        }
      },

      {
        id: 'p12',
        name: 'Actualización en cascada',
        description: 'Actualizar campo con efecto en cascada',
        category: 'integrity',
        expectedCriteria: { D: 3, I: 5, CS: 3, TF: 4 },
        execute: async () => {
          const updateResult = await this.simulateOperation({
            type: 'UPDATE',
            table: 'granjas',
            data: { propietario_id: 999 }
          });
          
          // Simular actualización en cascada
          const cascadeResult = await this.simulateOperation({
            type: 'UPDATE',
            table: 'ganado',
            data: { granja_id: 999 }
          });
          
          const testResult = {
            id: 'p12',
            success: updateResult.success && cascadeResult.success,
            executionTime: updateResult.executionTime + cascadeResult.executionTime,
            details: { actualizacionPrincipal: updateResult.success, cascadaExitosa: cascadeResult.success },
            scores: { D: 0, I: 0, CS: 0, TF: 0 } // Placeholder
          };
          
          testResult.scores = this.calculateIndividualScores(testResult, { D: 3, I: 5, CS: 3, TF: 4 }, 'integrity');
          return testResult;
        }
      },

      {
        id: 'p13',
        name: 'Actualización condicional',
        description: 'Actualizar campo con condición específica',
        category: 'integrity',
        expectedCriteria: { D: 4, I: 4, CS: 3, TF: 4 },
        execute: async () => {
          const updateResult = await this.simulateOperation({
            type: 'UPDATE',
            table: 'ganado',
            data: { peso: 500 },
            condition: 'edad > 5'
          });
          
          const testResult = {
            id: 'p13',
            success: updateResult.success,
            executionTime: updateResult.executionTime,
            details: updateResult.details,
            scores: { D: 0, I: 0, CS: 0, TF: 0 } // Placeholder
          };
          
          testResult.scores = this.calculateIndividualScores(testResult, { D: 4, I: 4, CS: 3, TF: 4 }, 'integrity');
          return testResult;
        }
      },

      {
        id: 'p14',
        name: 'Backup completo',
        description: 'Realizar backup de toda la base de datos',
        category: 'backup',
        expectedCriteria: { D: 3, I: 5, CS: 4, TF: 5 },
        execute: async () => {
          const backupResult = await this.simulateOperation({
            type: 'BACKUP',
            table: 'all_tables'
          });
          
          const testResult = {
            id: 'p14',
            success: backupResult.success,
            executionTime: backupResult.executionTime,
            details: backupResult.details,
            scores: { D: 0, I: 0, CS: 0, TF: 0 } // Placeholder
          };
          
          testResult.scores = this.calculateIndividualScores(testResult, { D: 3, I: 5, CS: 4, TF: 5 }, 'backup');
          return testResult;
        }
      },

      {
        id: 'p15',
        name: 'Restauración de backup',
        description: 'Restaurar backup completo de la base de datos',
        category: 'backup',
        expectedCriteria: { D: 3, I: 5, CS: 4, TF: 5 },
        execute: async () => {
          const restoreResult = await this.simulateOperation({
            type: 'RESTORE',
            table: 'all_tables'
          });
          
          const testResult = {
            id: 'p15',
            success: restoreResult.success,
            executionTime: restoreResult.executionTime,
            details: restoreResult.details,
            scores: { D: 0, I: 0, CS: 0, TF: 0 } // Placeholder
          };
          
          testResult.scores = this.calculateIndividualScores(testResult, { D: 3, I: 5, CS: 4, TF: 5 }, 'backup');
          return testResult;
        }
      },

      {
        id: 'p16',
        name: 'Inserción con sistema sobrecargado',
        description: 'Probar inserción mientras el sistema está sobrecargado',
        category: 'stress',
        expectedCriteria: { D: 2, I: 3, CS: 5, TF: 4 },
        execute: async () => {
          this.simulatedDB.isOverloaded = true;
          
          const insertResult = await this.simulateOperation({
            type: 'INSERT',
            table: 'ganado',
            data: { nombre: 'Stress-Test' }
          });
          
          this.simulatedDB.isOverloaded = false;
          
          const testResult = {
            id: 'p16',
            success: insertResult.success,
            executionTime: insertResult.executionTime,
            details: { ...insertResult.details, sistemasobrecargado: true },
            scores: { D: 0, I: 0, CS: 0, TF: 0 } // Placeholder
          };
          
          testResult.scores = this.calculateIndividualScores(testResult, { D: 2, I: 3, CS: 5, TF: 4 }, 'stress');
          return testResult;
        }
      },

      {
        id: 'p17',
        name: 'Consulta con sistema sobrecargado',
        description: 'Probar consulta mientras el sistema está sobrecargado',
        category: 'stress',
        expectedCriteria: { D: 2, I: 3, CS: 5, TF: 4 },
        execute: async () => {
          this.simulatedDB.isOverloaded = true;
          
          const selectResult = await this.simulateOperation({
            type: 'SELECT',
            table: 'ganado'
          });
          
          this.simulatedDB.isOverloaded = false;
          
          const testResult = {
            id: 'p17',
            success: selectResult.success,
            executionTime: selectResult.executionTime,
            details: { ...selectResult.details, sistemasobrecargado: true },
            scores: { D: 0, I: 0, CS: 0, TF: 0 } // Placeholder
          };
          
          testResult.scores = this.calculateIndividualScores(testResult, { D: 2, I: 3, CS: 5, TF: 4 }, 'stress');
          return testResult;
        }
      },

      {
        id: 'p18',
        name: 'Actualización con sistema sobrecargado',
        description: 'Probar actualización mientras el sistema está sobrecargado',
        category: 'stress',
        expectedCriteria: { D: 2, I: 3, CS: 5, TF: 4 },
        execute: async () => {
          this.simulatedDB.isOverloaded = true;
          
          const updateResult = await this.simulateOperation({
            type: 'UPDATE',
            table: 'ganado',
            data: { peso: 480 }
          });
          
          this.simulatedDB.isOverloaded = false;
          
          const testResult = {
            id: 'p18',
            success: updateResult.success,
            executionTime: updateResult.executionTime,
            details: { ...updateResult.details, sistemasobrecargado: true },
            scores: { D: 0, I: 0, CS: 0, TF: 0 } // Placeholder
          };
          
          testResult.scores = this.calculateIndividualScores(testResult, { D: 2, I: 3, CS: 5, TF: 4 }, 'stress');
          return testResult;
        }
      },

      {
        id: 'p19',
        name: 'Eliminación con sistema sobrecargado',
        description: 'Probar eliminación mientras el sistema está sobrecargado',
        category: 'stress',
        expectedCriteria: { D: 2, I: 3, CS: 5, TF: 4 },
        execute: async () => {
          this.simulatedDB.isOverloaded = true;
          
          const deleteResult = await this.simulateOperation({
            type: 'DELETE',
            table: 'ganado',
            condition: 'id = 999'
          });
          
          this.simulatedDB.isOverloaded = false;
          
          const testResult = {
            id: 'p19',
            success: deleteResult.success,
            executionTime: deleteResult.executionTime,
            details: { ...deleteResult.details, sistemasobrecargado: true },
            scores: { D: 0, I: 0, CS: 0, TF: 0 } // Placeholder
          };
          
          testResult.scores = this.calculateIndividualScores(testResult, { D: 2, I: 3, CS: 5, TF: 4 }, 'stress');
          return testResult;
        }
      },

      {
        id: 'p20',
        name: 'Prueba de interrupción eléctrica',
        description: 'Simular interrupción eléctrica durante operación',
        category: 'stress',
        expectedCriteria: { D: 2, I: 4, CS: 3, TF: 5 },
        execute: async () => {
          const operations = [];
          
          // Simular múltiples operaciones
          for (let i = 0; i < 5; i++) {
            operations.push(this.simulateOperation({
              type: 'INSERT',
              table: 'ganado',
              data: { nombre: `PowerTest-${i}` }
            }));
          }
          
          // Simular interrupción eléctrica (20% de probabilidad)
          if (Math.random() < 0.2) {
            const testResult = {
              id: 'p20',
              success: false,
              executionTime: 1000,
              errorMessage: 'Interrupción eléctrica simulada',
              details: { interrupcionElectrica: true },
              scores: { D: 0, I: 0, CS: 0, TF: 0 } // Placeholder
            };
            
            testResult.scores = this.calculateIndividualScores(testResult, { D: 2, I: 4, CS: 3, TF: 5 }, 'stress');
            return testResult;
          }
          
          const results = await Promise.all(operations);
          const successCount = results.filter(r => r.success).length;
          
          const testResult = {
            id: 'p20',
            success: successCount >= 4,
            executionTime: Math.max(...results.map(r => r.executionTime)),
            details: { operacionesExitosas: successCount, totalOperaciones: 5 },
            scores: { D: 0, I: 0, CS: 0, TF: 0 } // Placeholder
          };
          
          testResult.scores = this.calculateIndividualScores(testResult, { D: 2, I: 4, CS: 3, TF: 5 }, 'stress');
          return testResult;
        }
      }
    ];
  }

  public async runTestSuite(): Promise<TestSuite> {
    const tests = this.getTestDefinitions();
    const testSuite: TestSuite = {
      id: `suite-${Date.now()}`,
      name: 'Pruebas de Base de Datos CowTracker',
      tests,
      results: [],
      overallScore: { D: 0, I: 0, CS: 0, TF: 0 },
      successRate: 0,
      executionTime: 0,
      status: 'running'
    };

    const startTime = Date.now();
    
    try {
      // Ejecutar todas las pruebas
      for (const test of tests) {
        const result = await test.execute();
        testSuite.results.push(result);
      }

      // Calcular métricas
      const successfulTests = testSuite.results.filter(r => r.success).length;
      testSuite.successRate = (successfulTests / tests.length) * 100;
      testSuite.executionTime = Date.now() - startTime;
      
      // Calcular puntuación general
      testSuite.overallScore = this.calculateOverallScore(testSuite.results, tests);
      testSuite.status = 'completed';
      
      // Guardar en historial
      this.testHistory.push(this.generateReport(testSuite));
      
      return testSuite;
    } catch (error) {
      testSuite.status = 'failed';
      testSuite.executionTime = Date.now() - startTime;
      return testSuite;
    }
  }

  private calculateOverallScore(results: TestResult[], tests: DatabaseTest[]): TestCriteria {
    const successRate = (results.filter(r => r.success).length / results.length) * 100;
    
    // Calcular puntuación según los criterios especificados
    let baseScore = 1;
    if (successRate >= 96) baseScore = 5;
    else if (successRate >= 81) baseScore = 4;
    else if (successRate >= 61) baseScore = 3;
    else if (successRate >= 41) baseScore = 2;
    else baseScore = 1;

    // Ajustar por categorías específicas
    const avgExecutionTime = results.reduce((acc, r) => acc + r.executionTime, 0) / results.length;
    
    return {
      D: Math.max(1, Math.min(5, baseScore - (avgExecutionTime > 1000 ? 1 : 0))), // Desempeño
      I: Math.max(1, Math.min(5, baseScore)), // Integridad
      CS: Math.max(1, Math.min(5, baseScore - (avgExecutionTime > 2000 ? 1 : 0))), // Carga del sistema
      TF: Math.max(1, Math.min(5, baseScore)) // Tolerancia a fallos
    };
  }

  private generateReport(testSuite: TestSuite): TestReport {
    const passedTests = testSuite.results.filter(r => r.success).length;
    const failedTests = testSuite.results.length - passedTests;
    const avgExecutionTime = testSuite.results.reduce((acc, r) => acc + r.executionTime, 0) / testSuite.results.length;
    
    const recommendations = this.generateRecommendations(testSuite);
    
    return {
      suiteId: testSuite.id,
      timestamp: new Date(),
      results: testSuite.results,
      overallScore: testSuite.overallScore,
      successRate: testSuite.successRate,
      totalTests: testSuite.results.length,
      passedTests,
      failedTests,
      averageExecutionTime: avgExecutionTime,
      recommendations
    };
  }

  private generateRecommendations(testSuite: TestSuite): string[] {
    const recommendations: string[] = [];
    
    if (testSuite.successRate < 80) {
      recommendations.push('Considere optimizar las consultas de base de datos');
    }
    
    if (testSuite.overallScore.D < 3) {
      recommendations.push('El rendimiento del sistema necesita mejoras');
    }
    
    if (testSuite.overallScore.I < 4) {
      recommendations.push('Revisar la integridad de los datos');
    }
    
    if (testSuite.overallScore.CS < 3) {
      recommendations.push('El sistema presenta problemas bajo carga');
    }
    
    if (testSuite.overallScore.TF < 4) {
      recommendations.push('Mejorar la tolerancia a fallos del sistema');
    }
    
    const avgTime = testSuite.results.reduce((acc, r) => acc + r.executionTime, 0) / testSuite.results.length;
    if (avgTime > 1000) {
      recommendations.push('Optimizar tiempos de respuesta');
    }
    
    return recommendations;
  }

  public getTestHistory(): TestReport[] {
    return this.testHistory;
  }

  public getLastReport(): TestReport | null {
    return this.testHistory.length > 0 ? this.testHistory[this.testHistory.length - 1] : null;
  }
}

export default new TestService(); 