export type TaskStatus = 'Pendente' | 'Concluída' | 'Vencida';
export type TaskImportance = 'Alta' | 'Média' | 'Baixa';

export interface Task {
  id: string;
  titulo: string;
  descricao: string | null;
  dataVencimento: string | null;
  horaVencimento: string | null;
  importancia: TaskImportance;
  status: TaskStatus;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface TaskListFilters {
  filterStatus?: 'Todas' | 'Pendentes' | 'Concluídas' | 'Vencidas';
  filterImportance?: 'Todas' | 'Alta' | 'Média' | 'Baixa';
  filterPeriod?:
    | 'Todas'
    | 'Hoje'
    | 'Esta semana'
    | 'Este mês'
    | 'Próximas ao vencimento'
    | 'Vencidas'
    | 'Sem data';
  orderBy?: 'Data de vencimento' | 'Importância' | 'Data de criação';
  orderDirection?: 'Crescente' | 'Decrescente';
  searchTerm?: string;
}

export interface TaskHistoryEntry {
  id: string;
  idTarefa: string;
  dataAlteracao: string;
  tipoAlteracao: 'Criação' | 'Edição' | 'Alteração de Status' | 'Exclusão';
  campoAlterado: string | null;
  valorAnterior: string | null;
  valorNovo: string | null;
  origemAlteracao: 'Manual' | 'Automática';
}

export interface TaskHistoryFilters {
  filterTipo?: 'Todas' | 'Criação' | 'Edição' | 'Alteração de Status' | 'Exclusão';
  filterOrigem?: 'Todas' | 'Manual' | 'Automática';
}
