import React from 'react';
import { useAuth } from '../components/AuthContext';
import HomeScreenAdmin from './HomeScreen';
import HomeScreenTrabajador from './HomeScreenTrab';
import HomeScreenVeterinario from './HomeScreenVet';

const HomeScreenRouter = () => {
  const { isAdmin, isTrabajador, isVeterinario, userInfo } = useAuth();

  console.log('=== HomeScreenRouter DEBUG ===');
  console.log('userInfo completo:', JSON.stringify(userInfo, null, 2));
  console.log('userInfo.id_rol:', userInfo?.id_rol);
  console.log('userInfo.rol:', userInfo?.rol);
  console.log('userInfo.role:', userInfo?.role);
  console.log('userInfo.rol?.nombre_rol:', userInfo?.rol?.nombre_rol);
  console.log('userInfo.rol?.id_rol:', userInfo?.rol?.id_rol);
  console.log('isAdmin():', isAdmin());
  console.log('isTrabajador():', isTrabajador());
  console.log('isVeterinario():', isVeterinario());
  console.log('=== FIN DEBUG ===');

  // Función para extraer el rol del token JWT
  const getRoleFromToken = () => {
    try {
      if (!userInfo?.token) return null;
      
      // Decodificar el JWT (solo la parte del payload)
      const payload = userInfo.token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      
      console.log('🔍 Rol extraído del token JWT:', decodedPayload.user_metadata?.role);
      return decodedPayload.user_metadata?.role;
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  };

  // Lógica más robusta para determinar el rol
  const determineRole = () => {
    if (!userInfo) {
      console.log('❌ No hay userInfo');
      return 'admin'; // default
    }

    // NUEVO: Verificar por el rol en el token JWT
    const tokenRole = getRoleFromToken();
    if (tokenRole === 'veterinario') {
      console.log('✅ Detectado veterinario por token JWT');
      return 'veterinario';
    }
    if (tokenRole === 'trabajador') {
      console.log('✅ Detectado trabajador por token JWT');
      return 'trabajador';
    }
    if (tokenRole === 'admin') {
      console.log('✅ Detectado admin por token JWT');
      return 'admin';
    }

    // Verificar por el campo 'role' que está presente en userInfo
    if (userInfo.role === 'veterinario') {
      console.log('✅ Detectado veterinario por userInfo.role === "veterinario"');
      return 'veterinario';
    }
    if (userInfo.role === 'trabajador') {
      console.log('✅ Detectado trabajador por userInfo.role === "trabajador"');
      return 'trabajador';
    }
    if (userInfo.role === 'admin') {
      console.log('✅ Detectado admin por userInfo.role === "admin"');
      return 'admin';
    }

    // Verificar por id_rol directo
    if (userInfo.id_rol === 3) {
      console.log('✅ Detectado veterinario por id_rol === 3');
      return 'veterinario';
    }
    if (userInfo.id_rol === 2) {
      console.log('✅ Detectado trabajador por id_rol === 2');
      return 'trabajador';
    }
    if (userInfo.id_rol === 1) {
      console.log('✅ Detectado admin por id_rol === 1');
      return 'admin';
    }

    // Verificar por nombre_rol en el objeto rol
    if (userInfo.rol?.nombre_rol === 'veterinario') {
      console.log('✅ Detectado veterinario por rol.nombre_rol');
      return 'veterinario';
    }
    if (userInfo.rol?.nombre_rol === 'user' || userInfo.rol?.nombre_rol === 'trabajador') {
      console.log('✅ Detectado trabajador por rol.nombre_rol');
      return 'trabajador';
    }
    if (userInfo.rol?.nombre_rol === 'admin') {
      console.log('✅ Detectado admin por rol.nombre_rol');
      return 'admin';
    }

    // Verificar usando las funciones del contexto
    if (isVeterinario()) {
      console.log('✅ Detectado veterinario por función isVeterinario()');
      return 'veterinario';
    }
    if (isTrabajador()) {
      console.log('✅ Detectado trabajador por función isTrabajador()');
      return 'trabajador';
    }
    if (isAdmin()) {
      console.log('✅ Detectado admin por función isAdmin()');
      return 'admin';
    }

    // Si el role es "user" pero no se detectó como trabajador, podría ser admin por defecto
    if (userInfo.role === 'user') {
      console.log('⚠️ userInfo.role es "user", asumiendo admin por defecto');
      return 'admin';
    }

    console.log('⚠️ No se pudo determinar el rol, usando admin por defecto');
    return 'admin';
  };

  const role = determineRole();

  // Renderizar el componente correspondiente
  switch (role) {
    case 'veterinario':
      console.log('🏥 Renderizando HomeScreenVeterinario');
      return <HomeScreenVeterinario />;
    case 'trabajador':
      console.log('👷 Renderizando HomeScreenTrabajador');
      return <HomeScreenTrabajador />;
    case 'admin':
    default:
      console.log('👨‍💼 Renderizando HomeScreenAdmin');
      return <HomeScreenAdmin />;
  }
};

export default HomeScreenRouter; 