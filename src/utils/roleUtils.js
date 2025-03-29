// Utilidades para la gestión de roles de usuario

// Constantes de roles
export const USER_ROLES = {
  ADMIN: 'admin',       // Ganadero/Administrador
  WORKER: 'trabajador', // Trabajador
  VET: 'veterinario'    // Veterinario
};

// Función para verificar si un usuario tiene un rol específico
export const hasRole = (userInfo, role) => {
  if (!userInfo || !userInfo.role) return false;
  
  // Si el usuario es admin, tiene acceso a todo
  if (userInfo.role === USER_ROLES.ADMIN) return true;
  
  // Verificar si el usuario tiene el rol específico
  return userInfo.role === role;
};

// Función para obtener el nombre legible de un rol
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

// Función para verificar si un usuario puede gestionar una granja
export const canManageFarm = (userInfo, farmOwnerId) => {
  if (!userInfo) return false;
  
  // El propietario de la granja siempre puede gestionarla
  if (userInfo.uid === farmOwnerId) return true;
  
  // Los administradores pueden gestionar cualquier granja
  if (userInfo.role === USER_ROLES.ADMIN) return true;
  
  // Otros roles no pueden gestionar granjas por defecto
  return false;
};

// Función para verificar si un usuario puede ver una granja
export const canViewFarm = (userInfo, farmId, userFarms) => {
  if (!userInfo) return false;
  
  // Administradores pueden ver todas las granjas
  if (userInfo.role === USER_ROLES.ADMIN) return true;
  
  // Trabajadores y veterinarios solo pueden ver granjas a las que están asignados
  return userFarms && userFarms.some(farm => farm._id === farmId);
};