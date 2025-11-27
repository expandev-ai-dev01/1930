import { authenticatedClient } from '@/core/lib/api';
import type { Task, TaskListFilters, TaskHistoryEntry, TaskHistoryFilters } from '../types';

export const taskService = {
  async list(params?: TaskListFilters): Promise<Task[]> {
    const { data } = await authenticatedClient.get('/task', { params });
    return data.data;
  },

  async create(taskData: {
    titulo: string;
    descricao?: string;
    dataVencimento?: string;
    horaVencimento?: string;
    importancia: 'Alta' | 'Média' | 'Baixa';
  }): Promise<Task> {
    const { data } = await authenticatedClient.post('/task', taskData);
    return data.data;
  },

  async getById(id: string): Promise<Task> {
    const { data } = await authenticatedClient.get(`/task/${id}`);
    return data.data;
  },

  async update(
    id: string,
    taskData: {
      titulo: string;
      descricao?: string;
      dataVencimento?: string;
      horaVencimento?: string;
      importancia: 'Alta' | 'Média' | 'Baixa';
    }
  ): Promise<Task> {
    const { data } = await authenticatedClient.put(`/task/${id}`, taskData);
    return data.data;
  },

  async delete(id: string): Promise<boolean> {
    const { data } = await authenticatedClient.delete(`/task/${id}`);
    return data.data.deleted;
  },

  async updateStatus(id: string, status: 'Pendente' | 'Concluída'): Promise<Task> {
    const { data } = await authenticatedClient.patch(`/task/${id}/status`, { status });
    return data.data;
  },

  async getHistory(id: string, filters?: TaskHistoryFilters): Promise<TaskHistoryEntry[]> {
    const { data } = await authenticatedClient.get(`/task/${id}/history`, { params: filters });
    return data.data;
  },
};
