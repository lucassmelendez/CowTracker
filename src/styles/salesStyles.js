import { StyleSheet } from 'react-native';
import { getShadowStyle } from '../utils/styles';
import { colors } from './commonStyles';

export const salesStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  listContainer: {
    padding: 15,
  },
  saleCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    marginBottom: 15,
    ...getShadowStyle(),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  amountContainer: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  amountText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  cardBody: {
    padding: 15,
  },
  customerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  cattleCount: {
    fontSize: 14,
    color: colors.textLight,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewDetails: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 5,
  },
  filterContainer: {
    padding: 15,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  monthsContainer: {
    paddingRight: 20,
  },
  monthButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: colors.background,
  },
  selectedMonthButton: {
    backgroundColor: colors.primary,
  },
  monthText: {
    color: colors.text,
  },
  selectedMonthText: {
    color: colors.white,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 5,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...getShadowStyle(),
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: 10,
    ...getShadowStyle(),
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  detailRow: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    width: '30%',
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  detailValue: {
    width: '70%',
    fontSize: 16,
    color: colors.text,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    margin: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: colors.text,
  },
  itemId: {
    fontSize: 14,
    color: colors.textLight,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  totalContainer: {
    padding: 15,
    alignItems: 'flex-end',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  formGroup: {
    margin: 15,
  },
  formLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    padding: 10,
    backgroundColor: colors.background,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    padding: 10,
    backgroundColor: colors.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  selectCattleButton: {
    backgroundColor: colors.secondary,
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  selectCattleText: {
    color: colors.white,
    fontWeight: '600',
  },
  selectedCattleContainer: {
    marginTop: 10,
  },
  selectedCattleCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 15,
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textLight,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  cattleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedCattle: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },
  cattleInfo: {
    flex: 1,
  },
  cattleName: {
    fontSize: 16,
    color: colors.text,
  },
  cattleId: {
    fontSize: 14,
    color: colors.textLight,
  },
  cattlePriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cattlePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: 10,
  },
}); 