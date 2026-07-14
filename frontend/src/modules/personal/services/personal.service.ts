import { api } from '../../../services/api';
import { Personal } from '../types/personal.types';

interface ApiResponse<T> {
  data: T;
  message: string;
}

export const personalService = {
  getAll: () => api.get<ApiResponse<Personal[]>>('/personal').then((r) => r.data.data),
  getOne: (id: string) => api.get<ApiResponse<Personal>>(`/personal/${id}`).then((r) => r.data.data),
  create: (data: Personal) => api.post<ApiResponse<Personal>>('/personal/create', data).then((r) => r.data.data),
  update: (data: Personal) => api.post<ApiResponse<Personal>>('/personal/update', data).then((r) => r.data.data),
  delete: (id: string) => api.delete<ApiResponse<any>>(`/personal/delete/${id}`).then((r) => r.data.data),
};
