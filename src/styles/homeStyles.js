import { StyleSheet } from 'react-native';
import { getShadowStyle } from '../utils/styles';
import { colors } from './commonStyles';

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...getShadowStyle({ 
      height: 6, 
      elevation: 12, 
      opacity: 0.2, 
      radius: 16 
    }),
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textInverse,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  roleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 80,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textInverse,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
  menuContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 24,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  menuItem: {
    backgroundColor: colors.surface,
    width: '48%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...getShadowStyle({ 
      height: 4, 
      elevation: 8, 
      opacity: 0.08, 
      radius: 12 
    }),
    position: 'relative',
    overflow: 'hidden',
  },
  menuItemPressed: {
    backgroundColor: colors.surfaceLight,
    transform: [{ scale: 0.98 }],
    ...getShadowStyle({ 
      height: 2, 
      elevation: 4, 
      opacity: 0.12, 
      radius: 8 
    }),
  },
  menuItemGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  menuIcon: {
    fontSize: 28,
    marginBottom: 0,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  menuDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '400',
  },
  // Estilos para diferentes tipos de menú
  adminMenuItem: {
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  veterinaryMenuItem: {
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  workerMenuItem: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  // Contenedor de estadísticas mejorado
  statsContainerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: -30,
    marginBottom: 20,
    ...getShadowStyle({ 
      height: 6, 
      elevation: 12, 
      opacity: 0.1, 
      radius: 16 
    }),
    borderWidth: 1,
    borderColor: colors.borderLight,
    zIndex: 10,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItemCard: {
    width: '48%',
    backgroundColor: colors.surfaceLight,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statValueCard: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 6,
  },
  statLabelCard: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  // Contenedor de acciones rápidas
  quickActionsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    ...getShadowStyle({ 
      height: 4, 
      elevation: 8, 
      opacity: 0.08, 
      radius: 12 
    }),
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  quickActionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...getShadowStyle({ 
      height: 2, 
      elevation: 4, 
      opacity: 0.2, 
      radius: 6 
    }),
  },
  quickActionButtonSecondary: {
    backgroundColor: colors.secondary,
  },
  quickActionButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  // Estados de carga y error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 18,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    ...getShadowStyle({ 
      height: 2, 
      elevation: 4, 
      opacity: 0.2, 
      radius: 6 
    }),
  },
  retryButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
  // Animaciones y efectos
  fadeIn: {
    opacity: 1,
  },
  fadeOut: {
    opacity: 0.5,
  },
  scaleUp: {
    transform: [{ scale: 1.02 }],
  },
  scaleDown: {
    transform: [{ scale: 0.98 }],
  },
}); 