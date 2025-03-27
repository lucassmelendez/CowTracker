/**
 * Utilidades para manejar roles de usuario y permisos
 */

// Definición de roles disponibles
export const ROLES = {
  ADMIN: 'admin',
  TRABAJADOR: 'trabajador',
  VETERINARIO: 'veterinario',
  USER: 'user'
};

/**
 * Verifica si el usuario tiene un rol específico
 * @param {Object} user - Objeto de usuario con propiedad role
 * @param {string} role - Rol a verificar
 * @returns {boolean} - true si el usuario tiene el rol
 */
export const hasRole = (user, role) => {
  if (!user || !user.role) return false;
  return user.role === role;
};

/**
 * Verifica si el usuario es administrador
 * @param {Object} user - Objeto de usuario
 * @returns {boolean} - true si el usuario es admin
 */
export const isAdmin = (user) => {
  return hasRole(user, ROLES.ADMIN);
};

/**
 * Verifica si el usuario es trabajador
 * @param {Object} user - Objeto de usuario
 * @returns {boolean} - true si el usuario es trabajador
 */
export const isTrabajador = (user) => {
  return hasRole(user, ROLES.TRABAJADOR) || isAdmin(user);
};

/**
 * Verifica si el usuario es veterinario
 * @param {Object} user - Objeto de usuario
 * @returns {boolean} - true si el usuario es veterinario
 */
export const isVeterinario = (user) => {
  return hasRole(user, ROLES.VETERINARIO) || isAdmin(user);
};

/**
 * Obtiene una lista de permisos basados en el rol del usuario
 * @param {Object} user - Objeto de usuario
 * @returns {Object} - Objeto con permisos booleanos
 */
export const getUserPermissions = (user) => {
  const isUserAdmin = isAdmin(user);
  const isUserTrabajador = isTrabajador(user);
  const isUserVeterinario = isVeterinario(user);
  
  return {
    // Permisos de administración
    canManageUsers: isUserAdmin,
    canViewAllData: isUserAdmin,
    
    // Permisos de trabajador
    canManageCattle: isUserTrabajador || isUserAdmin,
    canRecordActivities: isUserTrabajador || isUserAdmin,
    
    // Permisos de veterinario
    canManageHealth: isUserVeterinario || isUserAdmin,
    canPrescribeTreatments: isUserVeterinario || isUserAdmin,
    
    // Permisos generales
    canViewOwnProfile: true,
    canEditOwnProfile: true,
  };
};