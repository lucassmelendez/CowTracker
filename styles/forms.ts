import { createStyles, tw } from './tailwind';

// Estilos específicos para formularios complejos
export const formStyles = {
  // Contenedores de formulario
  formSection: createStyles('bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-100'),
  formSectionTitle: createStyles('text-lg font-semibold text-gray-800 mb-3'),
  
  // Grupos de campos
  fieldGroup: createStyles('mb-4'),
  fieldRow: createStyles('flex-row justify-between items-center mb-3'),
  fieldColumn: createStyles('flex-1 mr-2'),
  fieldColumnLast: createStyles('flex-1'),
  
  // Inputs especializados
  numberInput: createStyles(`${tw.input} text-right`),
  textArea: createStyles(`${tw.input} h-20 text-top`),
  
  // Selectores y pickers
  pickerContainer: createStyles('bg-gray-50 rounded-lg border border-gray-200 mb-4'),
  pickerButton: createStyles('flex-row justify-between items-center p-4'),
  pickerText: createStyles('text-base text-gray-800'),
  pickerIcon: createStyles('text-gray-400'),
  
  // Estados de validación
  inputError: createStyles('border-red-300 bg-red-50'),
  inputSuccess: createStyles('border-green-300 bg-green-50'),
  
  // Botones de acción
  actionButtonsContainer: createStyles('flex-row justify-between mt-6'),
  deleteButton: createStyles('bg-red-500 h-12 rounded-lg justify-center items-center flex-1 mr-2'),
  deleteButtonText: createStyles('text-white text-base font-semibold'),
  saveButton: createStyles(`${tw.primaryButton} flex-1 ml-2`),
  
  // Modales y overlays
  modalContainer: createStyles(tw.modalOverlay),
  modalContent: createStyles(`${tw.modalContent} max-h-96`),
  modalHeader: createStyles('flex-row justify-between items-center mb-4'),
  modalCloseButton: createStyles('p-2'),
  
  // Listas de opciones
  optionsList: createStyles('max-h-64'),
  optionItem: createStyles('p-4 border-b border-gray-100'),
  optionItemSelected: createStyles('bg-green-50 border-green-200'),
  optionText: createStyles('text-base text-gray-800'),
  optionTextSelected: createStyles('text-green-700 font-medium'),
  
  // Estados de carga
  loadingOverlay: createStyles('absolute inset-0 bg-white bg-opacity-75 justify-center items-center'),
  loadingContainer: createStyles('bg-white rounded-lg p-6 items-center shadow-lg'),
  
  // Alertas y notificaciones
  warningContainer: createStyles('bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4'),
  warningTitle: createStyles('text-yellow-800 font-semibold mb-2'),
  warningText: createStyles('text-yellow-700 text-sm'),
  
  errorContainer: createStyles('bg-red-50 border border-red-200 rounded-lg p-4 mb-4'),
  errorTitle: createStyles('text-red-800 font-semibold mb-2'),
  errorText: createStyles('text-red-700 text-sm'),
  
  successContainer: createStyles('bg-green-50 border border-green-200 rounded-lg p-4 mb-4'),
  successTitle: createStyles('text-green-800 font-semibold mb-2'),
  successText: createStyles('text-green-700 text-sm'),
  
  // Badges y etiquetas de estado
  statusBadge: createStyles(`${tw.badge} ${tw.badgeInfo}`),
  activeBadge: createStyles(`${tw.badge} ${tw.badgeSuccess}`),
  inactiveBadge: createStyles(`${tw.badge} ${tw.badgeError}`),
  
  // Separadores y espaciado
  sectionDivider: createStyles(tw.divider),
  
  // Botones especiales
  premiumButton: createStyles('bg-yellow-500 h-12 rounded-lg justify-center items-center mt-4'),
  premiumButtonText: createStyles('text-white text-base font-semibold'),
  
  cancelButton: createStyles('bg-gray-300 h-12 rounded-lg justify-center items-center flex-1 mr-2'),
  cancelButtonText: createStyles('text-gray-700 text-base font-semibold'),
  
  // Contenedores de información
  infoCard: createStyles('bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4'),
  infoTitle: createStyles('text-blue-800 font-semibold mb-2'),
  infoText: createStyles('text-blue-700 text-sm'),
  
  // Headers de sección
  sectionHeader: createStyles('flex-row justify-between items-center mb-4'),
  sectionHeaderTitle: createStyles('text-xl font-bold text-gray-800'),
  sectionHeaderAction: createStyles('text-blue-500 font-medium'),
};

// Función helper para combinar estilos de formulario
export const combineFormStyles = (...styles: any[]) => {
  return Object.assign({}, ...styles);
};

// Estilos para diferentes tipos de input según el estado
export const getInputStyle = (hasError: boolean = false, isSuccess: boolean = false) => {
  let baseStyle = tw.input;
  
  if (hasError) {
    baseStyle += ' border-red-300 bg-red-50';
  } else if (isSuccess) {
    baseStyle += ' border-green-300 bg-green-50';
  }
  
  return createStyles(baseStyle);
};

// Estilos para botones según el estado
export const getButtonStyle = (variant: 'primary' | 'secondary' | 'danger' | 'warning' = 'primary', disabled: boolean = false) => {
  let baseStyle = '';
  
  switch (variant) {
    case 'primary':
      baseStyle = tw.primaryButton;
      break;
    case 'secondary':
      baseStyle = tw.secondaryButton;
      break;
    case 'danger':
      baseStyle = 'bg-red-500 h-12 rounded-lg justify-center items-center mt-4';
      break;
    case 'warning':
      baseStyle = 'bg-yellow-500 h-12 rounded-lg justify-center items-center mt-4';
      break;
  }
  
  if (disabled) {
    baseStyle += ' opacity-50';
  }
  
  return createStyles(baseStyle);
}; 