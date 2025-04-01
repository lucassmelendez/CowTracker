import { StyleSheet } from 'react-native';
import { getShadowStyle } from '../utils/styles';
import { colors } from './commonStyles';

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  menuContainer: {
    flex: 1,
    padding: 15,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  menuItem: {
    backgroundColor: colors.white,
    width: '48%',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    ...getShadowStyle(),
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  menuDescription: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    ...getShadowStyle(),
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    width: '48%',
    backgroundColor: colors.inputBg,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
  },
}); 