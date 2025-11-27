import { useState } from 'react';
import { Button } from '@/core/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/core/components/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/core/components/alert-dialog';
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/core/components/empty';
import { LoadingSpinner } from '@/core/components/loading-spinner';
import { Plus, ListTodo } from 'lucide-react';
import { TaskForm, TaskCard, TaskFilters, TaskHistoryDialog } from '@/domain/task/_module';
import { useTaskList } from '@/domain/task/_module';
import type { Task, TaskListFilters } from '@/domain/task/_module';

function TasksPage() {
  const [filters, setFilters] = useState<TaskListFilters>({
    filterStatus: 'Todas',
    filterImportance: 'Todas',
    filterPeriod: 'Todas',
    orderBy: 'Data de vencimento',
    orderDirection: 'Crescente',
  });

  const {
    tasks,
    create,
    update,
    deleteTask,
    updateStatus,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
  } = useTaskList(filters);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleCreate = async (data: any) => {
    await create(data);
    setIsCreateDialogOpen(false);
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: any) => {
    if (!selectedTask) return;
    await update({ id: selectedTask.id, data });
    setIsEditDialogOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteClick = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTask) return;
    await deleteTask(selectedTask.id);
    setIsDeleteDialogOpen(false);
    setSelectedTask(null);
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'Concluída' ? 'Pendente' : 'Concluída';
    await updateStatus({ id: task.id, status: newStatus });
  };

  const handleViewHistory = (task: Task) => {
    setSelectedTask(task);
    setIsHistoryDialogOpen(true);
  };

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Tarefas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas tarefas e acompanhe seu progresso
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      <TaskFilters filters={filters} onFiltersChange={setFilters} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner className="h-8 w-8" />
        </div>
      ) : tasks.length === 0 ? (
        <Empty className="py-12">
          <EmptyHeader>
            <ListTodo className="h-16 w-16" />
            <EmptyTitle>Nenhuma tarefa encontrada</EmptyTitle>
            <EmptyDescription>
              {filters.searchTerm ||
              filters.filterStatus !== 'Todas' ||
              filters.filterImportance !== 'Todas' ||
              filters.filterPeriod !== 'Todas'
                ? 'Não foram encontradas tarefas com os critérios selecionados. Tente ajustar os filtros.'
                : 'Você ainda não tem tarefas cadastradas. Comece criando sua primeira tarefa!'}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Criar primeira tarefa
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onToggleStatus={handleToggleStatus}
              onViewHistory={handleViewHistory}
            />
          ))}
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Tarefa</DialogTitle>
          </DialogHeader>
          <TaskForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={isCreating}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={selectedTask || undefined}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setSelectedTask(null);
            }}
            isLoading={isUpdating}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a tarefa "{selectedTask?.titulo}"? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedTask(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TaskHistoryDialog
        task={selectedTask}
        open={isHistoryDialogOpen}
        onOpenChange={(open: boolean) => {
          setIsHistoryDialogOpen(open);
          if (!open) setSelectedTask(null);
        }}
      />
    </div>
  );
}

export { TasksPage };
