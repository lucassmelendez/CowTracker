import React from 'react';
import { useAuth } from '../components/AuthContext';
import HomeScreenAdmin from './HomeScreen';
import HomeScreenTrabajador from './HomeScreenTrab';
import HomeScreenVeterinario from './HomeScreenVet';

const HomeScreenRouter = () => {
  const { isAdmin, isTrabajador, isVeterinario } = useAuth();

  console.log('HomeScreenRouter - Determinando rol del usuario');
  console.log('isAdmin:', isAdmin());
  console.log('isTrabajador:', isTrabajador());
  console.log('isVeterinario:', isVeterinario());

  // Determinar qué HomeScreen mostrar según el rol
  if (isAdmin()) {
    console.log('Mostrando HomeScreenAdmin');
    return <HomeScreenAdmin />;
  } else if (isTrabajador()) {
    console.log('Mostrando HomeScreenTrabajador');
    return <HomeScreenTrabajador />;
  } else if (isVeterinario()) {
    console.log('Mostrando HomeScreenVeterinario');
    return <HomeScreenVeterinario />;
  } else {
    console.log('Rol no determinado, mostrando HomeScreenAdmin por defecto');
    // Por defecto mostrar el de admin si no se puede determinar el rol
    return <HomeScreenAdmin />;
  }
};

export default HomeScreenRouter; 