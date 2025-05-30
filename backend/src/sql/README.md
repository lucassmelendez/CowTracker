# Corrección de Estructura de Base de Datos en Supabase

Este directorio contiene los scripts SQL necesarios para corregir y mantener la estructura de base de datos de CowTracker en Supabase.

## El Problema

Cuando intentas registrar un usuario, puede aparecer este error:

```
Error: Could not find the 'created_at' column of 'usuario' in the schema cache
```

Este error ocurre porque el código inicialmente esperaba que la tabla `usuario` tuviera columnas `created_at` y `updated_at`, pero la estructura actual de la base de datos no las tiene.

## La Solución

Hemos adaptado el código para trabajar con la estructura actual de la base de datos como se muestra en el diagrama de tablas. El script SQL `esquema_supabase.sql` ha sido creado para asegurar que todas las tablas y relaciones estén correctamente configuradas.

## Cómo aplicar la solución

1. Accede a tu proyecto de Supabase (https://eisceuexbwpdpjxuskgz.supabase.co)
2. Ve a la sección "SQL Editor"
3. Crea una nueva consulta
4. Copia y pega el contenido completo del archivo `esquema_supabase.sql`
5. Ejecuta la consulta

Este script:
- Crea las tablas si no existen
- Mantiene la estructura actual sin añadir columnas `created_at` o `updated_at`
- Configura correctamente las relaciones entre tablas
- Inserta datos iniciales para roles, géneros y estados de salud
- Crea una vista `usuario_completo` para facilitar consultas
- Configura políticas de seguridad (RLS)

## Estructura de las tablas

La estructura actual de las tablas en la base de datos es:

- **usuario**: Almacena información personal sin columnas `created_at` o `updated_at`
- **autentificar**: Almacena correo (email) y contraseña
- **rol**: Define los roles de usuario (admin, user, veterinario)
- **finca**: Información de fincas
- **ganado**: Información de ganado
- **informacion_veterinaria**: Registros veterinarios
- **estado_salud**: Estados de salud del ganado
- **genero**: Géneros del ganado (Macho/Hembra)
- **produccion**: Información de producción

## Después de aplicar el script

Después de aplicar el script SQL, reinicia el servidor backend para que los cambios surtan efecto. El código ha sido adaptado para trabajar con esta estructura de tablas, por lo que ya no aparecerá el error de la columna `created_at`. 