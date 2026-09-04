import axios from 'axios';
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

  asignar: async (id: string, data: Partial<Obra>, planoPdf?: File) => {
    const finalPayload: Partial<Obra> = { ...data };

    if (planoPdf) {
      try {
        const presigned = await api
          .get<ApiResponse<{ uploadUrl: string; fileUrl: string }>>('/obras/upload-url', {
            params: { fileName: planoPdf.name, contentType: planoPdf.type || 'application/pdf' },
          })
          .then((r) => r.data.data);

        await axios.put(presigned.uploadUrl, planoPdf, {
          headers: { 'Content-Type': planoPdf.type || 'application/pdf' },
        });

        finalPayload.planoPdf = presigned.fileUrl;
      } catch (uploadError) {
        console.warn('Presigned S3 upload failed, trying backend upload endpoint:', uploadError);
        try {
          const formData = new FormData();
          formData.append('file', planoPdf);
          const uploadRes = await api.post<ApiResponse<{ fileUrl: string }>>('/obras/upload', formData).then((r) => r.data.data);
          finalPayload.planoPdf = uploadRes.fileUrl;
        } catch (fallbackError) {
          console.error('All file upload mechanisms failed:', fallbackError);
        }
      }
    }

    const cleanId = encodeURIComponent(id);
    return api.patch<ApiResponse<any>>(`/obras/${cleanId}/asignar`, finalPayload).then((r) => r.data.data);
  },

  update: async (data: Partial<Obra> & { solicitudPo: string }, planoPdf?: File) => {
    const finalPayload: Partial<Obra> = { ...data };

    if (planoPdf) {
      try {
        const presigned = await api
          .get<ApiResponse<{ uploadUrl: string; fileUrl: string }>>('/obras/upload-url', {
            params: { fileName: planoPdf.name, contentType: planoPdf.type || 'application/pdf' },
          })
          .then((r) => r.data.data);

        await axios.put(presigned.uploadUrl, planoPdf, {
          headers: { 'Content-Type': planoPdf.type || 'application/pdf' },
        });

        finalPayload.planoPdf = presigned.fileUrl;
      } catch (uploadError) {
        console.warn('Presigned S3 upload failed, trying backend upload endpoint:', uploadError);
        try {
          const formData = new FormData();
          formData.append('file', planoPdf);
          const uploadRes = await api.post<ApiResponse<{ fileUrl: string }>>('/obras/upload', formData).then((r) => r.data.data);
          finalPayload.planoPdf = uploadRes.fileUrl;
        } catch (fallbackError) {
          console.error('All file upload mechanisms failed:', fallbackError);
        }
      }
    }

    return api.post<ApiResponse<Obra>>('/obras/update', finalPayload).then((r) => r.data.data);
  },

  getBitacoras: (id: string) =>
    api.get<ApiResponse<any[]>>(`/obras/${id}/bitacoras`).then((r) => r.data.data),
  getOficio: (id: string) =>
    api.get<ApiResponse<any>>(`/obras/${id}/oficio`).then((r) => r.data.data),
  importar: (rows: any[], type?: 'siad-plus' | 'senasol') =>
    api.post<ApiResponse<{ count: number }>>('/obras/importar', { rows, type }).then((r) => r.data.data),
  auditConsecutivos: () =>
    api.get<ApiResponse<any>>('/obras/consecutivos/audit').then((r) => r.data.data),
  resequenceConsecutivos: () =>
    api.post<ApiResponse<any>>('/obras/consecutivos/resequence').then((r) => r.data.data),
};

export const areasService = {
  getAll: () => api.get<ApiResponse<any[]>>('/areas').then((r) => r.data.data),
  create: (nombreArea: string) =>
    api.post<ApiResponse<any>>('/areas/create', { nombreArea }).then((r) => r.data.data),
};



