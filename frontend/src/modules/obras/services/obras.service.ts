import { api } from '../../../services/api';
import { Obra } from '../types/obra.types';

interface ApiResponse<T> {
  data: T;
  message: string;
}

export const obrasService = {
  getAll: () => api.get<ApiResponse<Obra[]>>('/obras').then((r) => r.data.data),
  getCapitalizar: () => api.get<ApiResponse<Obra[]>>('/obras/capitalizar').then((r) => r.data.data),
  getOne: (id: string) => api.get<ApiResponse<Obra>>(`/obras/${id}`).then((r) => r.data.data),
  terminar: (id: string, fechaTerminoCampo: string) =>
    api.patch<ApiResponse<any>>(`/obras/${id}/terminar`, { fechaTerminoCampo }).then((r) => r.data.data),
  asignar: (id: string, data: Partial<Obra>, planoPdf?: File) => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.append(k, String(v ?? '')));
    if (planoPdf) formData.append('planoPdf', planoPdf);
    return api.patch<ApiResponse<any>>(`/obras/${id}/asignar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data.data);
  },
  update: (data: Partial<Obra> & { solicitudPo: string }) =>
    api.post<ApiResponse<Obra>>('/obras/update', data).then((r) => r.data.data),
  getBitacoras: (id: string) =>
    api.get<ApiResponse<any[]>>(`/obras/${id}/bitacoras`).then((r) => r.data.data),
  getOficio: (id: string) =>
    api.get<ApiResponse<any>>(`/obras/${id}/oficio`).then((r) => r.data.data),
  importar: (rows: any[], type?: 'siad-plus' | 'senasol') =>
    api.post<ApiResponse<{ count: number }>>('/obras/importar', { rows, type }).then((r) => r.data.data),
};

export const areasService = {
  getAll: () => api.get<ApiResponse<any[]>>('/areas').then((r) => r.data.data),
  create: (nombreArea: string) =>
    api.post<ApiResponse<any>>('/areas/create', { nombreArea }).then((r) => r.data.data),
};



