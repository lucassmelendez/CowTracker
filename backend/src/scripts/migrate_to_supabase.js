/**
 * Script para migrar datos de Firebase a Supabase
 * 
 * Uso: node migrate_to_supabase.js
 */

const { db: firebaseDb } = require('../config/firebase');
const { supabase } = require('../config/supabase');
require('dotenv').config();

console.log('Iniciando migración de datos de Firebase a Supabase...');

// Función para migrar datos de roles
async function migrateRoles() {
  try {
    console.log('Migrando roles...');
    
    // Los roles ya están predefinidos en Supabase, solo verificamos que existan
    const { data, error } = await supabase.from('rol').select('*');
    
    if (error) {
      throw error;
    }
    
    if (data.length === 0) {
      // Insertar roles básicos si no existen
      const roles = [
        { descripcion: 'admin' },
        { descripcion: 'user' },
        { descripcion: 'veterinario' }
      ];
      
      for (const role of roles) {
        await supabase.from('rol').insert(role);
      }
      
      console.log('- Roles básicos creados');
    } else {
      console.log(`- ${data.length} roles ya existen en Supabase`);
    }
    
    return true;
  } catch (error) {
    console.error('Error al migrar roles:', error);
    return false;
  }
}

// Función para migrar usuarios
async function migrateUsers() {
  try {
    console.log('Migrando usuarios...');
    
    // Obtener usuarios de Firebase
    const snapshot = await firebaseDb.collection('users').get();
    const users = [];
    
    snapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`- ${users.length} usuarios encontrados en Firebase`);
    
    // Migrar cada usuario
    let migratedCount = 0;
    
    for (const user of users) {
      // Verificar si ya existe en Supabase por email
      const { data: existingAuth } = await supabase
        .from('autentificar')
        .select('id_autentificar, correo')
        .eq('correo', user.email)
        .maybeSingle();
      
      if (existingAuth) {
        console.log(`- Usuario con email ${user.email} ya existe en Supabase`);
        continue;
      }
      
      // Crear usuario en Supabase Auth
      // NOTA: Este paso debería hacerse usando la API Admin o manualmente
      // ya que necesitamos crear los usuarios con las mismas contraseñas
      console.log(`- IMPORTANTE: Debe crear manualmente el usuario ${user.email} en Supabase Auth`);
      
      // Para fines de testing, generamos un UUID ficticio para este usuario
      const mockUuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      
      // Insertar en autentificar (en producción, esto se haría automáticamente con el trigger)
      await supabase.from('autentificar').insert({
        id_autentificar: mockUuid,
        correo: user.email,
        contrasena: '**migrado-desde-firebase**'
      });
      
      // Mapear rol
      let rolId = 2; // default: user
      if (user.role === 'admin') rolId = 1;
      else if (user.role === 'veterinario') rolId = 3;
      
      // Insertar en usuario
      await supabase.from('usuario').insert({
        primer_nombre: user.primer_nombre || '',
        segundo_nombre: user.segundo_nombre || '',
        primer_apellido: user.primer_apellido || '',
        segundo_apellido: user.segundo_apellido || '',
        id_autentificar: mockUuid,
        id_rol: rolId
      });
      
      migratedCount++;
    }
    
    console.log(`- ${migratedCount} usuarios migrados a Supabase`);
    return true;
  } catch (error) {
    console.error('Error al migrar usuarios:', error);
    return false;
  }
}

