const { supabase } = require('../config/supabase');

/**
 * Middleware para verificar la autenticación con Supabase
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función siguiente
 * @returns {void}
 */
const supabaseAuth = async (req, res, next) => {
  try {
    // Verificar si hay un token de autenticación
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado. Se requiere un token de autenticación.'
      });
    }
    
    // Extraer el token
    const token = authHeader.split(' ')[1];
    
    // Verificar el token con Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado.'
      });
    }
    
    // Agregar información del usuario a la solicitud
    req.user = {
      uid: data.user.id,
      email: data.user.email,
      role: data.user.user_metadata?.role || 'user'
    };
    
    // Verificar si se requiere un rol específico
    if (req.requiredRole && req.user.role !== req.requiredRole && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere rol de ${req.requiredRole}.`
      });
    }
    
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar la autenticación.'
    });
  }
};

/**
 * Middleware para requerir rol de administrador
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función siguiente
 * @returns {void}
 */
const requireAdmin = (req, res, next) => {
  req.requiredRole = 'admin';
  next();
};

/**
 * Middleware para requerir rol de veterinario
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función siguiente
 * @returns {void}
 */
const requireVeterinario = (req, res, next) => {
  req.requiredRole = 'veterinario';
  next();
};

/**
 * Middleware para requerir cualquier rol autenticado
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función siguiente
 * @returns {void}
 */
const requireAuth = (req, res, next) => {
  next();
};

module.exports = {
  supabaseAuth,
  requireAdmin,
  requireVeterinario,
  requireAuth
}; 