# Organización de Estilos en CowTracker

## Estructura de Carpetas

```
src/
├── styles/             # Todos los archivos de estilos
│   ├── commonStyles.js # Estilos comunes reutilizables
│   ├── loginStyles.js  # Estilos específicos de login
│   ├── registerStyles.js # Estilos específicos de registro
│   ├── homeStyles.js   # Estilos de la pantalla de inicio
│   └── ...             # Otros archivos de estilos específicos
├── screens/            # Componentes de pantalla
└── ...
```

## Enfoque de Organización

### Estilos Comunes (commonStyles.js)

Este archivo contiene:
- Paleta de colores
- Estilos de formulario reutilizables
- Estilos de tarjetas
- Estilos de botones comunes
- Estilos de encabezados
- Estilos de listas

### Estilos Específicos por Pantalla

Cada pantalla tiene su propio archivo de estilos correspondiente:
- `loginStyles.js` para `LoginScreen.js`
- `registerStyles.js` para `RegisterScreen.js`
- `homeStyles.js` para `HomeScreen.js`
- etc.

## Buenas Prácticas

1. **Reutiliza los estilos comunes** cuando sea posible
2. **Utiliza la paleta de colores definida** en `commonStyles.js` para mantener consistencia
3. **Crea nuevos estilos específicos** solo cuando sea necesario
4. **Mantén un estilo coherente** en toda la aplicación

## Uso de Estilos

Importación de estilos comunes:
```javascript
import { colors, formStyles, buttonStyles } from '../styles/commonStyles';
```

Importación de estilos específicos:
```javascript
import { loginStyles } from '../styles/loginStyles';
```

## Ventajas de Esta Organización

- **Mantenibilidad**: Facilita los cambios a gran escala
- **Consistencia**: Garantiza una apariencia coherente
- **Reducción de código duplicado**: Promueve la reutilización
- **Separación de responsabilidades**: Separa la lógica del diseño 