// ==================== EXPORTACIONES DE TIPOS ====================
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
  is_premium?: boolean;
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
  cattleId: string;
  date: string;
  treatment: string;
  veterinarian: string;
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
  loading: boolean;
}

// ==================== UTILIDADES DE ROLES ====================
export const USER_ROLES = {
  ADMIN: 'admin' as const,       
  WORKER: 'trabajador' as const, 
  VET: 'veterinario' as const    
};

export const hasRole = (userInfo: UserInfo | null, role: string): boolean => {
  if (!userInfo || !userInfo.rol) return false;
  
  if (userInfo.rol.nombre_rol === USER_ROLES.ADMIN) return true;
  
  return userInfo.rol.nombre_rol === role;
};

export const getRoleName = (role: string): string => {
  switch (role) {
    case USER_ROLES.ADMIN:
      return 'Ganadero';
    case USER_ROLES.WORKER:
      return 'Trabajador';
    case USER_ROLES.VET:
      return 'Veterinario';
    default:
      return 'Usuario';
  }
};

export const canManageFarm = (userInfo: UserInfo | null, farmOwnerId: string): boolean => {
  if (!userInfo) return false;
  
  if (userInfo.uid === farmOwnerId) return true;
  
  if (userInfo.rol?.nombre_rol === USER_ROLES.ADMIN) return true;
  
  return false;
};

export const canViewFarm = (userInfo: UserInfo | null, farmId: string, userFarms: Farm[]): boolean => {
  if (!userInfo) return false;
  
  if (userInfo.rol?.nombre_rol === USER_ROLES.ADMIN) return true;
  
  return userFarms && userFarms.some(farm => farm._id === farmId);
};

// ==================== EXPORTACIONES DE API Y CONFIGURACIÓN ====================
// Exportar la API consolidada como default y named export
export { default as api } from './config/api';
export { default } from './config/api';

// Exportar configuraciones
export { supabase } from './config/supabase';
export { 
  API_URL, 
  API_CONFIG, 
  buildApiUrl, 
  fetchWithCORS, 
  WEBPAY_URLS,
  PROD_API_URL,
  LOCAL_IP,
  isProd 
} from './config/api'; 