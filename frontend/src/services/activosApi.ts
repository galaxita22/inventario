import api from './api';

// Tipos para TypeScript
export interface FiltrosActivo {
  ubicacion_id?: number;
  estado_conservacion?: string;
}

export const obtenerActivos = async (filtros?: FiltrosActivo) => {
  try {
    // Axios convierte automáticamente este objeto en una URL con Query Params (ej: ?estado=obsoleto)
    const response = await api.get('/api/activos', { params: filtros });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.mensaje || 'Error al obtener activos');
  }
};

export const obtenerHistorialActivo = async (id: number) => {
  try {
    const response = await api.get(`/api/activos/${id}/historial`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.mensaje || 'Error al obtener el historial');
  }
};