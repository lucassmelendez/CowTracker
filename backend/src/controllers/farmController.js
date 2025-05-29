const asyncHandler = require('express-async-handler');
const supabaseService = require('../services/supabaseService');

/**
 * @desc    Obtener todas las fincas del usuario
 * @route   GET /api/farms
 * @access  Private
 */
const getFarms = asyncHandler(async (req, res) => {
  try {
    console.log('Buscando fincas para usuario:', req.user.uid);
    
    const farms = await supabaseService.getAllFincas();
    
    res.json(farms);
  } catch (error) {
    console.error('Error al obtener fincas:', error);
    res.status(500);
    throw new Error('Error al obtener fincas: ' + error.message);
  }
});

/**
 * @desc    Obtener una finca por ID
 * @route   GET /api/farms/:id
 * @access  Private
 */
const getFarmById = asyncHandler(async (req, res) => {
  try {
    const farm = await supabaseService.getFincaById(req.params.id);

    if (!farm) {
      res.status(404);
      throw new Error('Finca no encontrada');
    }

    res.json(farm);
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

/**
 * @desc    Crear una nueva finca
 * @route   POST /api/farms
 * @access  Private
 */
const createFarm = asyncHandler(async (req, res) => {
  try {
    const farmData = {
      ...req.body,
      propietario_id: req.user.uid,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newFarm = await supabaseService.createFinca(farmData);
    
    res.status(201).json(newFarm);
  } catch (error) {
    res.status(400);
    throw new Error('Error al crear finca: ' + error.message);
  }
});

/**
 * @desc    Actualizar una finca existente
 * @route   PUT /api/farms/:id
 * @access  Private
 */
const updateFarm = asyncHandler(async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    // No permitir cambiar el propietario
    delete updateData.propietario_id;
    
    const updatedFarm = await supabaseService.updateFinca(req.params.id, updateData);
    
    if (!updatedFarm) {
      res.status(404);
      throw new Error('Finca no encontrada');
    }
    
    res.json(updatedFarm);
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

/**
 * @desc    Eliminar una finca
 * @route   DELETE /api/farms/:id
 * @access  Private
 */
const deleteFarm = asyncHandler(async (req, res) => {
  try {
    const result = await supabaseService.deleteFinca(req.params.id);
    
    if (!result) {
      res.status(404);
      throw new Error('Finca no encontrada');
    }
    
    res.json({ message: 'Finca eliminada' });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(500);
    }
    throw error;
  }
});

/**
 * @desc    Obtener ganado de una finca
 * @route   GET /api/farms/:id/cattle
 * @access  Private
 */
const getFarmCattle = asyncHandler(async (req, res) => {
  try {
    const cattle = await supabaseService.getFincaGanados(req.params.id);
    res.json(cattle);
  } catch (error) {
    res.status(500);
    throw new Error('Error al obtener ganado de la finca: ' + error.message);
  }
});

/**
 * @desc    Obtener trabajadores de una finca
 * @route   GET /api/farms/:id/workers
 * @access  Private
 */
const getFarmWorkers = asyncHandler(async (req, res) => {
  try {
    const workers = await supabaseService.getFincaTrabajadores(req.params.id);
    res.json(workers);
  } catch (error) {
    res.status(500);
    throw new Error('Error al obtener trabajadores de la finca: ' + error.message);
  }
});

/**
 * @desc    Obtener veterinarios de una finca
 * @route   GET /api/farms/:id/veterinarians
 * @access  Private
 */
const getFarmVeterinarians = asyncHandler(async (req, res) => {
  try {
    const vets = await supabaseService.getFincaVeterinarios(req.params.id);
    res.json(vets);
  } catch (error) {
    res.status(500);
    throw new Error('Error al obtener veterinarios de la finca: ' + error.message);
  }
});

/**
 * @desc    Agregar un trabajador a una finca
 * @route   POST /api/farms/:id/workers
 * @access  Private
 */
const addWorkerToFarm = asyncHandler(async (req, res) => {
  try {
    res.status(501).json({ message: 'Funcionalidad no implementada en Supabase' });
  } catch (error) {
    res.status(500);
    throw new Error('Error al agregar trabajador a la finca: ' + error.message);
  }
});

/**
 * @desc    Agregar un veterinario a una finca
 * @route   POST /api/farms/:id/veterinarians
 * @access  Private
 */
const addVeterinarianToFarm = asyncHandler(async (req, res) => {
  try {
    res.status(501).json({ message: 'Funcionalidad no implementada en Supabase' });
  } catch (error) {
    res.status(500);
    throw new Error('Error al agregar veterinario a la finca: ' + error.message);
  }
});

/**
 * @desc    Eliminar un trabajador de una finca
 * @route   DELETE /api/farms/:id/workers/:workerId
 * @access  Private
 */
const removeWorkerFromFarm = asyncHandler(async (req, res) => {
  try {
    res.status(501).json({ message: 'Funcionalidad no implementada en Supabase' });
  } catch (error) {
    res.status(500);
    throw new Error('Error al eliminar trabajador de la finca: ' + error.message);
  }
});

/**
 * @desc    Eliminar un veterinario de una finca
 * @route   DELETE /api/farms/:id/veterinarians/:vetId
 * @access  Private
 */
const removeVeterinarianFromFarm = asyncHandler(async (req, res) => {
  try {
    res.status(501).json({ message: 'Funcionalidad no implementada en Supabase' });
  } catch (error) {
    res.status(500);
    throw new Error('Error al eliminar veterinario de la finca: ' + error.message);
  }
});

module.exports = {
  getFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm,
  getFarmCattle,
  getFarmWorkers,
  getFarmVeterinarians,
  addWorkerToFarm,
  addVeterinarianToFarm,
  removeWorkerFromFarm,
  removeVeterinarianFromFarm
}; 