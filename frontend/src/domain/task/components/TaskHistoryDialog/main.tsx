import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/core/components/dialog';
import { Badge } from '@/core/components/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/select';
import { Label } from '@/core/components/label';
import { useTaskHistory } from '../../hooks';
import type { Task, TaskHistoryFilters } from '../../types';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadingSpinner } from '@/core/components/loading-spinner';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/core/components/empty';
import { History } from 'lucide-react';

interface TaskHistoryDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function TaskHistoryDialog({ task, open, onOpenChange }: TaskHistoryDialogProps) {
  const [filters, setFilters] = useState<TaskHistoryFilters>({
    filterTipo: 'Todas',
    filterOrigem: 'Todas',
  });

  const { history, isLoading } = useTaskHistory(task?.id || '', filters);

  const updateFilter = (key: keyof TaskHistoryFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const formatDateTime = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de Alterações</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo de Alteração</Label>
              <Select
                value={filters.filterTipo || 'Todas'}
                onValueChange={(value) => updateFilter('filterTipo', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas</SelectItem>
                  <SelectItem value="Criação">Criação</SelectItem>
                  <SelectItem value="Edição">Edição</SelectItem>
                  <SelectItem value="Alteração de Status">Alteração de Status</SelectItem>
                  <SelectItem value="Exclusão">Exclusão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Origem</Label>
              <Select
                value={filters.filterOrigem || 'Todas'}
                onValueChange={(value) => updateFilter('filterOrigem', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas</SelectItem>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="Automática">Automática</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner className="h-8 w-8" />
            </div>
          ) : history.length === 0 ? (
            <Empty className="py-8">
              <EmptyHeader>
                <History className="h-12 w-12" />
                <EmptyTitle>Nenhum registro encontrado</EmptyTitle>
                <EmptyDescription>
                  Não há registros de alterações para esta tarefa com os filtros selecionados.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <div key={entry.id} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{entry.tipoAlteracao}</Badge>
                        <Badge
                          variant={entry.origemAlteracao === 'Automática' ? 'secondary' : 'default'}
                        >
                          {entry.origemAlteracao}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {formatDateTime(entry.dataAlteracao)}
                      </p>
                    </div>
                  </div>

                  {entry.campoAlterado && (
                    <div className="mt-3 space-y-1 text-sm">
                      <p className="font-medium">Campo: {entry.campoAlterado}</p>
                      {entry.valorAnterior && (
                        <p className="text-muted-foreground">
                          De: <span className="font-medium">{entry.valorAnterior}</span>
                        </p>
                      )}
                      {entry.valorNovo && (
                        <p className="text-muted-foreground">
                          Para: <span className="font-medium">{entry.valorNovo}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { TaskHistoryDialog };
