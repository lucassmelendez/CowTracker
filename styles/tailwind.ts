// Configuración centralizada de estilos usando Tailwind CSS
export const tw = {
  // Contenedores principales
  container: 'flex-1 bg-gray-50',
  scrollContainer: 'flex-grow justify-center p-5',
  
  // Tarjetas y contenedores de formularios
  card: 'bg-white rounded-lg p-5 shadow-sm border border-gray-100',
  formContainer: 'bg-white rounded-lg p-5 shadow-lg',
  
  // Textos y títulos
  title: 'text-3xl font-bold text-gray-800 mb-2',
  subtitle: 'text-base text-gray-600',
  label: 'text-base font-semibold text-gray-800 mb-1',
  errorText: 'text-red-500 text-sm text-center mb-2',
  
  // Inputs
  input: 'bg-gray-50 h-12 rounded-lg px-4 mb-4 border border-gray-200 text-base',
  inputFocused: 'border-green-500',
  
  // Botones
  primaryButton: 'bg-green-600 h-12 rounded-lg justify-center items-center mt-4',
  primaryButtonDisabled: 'bg-gray-400 opacity-70',
  primaryButtonText: 'text-white text-base font-semibold',
  
  secondaryButton: 'bg-gray-100 h-12 rounded-lg justify-center items-center mt-4 border border-gray-300',
  secondaryButtonText: 'text-gray-600 text-base font-semibold',
  
  // Header y navegación
  header: 'bg-green-600',
  headerTitle: 'font-bold text-white',
  
  // Logo y branding
  logoContainer: 'items-center mb-10',
  logoEmoji: 'text-6xl mb-2',
  
  // Estados de carga
  loadingContainer: 'flex-1 justify-center items-center',
  loadingText: 'mt-2 text-gray-600',
  
  // Listas y elementos
  listItem: 'bg-white p-4 mb-2 rounded-lg shadow-sm border border-gray-100',
  listItemTitle: 'text-lg font-semibold text-gray-800',
  listItemSubtitle: 'text-sm text-gray-600',
  
  // Modales
  modalOverlay: 'flex-1 justify-center items-center bg-black bg-opacity-50',
  modalContent: 'bg-white rounded-lg p-6 mx-4 max-w-sm w-full',
  modalTitle: 'text-xl font-bold text-gray-800 mb-4 text-center',
  
  // Badges y etiquetas
  badge: 'px-3 py-1 rounded-full text-xs font-medium',
  badgeSuccess: 'bg-green-100 text-green-800',
  badgeWarning: 'bg-yellow-100 text-yellow-800',
  badgeError: 'bg-red-100 text-red-800',
  badgeInfo: 'bg-blue-100 text-blue-800',
  
  // Separadores
  divider: 'h-px bg-gray-200 my-4',
  
  // Espaciado
  spacing: {
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  },
  
  margin: {
    xs: 'm-1',
    sm: 'm-2',
    md: 'm-4',
    lg: 'm-6',
    xl: 'm-8',
  },
  
  // Colores del tema
  colors: {
    primary: '#27ae60',
    primaryDark: '#219a52',
    secondary: '#95a5a6',
    success: '#27ae60',
    warning: '#f39c12',
    error: '#e74c3c',
    info: '#3498db',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    }
  }
};

