import axios from 'axios';
import { Zona } from '../types/zona.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const zonasService = {
  async getAll(): Promise<Zona[]> {
    const response = await axios.get(`${API_URL}/zonas`);
    return response.data;
  },

  async create(data: Zona): Promise<Zona> {
    const response = await axios.post(`${API_URL}/zonas`, data);
    return response.data;
  },

  async update(id: string, data: Zona): Promise<Zona> {
    const response = await axios.put(`${API_URL}/zonas/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<boolean> {
    const response = await axios.delete(`${API_URL}/zonas/${id}`);
    return response.data;
  }
};
