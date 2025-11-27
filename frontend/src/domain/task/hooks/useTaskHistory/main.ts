import { useQuery } from '@tanstack/react-query';
import { taskService } from '../../services';
import type { TaskHistoryFilters } from '../../types';

export const useTaskHistory = (taskId: string, filters?: TaskHistoryFilters) => {
  const queryKey = ['task-history', taskId, filters];

  const { data, ...queryInfo } = useQuery({
    queryKey,
    queryFn: () => taskService.getHistory(taskId, filters),
    enabled: !!taskId,
  });

  return {
    history: data || [],
    ...queryInfo,
  };
};
