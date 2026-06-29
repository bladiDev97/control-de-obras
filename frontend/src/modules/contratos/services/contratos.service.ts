import { api } from '../../../services/api';
import { Contrato, Asignacion, Estimacion } from '../types/contrato.types';

interface ApiResponse<T> {
  data: T;
  message: string;
}

export const contratosService = {
  getAll: () => api.get<ApiResponse<Contrato[]>>('/contratos').then((r) => r.data.data),
  getOne: (numeroContrato: string) => api.get<ApiResponse<Contrato>>(`/contratos/${numeroContrato}`).then((r) => r.data.data),
  create: (data: Contrato) => api.post<ApiResponse<Contrato>>('/contratos', data).then((r) => r.data.data),
  update: (numeroContrato: string, data: Partial<Contrato>) => api.put<ApiResponse<Contrato>>(`/contratos/${numeroContrato}`, data).then((r) => r.data.data),
  delete: (numeroContrato: string) => api.delete<ApiResponse<Contrato>>(`/contratos/${numeroContrato}`).then((r) => r.data.data),

  // Assignments & Estimations API
  getAsignaciones: (numeroContrato: string) => api.get<ApiResponse<Asignacion[]>>(`/contratos/${numeroContrato}/asignaciones`).then((r) => r.data.data),
  getEstimaciones: (numeroContrato: string) => api.get<ApiResponse<Estimacion[]>>(`/contratos/${numeroContrato}/estimaciones`).then((r) => r.data.data),
  importarCompleto: (payload: any) => api.post<ApiResponse<any>>('/contratos/importar-completo', payload).then((r) => r.data.data),
};
