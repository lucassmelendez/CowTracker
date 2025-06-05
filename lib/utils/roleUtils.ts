import { UserInfo, Farm } from '../types';

// Constantes de roles simplificadas
export const ROLE_IDS = {
  ADMIN: 1,
  TRABAJADOR: 2,
  VETERINARIO: 3
} as const;

export const hasRole = (userInfo: UserInfo | null, roleId: number): boolean => {
  if (!userInfo || !userInfo.id_rol) return false;
  
  // El admin puede hacer todo
  if (userInfo.id_rol === ROLE_IDS.ADMIN) return true;
  
  return userInfo.id_rol === roleId;
};

export const getRoleName = (roleId: number): string => {
  switch (roleId) {
    case ROLE_IDS.ADMIN:
      return 'Ganadero';
    case ROLE_IDS.TRABAJADOR:
      return 'Trabajador';
    case ROLE_IDS.VETERINARIO:
      return 'Veterinario';
    default:
      return 'Usuario';
  }
};

export const canManageFarm = (userInfo: UserInfo | null, farmOwnerId: string): boolean => {
  if (!userInfo) return false;
  
  // El propietario de la granja puede gestionarla
  if (userInfo.uid === farmOwnerId) return true;
  
  // El admin puede gestionar cualquier granja
  if (userInfo.id_rol === ROLE_IDS.ADMIN) return true;
  
  return false;
};

export const canViewFarm = (userInfo: UserInfo | null, farmId: string, userFarms: Farm[]): boolean => {
  if (!userInfo) return false;
  
  // El admin puede ver cualquier granja
  if (userInfo.id_rol === ROLE_IDS.ADMIN) return true;
  
  // Verificar si el usuario tiene acceso a esta granja específica
  return userFarms && userFarms.some(farm => farm._id === farmId);
};

// Funciones de conveniencia para verificar roles específicos
export const isAdmin = (userInfo: UserInfo | null): boolean => {
  return userInfo?.id_rol === ROLE_IDS.ADMIN;
};

export const isTrabajador = (userInfo: UserInfo | null): boolean => {
  return userInfo?.id_rol === ROLE_IDS.TRABAJADOR;
};

export const isVeterinario = (userInfo: UserInfo | null): boolean => {
  return userInfo?.id_rol === ROLE_IDS.VETERINARIO;
}; 