// Función para migrar fincas
async function migrateFarms() {
  try {
    console.log('Migrando fincas...');
    
    // Obtener fincas de Firebase
    const snapshot = await firebaseDb.collection('farms').get();
    const farms = [];
    
    snapshot.forEach(doc => {
      farms.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`- ${farms.length} fincas encontradas en Firebase`);
    
    // Migrar cada finca
    let migratedCount = 0;
    
    for (const farm of farms) {
      // Obtener el ID del propietario en Supabase
      let propietarioId = null;
      
      if (farm.propietario && farm.propietario.email) {
        const { data: usuario } = await supabase
          .from('usuario')
          .select('id')
          .eq('id_autentificar', (
            await supabase
              .from('autentificar')
              .select('id_autentificar')
              .eq('correo', farm.propietario.email)
              .single()
          ).data?.id_autentificar)
          .single();
        
        if (usuario) {
          propietarioId = usuario.id;
        }
      }
      
      // Insertar finca
      await supabase.from('finca').insert({
        nombre: farm.nombre,
        ubicacion: farm.ubicacion || '',
        tamano: farm.area || 0,
        id_usuario: propietarioId,
        created_at: farm.createdAt || new Date().toISOString(),
        updated_at: farm.updatedAt || new Date().toISOString()
      });
      
      migratedCount++;
    }
    
    console.log(`- ${migratedCount} fincas migradas a Supabase`);
    return true;
  } catch (error) {
    console.error('Error al migrar fincas:', error);
    return false;
  }
}

// Función para migrar ganado
async function migrateCattle() {
  try {
    console.log('Migrando ganado...');
    
    // Obtener ganado de Firebase
    const snapshot = await firebaseDb.collection('ganados').get();
    const cattle = [];
    
    snapshot.forEach(doc => {
      cattle.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`- ${cattle.length} ganados encontrados en Firebase`);
    
    // Migrar cada ganado
    let migratedCount = 0;
    
    for (const ganado of cattle) {
      // Buscar finca correspondiente
      let fincaId = null;
      
      if (ganado.finca && ganado.finca.nombre) {
        const { data: finca } = await supabase
          .from('finca')
          .select('id_finca')
          .eq('nombre', ganado.finca.nombre)
          .maybeSingle();
        
        if (finca) {
          fincaId = finca.id_finca;
        }
      }
      
      // Crear o buscar estado de salud
      let estadoSaludId = null;
      
      if (ganado.estado_salud) {
        const { data: estadoSalud } = await supabase
          .from('estado_salud')
          .select('id_estado_salud')
          .eq('descripcion', ganado.estado_salud)
          .maybeSingle();
        
        if (estadoSalud) {
          estadoSaludId = estadoSalud.id_estado_salud;
        } else {
          const { data: nuevoEstado } = await supabase
            .from('estado_salud')
            .insert({ descripcion: ganado.estado_salud })
            .select()
            .single();
          
          estadoSaludId = nuevoEstado.id_estado_salud;
        }
      }
      
      // Crear o buscar género
      let generoId = null;
      
      if (ganado.genero) {
        const { data: genero } = await supabase
          .from('genero')
          .select('id_genero')
          .eq('descripcion', ganado.genero)
          .maybeSingle();
        
        if (genero) {
          generoId = genero.id_genero;
        } else {
          const { data: nuevoGenero } = await supabase
            .from('genero')
            .insert({ descripcion: ganado.genero })
            .select()
            .single();
          
          generoId = nuevoGenero.id_genero;
        }
      }
      
      // Crear información veterinaria si existe
      let infoVetId = null;
      
      if (ganado.informacion_veterinaria) {
        const { data: infoVet } = await supabase
          .from('informacion_veterinaria')
          .insert({
            fecha_tratamiento: ganado.informacion_veterinaria.fecha_tratamiento || new Date().toISOString(),
            diagnostico: ganado.informacion_veterinaria.diagnostico || '',
            tratamiento: ganado.informacion_veterinaria.tratamiento || '',
            nota: ganado.informacion_veterinaria.nota || '',
            created_at: ganado.createdAt || new Date().toISOString(),
            updated_at: ganado.updatedAt || new Date().toISOString()
          })
          .select()
          .single();
        
        infoVetId = infoVet.id_informacion_veterinaria;
      }
      
      // Crear producción si existe
      let produccionId = null;
      
      if (ganado.produccion) {
        const { data: produccion } = await supabase
          .from('produccion')
          .insert({
            descripcion: typeof ganado.produccion === 'string' 
              ? ganado.produccion 
              : (ganado.produccion.descripcion || ''),
            created_at: ganado.createdAt || new Date().toISOString(),
            updated_at: ganado.updatedAt || new Date().toISOString()
          })
          .select()
          .single();
        
        produccionId = produccion.id_produccion;
      }
      
      // Insertar ganado
      await supabase.from('ganado').insert({
        nombre: ganado.nombre,
        numero_identificacion: ganado.numero_identificacion || 0,
        precio_compra: ganado.precio_compra || 0,
        nota: ganado.nota || null,
        id_informacion_veterinaria: infoVetId,
        id_produccion: produccionId,
        id_estado_salud: estadoSaludId,
        id_genero: generoId,
        id_finca: fincaId,
        created_at: ganado.createdAt || new Date().toISOString(),
        updated_at: ganado.updatedAt || new Date().toISOString()
      });
      
      migratedCount++;
    }
    
    console.log(`- ${migratedCount} ganados migrados a Supabase`);
    return true;
  } catch (error) {
    console.error('Error al migrar ganado:', error);
    return false;
  }
}

// Función principal de migración
async function migrateData() {
  try {
    console.log('=== INICIANDO PROCESO DE MIGRACIÓN ===');
    
    // Paso 1: Migrar roles
    const rolesSuccess = await migrateRoles();
    if (!rolesSuccess) {
      console.error('Error en la migración de roles. Abortando...');
      return;
    }
    
    // Paso 2: Migrar usuarios
    const usersSuccess = await migrateUsers();
    if (!usersSuccess) {
      console.error('Error en la migración de usuarios. Abortando...');
      return;
    }
    
    // Paso 3: Migrar fincas
    const farmsSuccess = await migrateFarms();
    if (!farmsSuccess) {
      console.error('Error en la migración de fincas. Abortando...');
      return;
    }
    
    // Paso 4: Migrar ganado
    const cattleSuccess = await migrateCattle();
    if (!cattleSuccess) {
      console.error('Error en la migración de ganado. Abortando...');
      return;
    }
    
    console.log('=== MIGRACIÓN COMPLETADA CON ÉXITO ===');
  } catch (error) {
    console.error('Error en el proceso de migración:', error);
  }
}

// Ejecutar migración
migrateData()
  .then(() => {
    console.log('Proceso de migración finalizado.');
  })
  .catch(error => {
    console.error('Error general en el proceso de migración:', error);
  }); 