// Función helper para convertir clases de Tailwind a StyleSheet
export const createStyles = (classes: string) => {
  const classArray = classes.split(' ');
  const styles: any = {};
  
  classArray.forEach(className => {
    switch (className) {
      // Flex
      case 'flex-1':
        styles.flex = 1;
        break;
      case 'flex-row':
        styles.flexDirection = 'row';
        break;
      case 'flex-col':
        styles.flexDirection = 'column';
        break;
      case 'justify-center':
        styles.justifyContent = 'center';
        break;
      case 'justify-between':
        styles.justifyContent = 'space-between';
        break;
      case 'items-center':
        styles.alignItems = 'center';
        break;
      case 'items-start':
        styles.alignItems = 'flex-start';
        break;
      case 'items-end':
        styles.alignItems = 'flex-end';
        break;
      case 'flex-grow':
        styles.flexGrow = 1;
        break;
      case 'flex-wrap':
        styles.flexWrap = 'wrap';
        break;
        
      // Padding
      case 'p-1':
        styles.padding = 4;
        break;
      case 'p-2':
        styles.padding = 8;
        break;
      case 'p-4':
        styles.padding = 16;
        break;
      case 'p-5':
        styles.padding = 20;
        break;
      case 'p-6':
        styles.padding = 24;
        break;
      case 'pt-10':
        styles.paddingTop = 40;
        break;
      case 'px-3':
        styles.paddingHorizontal = 12;
        break;
      case 'px-4':
        styles.paddingHorizontal = 16;
        break;
      case 'px-2':
        styles.paddingHorizontal = 8;
        break;
      case 'px-5':
        styles.paddingHorizontal = 20;
        break;
      case 'py-1':
        styles.paddingVertical = 4;
        break;
      case 'py-2':
        styles.paddingVertical = 8;
        break;
      case 'py-12':
        styles.paddingVertical = 48;
        break;
      case 'py-3':
        styles.paddingVertical = 12;
        break;
      case 'px-3':
        styles.paddingHorizontal = 12;
        break;
        
      // Margin
      case 'm-1':
        styles.margin = 4;
        break;
      case 'm-2':
        styles.margin = 8;
        break;
      case 'm-4':
        styles.margin = 16;
        break;
      case 'm-5':
        styles.margin = 20;
        break;
      case 'mb-1':
        styles.marginBottom = 4;
        break;
      case 'mb-2':
        styles.marginBottom = 8;
        break;
      case 'mb-4':
        styles.marginBottom = 16;
        break;
      case 'mb-10':
        styles.marginBottom = 40;
        break;
      case 'mb-3':
        styles.marginBottom = 12;
        break;
      case 'mb-8':
        styles.marginBottom = 32;
        break;
      case 'mb-5':
        styles.marginBottom = 20;
        break;
      case 'mt-1':
        styles.marginTop = 4;
        break;
      case 'mt-2':
        styles.marginTop = 8;
        break;
      case 'mt-4':
        styles.marginTop = 16;
        break;
      case 'mt-6':
        styles.marginTop = 24;
        break;
      case 'mx-4':
        styles.marginHorizontal = 16;
        break;
      case 'mr-2':
        styles.marginRight = 8;
        break;
      case 'ml-2':
        styles.marginLeft = 8;
        break;
        
      // Width & Height
      case 'h-12':
        styles.height = 48;
        break;
      case 'h-20':
        styles.height = 80;
        break;
      case 'h-px':
        styles.height = 1;
        break;
      case 'w-full':
        styles.width = '100%';
        break;
      case 'w-48%':
        styles.width = '48%';
        break;
      case 'w-14':
        styles.width = 56;
        break;
      case 'h-14':
        styles.height = 56;
        break;
      case 'w-20':
        styles.width = 80;
        break;
      case 'h-20':
        styles.height = 80;
        break;
      case 'max-w-sm':
        styles.maxWidth = 384;
        break;
      case 'max-h-64':
        styles.maxHeight = 256;
        break;
      case 'max-h-96':
        styles.maxHeight = 384;
        break;
        
      // Background Colors
      case 'bg-white':
        styles.backgroundColor = '#ffffff';
        break;
      case 'bg-gray-50':
        styles.backgroundColor = '#f9fafb';
        break;
      case 'bg-gray-100':
        styles.backgroundColor = '#f3f4f6';
        break;
      case 'bg-gray-400':
        styles.backgroundColor = '#9ca3af';
        break;
      case 'bg-green-600':
        styles.backgroundColor = '#16a34a';
        break;
      case 'bg-green-100':
        styles.backgroundColor = '#dcfce7';
        break;
      case 'bg-red-100':
        styles.backgroundColor = '#fee2e2';
        break;
      case 'bg-yellow-100':
        styles.backgroundColor = '#fef3c7';
        break;
      case 'bg-blue-100':
        styles.backgroundColor = '#dbeafe';
        break;
      case 'bg-blue-50':
        styles.backgroundColor = '#eff6ff';
        break;
      case 'bg-red-50':
        styles.backgroundColor = '#fef2f2';
        break;
      case 'bg-yellow-50':
        styles.backgroundColor = '#fffbeb';
        break;
      case 'bg-green-50':
        styles.backgroundColor = '#f0fdf4';
        break;
      case 'bg-red-500':
        styles.backgroundColor = '#ef4444';
        break;
      case 'bg-yellow-500':
        styles.backgroundColor = '#eab308';
        break;
      case 'bg-gray-300':
        styles.backgroundColor = '#d1d5db';
        break;
      case 'bg-blue-500':
        styles.backgroundColor = '#3b82f6';
        break;
      case 'bg-black':
        styles.backgroundColor = '#000000';
        break;
      case 'bg-opacity-50':
        styles.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        break;
      case 'bg-opacity-75':
        styles.backgroundColor = 'rgba(255, 255, 255, 0.75)';
        break;
        
      // Text Colors
      case 'text-white':
        styles.color = '#ffffff';
        break;
      case 'text-gray-600':
        styles.color = '#4b5563';
        break;
      case 'text-gray-500':
        styles.color = '#6b7280';
        break;
      case 'text-gray-400':
        styles.color = '#9ca3af';
        break;
      case 'text-gray-800':
        styles.color = '#1f2937';
        break;
      case 'text-green-800':
        styles.color = '#166534';
        break;
      case 'text-red-500':
        styles.color = '#ef4444';
        break;
      case 'text-yellow-800':
        styles.color = '#92400e';
        break;
      case 'text-blue-800':
        styles.color = '#1e40af';
        break;
      case 'text-blue-500':
        styles.color = '#3b82f6';
        break;
      case 'text-blue-700':
        styles.color = '#1d4ed8';
        break;
      case 'text-red-700':
        styles.color = '#b91c1c';
        break;
      case 'text-red-800':
        styles.color = '#991b1b';
        break;
      case 'text-yellow-700':
        styles.color = '#a16207';
        break;
      case 'text-yellow-800':
        styles.color = '#92400e';
        break;
      case 'text-green-700':
        styles.color = '#15803d';
        break;
      case 'text-green-600':
        styles.color = '#16a34a';
        break;
        
      // Font Sizes
      case 'text-xs':
        styles.fontSize = 12;
        break;
      case 'text-sm':
        styles.fontSize = 14;
        break;
      case 'text-base':
        styles.fontSize = 16;
        break;
      case 'text-lg':
        styles.fontSize = 18;
        break;
      case 'text-xl':
        styles.fontSize = 20;
        break;
      case 'text-2xl':
        styles.fontSize = 24;
        break;
      case 'text-3xl':
        styles.fontSize = 30;
        break;
      case 'text-6xl':
        styles.fontSize = 60;
        break;
        
      // Font Weight
      case 'font-medium':
        styles.fontWeight = '500';
        break;
      case 'font-semibold':
        styles.fontWeight = '600';
        break;
      case 'font-bold':
        styles.fontWeight = 'bold';
        break;
        
      // Border
      case 'border':
        styles.borderWidth = 1;
        break;
      case 'border-gray-100':
        styles.borderColor = '#f3f4f6';
        break;
      case 'border-gray-200':
        styles.borderColor = '#e5e7eb';
        break;
      case 'border-gray-300':
        styles.borderColor = '#d1d5db';
        break;
      case 'border-green-500':
        styles.borderColor = '#22c55e';
        break;
      case 'border-red-300':
        styles.borderColor = '#fca5a5';
        break;
      case 'border-red-200':
        styles.borderColor = '#fecaca';
        break;
      case 'border-green-300':
        styles.borderColor = '#86efac';
        break;
      case 'border-green-200':
        styles.borderColor = '#bbf7d0';
        break;
      case 'border-yellow-200':
        styles.borderColor = '#fde68a';
        break;
      case 'border-blue-200':
        styles.borderColor = '#bfdbfe';
        break;
        
      // Border Radius
      case 'rounded-lg':
        styles.borderRadius = 8;
        break;
      case 'rounded-full':
        styles.borderRadius = 9999;
        break;
      case 'rounded-t-lg':
        styles.borderTopLeftRadius = 8;
        styles.borderTopRightRadius = 8;
        break;
        
      // Shadow
      case 'shadow-sm':
        styles.shadowColor = '#000';
        styles.shadowOffset = { width: 0, height: 1 };
        styles.shadowOpacity = 0.05;
        styles.shadowRadius = 2;
        styles.elevation = 1;
        break;
      case 'shadow-lg':
        styles.shadowColor = '#000';
        styles.shadowOffset = { width: 0, height: 4 };
        styles.shadowOpacity = 0.1;
        styles.shadowRadius = 6;
        styles.elevation = 5;
        break;
        
      // Text Alignment
      case 'text-center':
        styles.textAlign = 'center';
        break;
        
      // Opacity
      case 'opacity-70':
        styles.opacity = 0.7;
        break;
      case 'opacity-50':
        styles.opacity = 0.5;
        break;
      case 'opacity-90':
        styles.opacity = 0.9;
        break;
      case 'opacity-80':
        styles.opacity = 0.8;
        break;
        
      // Position
      case 'absolute':
        styles.position = 'absolute';
        break;
      case 'inset-0':
        styles.top = 0;
        styles.right = 0;
        styles.bottom = 0;
        styles.left = 0;
        break;
      case 'bottom-5':
        styles.bottom = 20;
        break;
      case 'right-5':
        styles.right = 20;
        break;
        
      // Text alignment
      case 'text-right':
        styles.textAlign = 'right';
        break;
      case 'text-top':
        styles.textAlignVertical = 'top';
        break;
        
      // Gap (for flexbox)
      case 'gap-1':
        styles.gap = 4;
        break;
      case 'gap-2':
        styles.gap = 8;
        break;
      case 'gap-4':
        styles.gap = 16;
        break;
    }
  });
  
  return styles;
}; 