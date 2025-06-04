import { UserInfo, Farm, UserRoles } from '../types';

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