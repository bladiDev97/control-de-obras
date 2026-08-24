import { api } from '../../../services/api';

interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface SmtpConfig {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  from?: string;
  whatsappPhone?: string;
  whatsappApiKey?: string;
  whatsappHour?: string;
  whatsappHourMorning?: string;
  whatsappHourAfternoon?: string;
}

export const configService = {
  getSmtp: () => api.get<ApiResponse<SmtpConfig>>('/config/smtp').then((r) => r.data.data),
  saveSmtp: (data: SmtpConfig) => api.post<ApiResponse<SmtpConfig>>('/config/smtp', data).then((r) => r.data.data),
  testSmtp: (data: SmtpConfig & { recipient: string }) => api.post<ApiResponse<boolean>>('/config/smtp/test', data).then((r) => r.data.data),
  testWhatsapp: (data: { whatsappPhone: string; whatsappApiKey: string }) => api.post<ApiResponse<boolean>>('/config/whatsapp/test', data).then((r) => r.data.data),
  testWhatsappAlert: () => api.post<ApiResponse<number>>('/config/whatsapp/test-alert').then((r) => r.data.data),
};
