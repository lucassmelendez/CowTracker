// Archivo temporal para organizar los cambios
// Versión corregida del handleSubmit con la funcionalidad de notificaciones

const handleSubmit = async () => {
  if (!cattleId) {
    showError('Error', 'No se pudo identificar el ganado');
    return;
  }
  
  try {
    setSubmitting(true);
    
    // Verificar sesión de Supabase antes de hacer la petición
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Error al obtener sesión:', sessionError);
    }
    
    // Datos ajustados según lo que espera el backend con los nuevos campos
    const recordData = {
      fecha: fechaTratamiento.toISOString(),
      diagnostico: diagnostico.trim() || '',
      tratamiento: tratamiento.trim() || '',
      nota: nota.trim() || '',
      fecha_tratamiento: fechaTratamiento.toISOString(),
      fecha_fin_tratamiento: fechaFinTratamiento ? fechaFinTratamiento.toISOString() : undefined,
      medicamento: medicamento.trim() || '',
      dosis: dosis.trim() || '',
      cantidad_horas: cantidadHoras.trim() ? parseInt(cantidadHoras) : undefined,
      // Campos alternativos que el backend puede usar
      descripcion: diagnostico.trim() || '',
      notas: nota.trim() || ''
    };
    
    const id = Array.isArray(cattleId) ? cattleId[0] : cattleId;
    const cattleIdString = id?.toString() || '';
    
    if (!cattleIdString) {
      throw new Error('El ID del ganado no es válido');
    }
    
    const resultado = await api.cattle.addMedicalRecord(cattleIdString, recordData);
    
    // Programar notificación para el fin del tratamiento si tenemos cantidad de horas
    if (cantidadHoras.trim()) {
      await scheduleEndTreatmentNotification();
    }
    
    showSuccess(
      'Éxito',
      isEditMode ? 'Registro veterinario actualizado correctamente' : 'Registro veterinario agregado correctamente',
      () => router.back()
    );
  } catch (error: any) {
    console.error('=== ERROR COMPLETO ===');
    console.error('Error adding medical record:', error);
    console.error('Error response:', error.response);
    console.error('Error data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error headers:', error.response?.headers);
    
    let errorMsg = 'No se pudo agregar el registro veterinario';
    
    if (error.response?.data?.message) {
      errorMsg = error.response.data.message;
    } else if (error.message) {
      errorMsg = error.message;
    }
    
    const statusCode = error.response?.status || '';
    if (statusCode) {
      errorMsg += ` (Código: ${statusCode})`;
    }
    
    // Si el error contiene HTML, es probable que sea un error del servidor
    if (typeof error.response?.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
      errorMsg = `Error del servidor (${statusCode}). El endpoint podría no existir o tener un problema.`;
    }
    
    showError('Error', errorMsg);
    setError(errorMsg);
  } finally {
    setSubmitting(false);
  }
};
