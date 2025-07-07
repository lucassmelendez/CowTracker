// Tipos para el sistema de pruebas de base de datos
export interface TestCriteria {
  D: number; // Desempeño (1-5)
  I: number; // Integridad (1-5)
  CS: number; // Cargas del Sistema (1-5)
  TF: number; // Tolerancia a Fallos (1-5)
}

export interface TestResult {
  id: string;
  success: boolean;
  executionTime: number; // en milisegundos
  errorMessage?: string;
  details?: any;
}

export interface DatabaseTest {
  id: string;
  name: string;
  description: string;
  category: 'concurrency' | 'performance' | 'integrity' | 'backup' | 'stress';
  execute: () => Promise<TestResult>;
  expectedCriteria: TestCriteria;
}

export interface TestSuite {
  id: string;
  name: string;
  tests: DatabaseTest[];
  results: TestResult[];
  overallScore: TestCriteria;
  successRate: number;
  executionTime: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface TestReport {
  suiteId: string;
  timestamp: Date;
  results: TestResult[];
  overallScore: TestCriteria;
  successRate: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  averageExecutionTime: number;
  recommendations: string[];
}

// Enums para categorías de pruebas
export enum TestCategory {
  CONCURRENCY = 'concurrency',
  PERFORMANCE = 'performance',
  INTEGRITY = 'integrity',
  BACKUP = 'backup',
  STRESS = 'stress'
}

// Tipos para simulación de operaciones de base de datos
export interface DatabaseOperation {
  type: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT' | 'BACKUP' | 'RESTORE';
  table: string;
  data?: any;
  condition?: string;
  expectedRows?: number;
}

export interface SimulatedDatabase {
  tables: { [key: string]: any[] };
  operations: DatabaseOperation[];
  isCorrupted: boolean;
  isOverloaded: boolean;
  connectionCount: number;
} 