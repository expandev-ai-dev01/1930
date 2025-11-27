import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/select';
import { Input } from '@/core/components/input';
import { Label } from '@/core/components/label';
import type { TaskListFilters } from '../../types';
import { Search } from 'lucide-react';

interface TaskFiltersProps {
  filters: TaskListFilters;
  onFiltersChange: (filters: TaskListFilters) => void;
}

function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  const updateFilter = (key: keyof TaskListFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.filterStatus || 'Todas'}
            onValueChange={(value) => updateFilter('filterStatus', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas</SelectItem>
              <SelectItem value="Pendentes">Pendentes</SelectItem>
              <SelectItem value="Concluídas">Concluídas</SelectItem>
              <SelectItem value="Vencidas">Vencidas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Importância</Label>
          <Select
            value={filters.filterImportance || 'Todas'}
            onValueChange={(value) => updateFilter('filterImportance', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas</SelectItem>
              <SelectItem value="Alta">Alta</SelectItem>
              <SelectItem value="Média">Média</SelectItem>
              <SelectItem value="Baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Período</Label>
          <Select
            value={filters.filterPeriod || 'Todas'}
            onValueChange={(value) => updateFilter('filterPeriod', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas</SelectItem>
              <SelectItem value="Hoje">Hoje</SelectItem>
              <SelectItem value="Esta semana">Esta semana</SelectItem>
              <SelectItem value="Este mês">Este mês</SelectItem>
              <SelectItem value="Próximas ao vencimento">Próximas ao vencimento</SelectItem>
              <SelectItem value="Vencidas">Vencidas</SelectItem>
              <SelectItem value="Sem data">Sem data</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Ordenar por</Label>
          <Select
            value={filters.orderBy || 'Data de vencimento'}
            onValueChange={(value) => updateFilter('orderBy', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Data de vencimento">Data de vencimento</SelectItem>
              <SelectItem value="Importância">Importância</SelectItem>
              <SelectItem value="Data de criação">Data de criação</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Buscar</Label>
        <div className="relative">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por título ou descrição..."
            value={filters.searchTerm || ''}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
    </div>
  );
}

export { TaskFilters };
