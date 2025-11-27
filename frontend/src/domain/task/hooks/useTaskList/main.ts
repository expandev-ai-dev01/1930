import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../../services';
import type { TaskListFilters } from '../../types';
import { toast } from 'sonner';

export const useTaskList = (filters?: TaskListFilters) => {
  const queryClient = useQueryClient();
  const queryKey = ['tasks', filters];

  const { data, ...queryInfo } = useQuery({
    queryKey,
    queryFn: () => taskService.list(filters),
  });

  const { mutateAsync: create, isPending: isCreating } = useMutation({
    mutationFn: taskService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tarefa criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao criar tarefa');
    },
  });

  const { mutateAsync: update, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => taskService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tarefa atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar tarefa');
    },
  });

  const { mutateAsync: deleteTask, isPending: isDeleting } = useMutation({
    mutationFn: taskService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tarefa excluída com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao excluir tarefa');
    },
  });

  const { mutateAsync: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'Pendente' | 'Concluída' }) =>
      taskService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Status atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar status');
    },
  });

  return {
    tasks: data || [],
    create,
    update,
    deleteTask,
    updateStatus,
    isCreating,
    isUpdating,
    isDeleting,
    isUpdatingStatus,
    ...queryInfo,
  };
};
