import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/core/components/card';
import { Badge } from '@/core/components/badge';
import { Button } from '@/core/components/button';
import { Checkbox } from '@/core/components/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/components/dropdown-menu';
import { Calendar, Clock, MoreVertical, Pencil, Trash2, History } from 'lucide-react';
import type { Task } from '../../types';
import { cn } from '@/core/lib/utils';
import { format, isWithinInterval, addHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onToggleStatus?: (task: Task) => void;
  onViewHistory?: (task: Task) => void;
}

function TaskCard({ task, onEdit, onDelete, onToggleStatus, onViewHistory }: TaskCardProps) {
  const isOverdue = task.status === 'Vencida';
  const isCompleted = task.status === 'Concluída';

  const isNearDue = () => {
    if (!task.dataVencimento || isCompleted || isOverdue) return false;
    try {
      const [day, month, year] = task.dataVencimento.split('/').map(Number);
      const dueDate = new Date(year, month - 1, day);
      const now = new Date();
      const in48Hours = addHours(now, 48);
      return isWithinInterval(dueDate, { start: now, end: in48Hours });
    } catch {
      return false;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const [day, month, year] = dateStr.split('/').map(Number);
      return format(new Date(year, month - 1, day), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const getImportanceBadgeVariant = (importance: string) => {
    switch (importance) {
      case 'Alta':
        return 'destructive';
      case 'Média':
        return 'default';
      case 'Baixa':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        isOverdue && 'border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20',
        isNearDue() &&
          'border-yellow-200 bg-yellow-50/50 dark:border-yellow-900/50 dark:bg-yellow-950/20',
        isCompleted && 'opacity-75'
      )}
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => onToggleStatus?.(task)}
            className="mt-1"
          />
          <div className="flex-1">
            <CardTitle
              className={cn('text-base', isCompleted && 'text-muted-foreground line-through')}
            >
              {task.titulo}
            </CardTitle>
            {task.descricao && (
              <p className="text-muted-foreground mt-2 text-sm">{task.descricao}</p>
            )}
          </div>
        </div>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(task)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewHistory?.(task)}>
                <History className="mr-2 h-4 w-4" />
                Histórico
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(task)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={getImportanceBadgeVariant(task.importancia)}>{task.importancia}</Badge>
          <Badge
            variant="outline"
            className={cn(
              isOverdue && 'border-red-500 text-red-700 dark:text-red-400',
              isNearDue() && 'border-yellow-500 text-yellow-700 dark:text-yellow-400'
            )}
          >
            {task.status}
          </Badge>
          {task.dataVencimento && (
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              {formatDate(task.dataVencimento)}
            </div>
          )}
          {task.horaVencimento && (
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {task.horaVencimento}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export { TaskCard };
