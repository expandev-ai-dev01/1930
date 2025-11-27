/**
 * @summary
 * Type definitions for task management domain.
 * Defines interfaces, enums, and types for task operations.
 *
 * @module services/task/taskTypes
 */

/**
 * @enum TaskStatus
 * @description Task status enumeration
 */
export enum TaskStatus {
  Pendente = 'Pendente',
  Concluída = 'Concluída',
  Vencida = 'Vencida',
}

/**
 * @enum TaskImportance
 * @description Task importance level enumeration
 */
export enum TaskImportance {
  Alta = 'Alta',
  Média = 'Média',
  Baixa = 'Baixa',
}

/**
 * @interface TaskEntity
 * @description Represents a task entity in the system
 *
 * @property {string} id - Unique task identifier (UUID)
 * @property {string} titulo - Task title
 * @property {string | null} descricao - Task description
 * @property {string | null} dataVencimento - Due date in DD/MM/YYYY format
 * @property {string | null} horaVencimento - Due time in HH:MM format
 * @property {TaskImportance} importancia - Importance level
 * @property {TaskStatus} status - Current task status
 * @property {Date} dataCriacao - Creation timestamp
 * @property {Date} dataAtualizacao - Last update timestamp
 */
export interface TaskEntity {
  id: string;
  titulo: string;
  descricao: string | null;
  dataVencimento: string | null;
  horaVencimento: string | null;
  importancia: TaskImportance;
  status: TaskStatus;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

/**
 * @interface TaskCreateRequest
 * @description Parameters for creating a new task
 *
 * @property {string} titulo - Task title
 * @property {string | null} descricao - Task description
 * @property {string | null} dataVencimento - Due date in DD/MM/YYYY format
 * @property {string | null} horaVencimento - Due time in HH:MM format
 * @property {TaskImportance} importancia - Importance level
 */
export interface TaskCreateRequest {
  titulo: string;
  descricao: string | null;
  dataVencimento: string | null;
  horaVencimento: string | null;
  importancia: TaskImportance;
}

/**
 * @interface TaskUpdateRequest
 * @description Parameters for updating an existing task
 *
 * @property {string} titulo - Task title
 * @property {string | null} descricao - Task description
 * @property {string | null} dataVencimento - Due date in DD/MM/YYYY format
 * @property {string | null} horaVencimento - Due time in HH:MM format
 * @property {TaskImportance} importancia - Importance level
 */
export interface TaskUpdateRequest {
  titulo: string;
  descricao: string | null;
  dataVencimento: string | null;
  horaVencimento: string | null;
  importancia: TaskImportance;
}

/**
 * @interface TaskListFilters
 * @description Filters for task listing
 *
 * @property {string} filterStatus - Status filter
 * @property {string} filterImportance - Importance filter
 * @property {string} filterPeriod - Period filter
 * @property {string} orderBy - Sort field
 * @property {string} orderDirection - Sort direction
 * @property {string} [searchTerm] - Search term
 */
export interface TaskListFilters {
  filterStatus: string;
  filterImportance: string;
  filterPeriod: string;
  orderBy: string;
  orderDirection: string;
  searchTerm?: string;
}

/**
 * @interface HistoryEntry
 * @description Represents a task history entry
 *
 * @property {string} id - History entry identifier
 * @property {string} idTarefa - Task identifier
 * @property {Date} dataAlteracao - Change timestamp
 * @property {string} tipoAlteracao - Change type
 * @property {string | null} campoAlterado - Changed field name
 * @property {string | null} valorAnterior - Previous value
 * @property {string | null} valorNovo - New value
 * @property {string} origemAlteracao - Change origin (Manual/Automática)
 */
export interface HistoryEntry {
  id: string;
  idTarefa: string;
  dataAlteracao: Date;
  tipoAlteracao: string;
  campoAlterado: string | null;
  valorAnterior: string | null;
  valorNovo: string | null;
  origemAlteracao: string;
}
