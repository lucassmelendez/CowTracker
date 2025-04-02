export const USER_ROLES = {
  ADMIN: 'admin',       
  WORKER: 'trabajador', 
  VET: 'veterinario'    
};

export const hasRole = (userInfo, role) => {
  if (!userInfo || !userInfo.role) return false;
  
  if (userInfo.role === USER_ROLES.ADMIN) return true;
  
  return userInfo.role === role;
};

export const getRoleName = (role) => {
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

export const canManageFarm = (userInfo, farmOwnerId) => {
  if (!userInfo) return false;
  
  if (userInfo.uid === farmOwnerId) return true;
  
  if (userInfo.role === USER_ROLES.ADMIN) return true;
  
  return false;
};

export const canViewFarm = (userInfo, farmId, userFarms) => {
  if (!userInfo) return false;
  
  if (userInfo.role === USER_ROLES.ADMIN) return true;
  
  return userFarms && userFarms.some(farm => farm._id === farmId);
};