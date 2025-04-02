import { Platform } from 'react-native';

/**
 * Genera estilos de sombra compatibles entre plataformas
 * @param {Object} options - Opciones de configuración de la sombra
 * @param {number} options.elevation - Elevación para Android (default: 2)
 * @param {number} options.height - Altura de la sombra (default: 2)
 * @param {number} options.opacity - Opacidad de la sombra (default: 0.1)
 * @param {number} options.radius - Radio de la sombra (default: 4)
 * @returns {Object} Estilos de sombra compatibles con la plataforma
 */
export const getShadowStyle = ({
  elevation = 2,
  height = 2,
  opacity = 0.1,
  radius = 4
} = {}) => {
  return Platform.OS === 'web'
    ? {
        boxShadow: `0px ${height}px ${radius}px rgba(0, 0, 0, ${opacity})`
      }
    : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height },
        shadowOpacity: opacity,
        shadowRadius: radius,
        elevation
      };
}; 