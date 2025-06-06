// Tipos de usuario y autenticación
export interface UserRole {
  id_rol: number;
  nombre_rol: string;
}

export interface UserInfo {
  uid?: string;
  id?: number;
  id_rol?: number;
  primer_nombre?: string;
  primer_apellido?: string;
  segundo_nombre?: string;
  segundo_apellido?: string;
  email: string;
  name?: string;
  displayName?: string;
  token?: string;
  rol?: UserRole;
  id_premium?: number;
  premium_type?: string;
}

export interface RegisterData {
  primer_nombre: string;
  primer_apellido: string;
  segundo_nombre?: string;
  segundo_apellido?: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateProfileData {
  primer_nombre?: string;
  primer_apellido?: string;
  segundo_nombre?: string;
  segundo_apellido?: string;
  email?: string;
  password?: string;
  id_premium?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Tipos de granja
export interface Farm {
  _id: string;
  name: string;
  location?: string;
  id_finca?: string;
}

// Tipos de ganado
export interface CattleItem {
  id_ganado?: string | number;
  _id?: string;
  numero_identificacion?: string;
  identificationNumber?: string;
  nombre?: string;
  name?: string;
  id_estado_salud?: number;
  id_produccion?: number;
  id_genero?: number;
  precio_compra?: number;
  nota?: string;
  notes?: string;
  finca?: {
    nombre: string;
  };
  farmName?: string;
  farmId?: string;
  tipo?: string;
  type?: string;
  raza?: string;
  breed?: string;
  genero?: {
    descripcion: string;
  };
  estado_salud?: {
    descripcion: string;
  };
  produccion?: {
    descripcion: string;
  };
  gender?: string;
  healthStatus?: string;
}

export interface MedicalRecord {
  _id?: string;
  id?: string;
  id_informacion_veterinaria?: number;
  cattleId?: string;
  id_ganado?: string | number;
  fecha_tratamiento: string;
  fecha_ini_tratamiento?: string;
  fecha_fin_tratamiento?: string;
  diagnostico?: string;
  tratamiento?: string;
  nota?: string;
  medicamento?: string;
  dosis?: string;
  cantidad_horas?: number;
  // Campos de compatibilidad con versiones anteriores
  date?: string;
  treatment?: string;
  veterinarian?: string;
  notes?: string;
  medication?: string;
  dosage?: string;
}

// Tipos de API
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
  error?: string;
}

export interface ApiError {
  status?: number;
  message: string;
  data?: any;
}

// Tipos de configuración
export interface ApiConfig {
  BASE_URL: string;
  ENDPOINTS: {
    WEBPAY: {
      CREATE_TRANSACTION: string;
      RETURN: string;
      STATUS: string;
      CONFIRM: string;
    };
  };
}

// Tipos de roles
export enum UserRoles {
  ADMIN = 'admin',
  WORKER = 'trabajador',
  VET = 'veterinario'
}

// Tipos de pago
export interface PaymentData {
  amount: number;
  currency: string;
  description: string;
}

export interface PaymentResponse {
  success: boolean;
  token?: string;
  url?: string;
  message?: string;
}

export interface CurrencyConversionResponse {
  success: boolean;
  rate?: number;
  convertedAmount?: number;
  message?: string;
}

// Tipos de navegación
export interface NavigationParams {
  id?: string;
  farmId?: string;
  cattleId?: string;
  [key: string]: any;
}

// Tipos de contexto
export interface AuthContextType {
  currentUser: UserInfo | null;
  userInfo: UserInfo | null;
  loading: boolean;
  error: string | null;
  register: (userData: RegisterData) => Promise<any>;
  login: (email: string, password: string) => Promise<UserInfo>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<UserInfo>;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isTrabajador: () => boolean;
  isVeterinario: () => boolean;
}

export interface FarmContextType {
  selectedFarm: Farm | null;
  selectFarm: (farm: Farm) => void;
  clearSelectedFarm: () => void;
  clearAllFarmData: () => Promise<void>;
  loading: boolean;
}

// Tipos de informes
export interface ReportData {
  totalCattle: number;
  totalFarms: number;
  cattleByFarm: Record<string, number>;
  cattleByHealth: Record<string, number>;
  cattleByGender: Record<string, number>;
  cattleByBreed: Record<string, number>;
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
  notes: string;
}

export interface CachedReportData {
  reportData: ReportData;
  cattleDetails: CattleDetail[];
  farmId: string | null;
  farmName: string;
  timestamp: number;
} 