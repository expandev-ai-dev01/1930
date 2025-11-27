/**
 * @summary
 * Business logic and data operations for task management.
 * Implements CRUD operations and business rules for tasks.
 *
 * @module services/task/taskRules
 */

import { v4 as uuidv4 } from 'uuid';
import {
  TaskEntity,
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskListFilters,
  TaskStatus,
  TaskImportance,
  HistoryEntry,
} from './taskTypes';

/**
 * @remarks
 * In-memory storage for tasks and history
 */
const tasks: TaskEntity[] = [];
const history: HistoryEntry[] = [];

/**
 * @summary
 * Creates a new task with the specified parameters
 *
 * @function taskCreate
 * @module services/task
 *
 * @param {TaskCreateRequest} data - Task creation parameters
 *
 * @returns {Promise<TaskEntity>} Created task entity
 *
 * @throws {Error} When validation fails
 */
export async function taskCreate(data: TaskCreateRequest): Promise<TaskEntity> {
  /**
   * @validation Validate required fields
   */
  if (!data.titulo || data.titulo.trim().length === 0) {
    throw new Error('tituloObrigatorio');
  }

  if (data.titulo.length > 100) {
    throw new Error('tituloMuitoLongo');
  }

  if (data.descricao && data.descricao.length > 500) {
    throw new Error('descricaoMuitoLonga');
  }

  /**
   * @rule {fn-order-processing}
   * Create new task with default status 'Pendente'
   */
  const newTask: TaskEntity = {
    id: uuidv4(),
    titulo: data.titulo,
    descricao: data.descricao,
    dataVencimento: data.dataVencimento,
    horaVencimento: data.horaVencimento,
    importancia: data.importancia,
    status: TaskStatus.Pendente,
    dataCriacao: new Date(),
    dataAtualizacao: new Date(),
  };

  tasks.push(newTask);

  /**
   * @rule {fn-order-processing}
   * Record creation in history
   */
  await recordHistory({
    idTarefa: newTask.id,
    tipoAlteracao: 'Criação',
    campoAlterado: null,
    valorAnterior: null,
    valorNovo: null,
    origemAlteracao: 'Manual',
  });

  return newTask;
}

/**
 * @summary
 * Retrieves a filtered and sorted list of tasks
 *
 * @function taskList
 * @module services/task
 *
 * @param {TaskListFilters} filters - List filters and sorting options
 *
 * @returns {Promise<TaskEntity[]>} Filtered and sorted task list
 */
export async function taskList(filters: TaskListFilters): Promise<TaskEntity[]> {
  let filteredTasks = [...tasks];

  /**
   * @rule {fn-order-processing}
   * Apply status filter
   */
  if (filters.filterStatus !== 'Todas') {
    filteredTasks = filteredTasks.filter((task) => task.status === filters.filterStatus);
  }

  /**
   * @rule {fn-order-processing}
   * Apply importance filter
   */
  if (filters.filterImportance !== 'Todas') {
    filteredTasks = filteredTasks.filter((task) => task.importancia === filters.filterImportance);
  }

  /**
   * @rule {fn-order-processing}
   * Apply period filter
   */
  if (filters.filterPeriod !== 'Todas') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filters.filterPeriod) {
      case 'Hoje':
        filteredTasks = filteredTasks.filter((task) => {
          if (!task.dataVencimento) return false;
          const [day, month, year] = task.dataVencimento.split('/').map(Number);
          const dueDate = new Date(year, month - 1, day);
          return dueDate.getTime() === today.getTime();
        });
        break;

      case 'Esta semana':
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        filteredTasks = filteredTasks.filter((task) => {
          if (!task.dataVencimento) return false;
          const [day, month, year] = task.dataVencimento.split('/').map(Number);
          const dueDate = new Date(year, month - 1, day);
          return dueDate >= today && dueDate <= weekEnd;
        });
        break;

      case 'Este mês':
        filteredTasks = filteredTasks.filter((task) => {
          if (!task.dataVencimento) return false;
          const [day, month, year] = task.dataVencimento.split('/').map(Number);
          return month === now.getMonth() + 1 && year === now.getFullYear();
        });
        break;

      case 'Próximas ao vencimento':
        const fortyEightHours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        filteredTasks = filteredTasks.filter((task) => {
          if (!task.dataVencimento) return false;
          const [day, month, year] = task.dataVencimento.split('/').map(Number);
          const dueDate = new Date(year, month - 1, day);
          if (task.horaVencimento) {
            const [hours, minutes] = task.horaVencimento.split(':').map(Number);
            dueDate.setHours(hours, minutes);
          }
          return (
            dueDate >= now && dueDate <= fortyEightHours && task.status === TaskStatus.Pendente
          );
        });
        break;

      case 'Vencidas':
        filteredTasks = filteredTasks.filter((task) => task.status === TaskStatus.Vencida);
        break;

      case 'Sem data':
        filteredTasks = filteredTasks.filter((task) => !task.dataVencimento);
        break;
    }
  }

  /**
   * @rule {fn-order-processing}
   * Apply search term filter
   */
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    filteredTasks = filteredTasks.filter(
      (task) =>
        task.titulo.toLowerCase().includes(searchLower) ||
        (task.descricao && task.descricao.toLowerCase().includes(searchLower))
    );
  }

  /**
   * @rule {fn-order-processing}
   * Apply sorting
   */
  filteredTasks.sort((a, b) => {
    let comparison = 0;

    switch (filters.orderBy) {
      case 'Data de vencimento':
        if (!a.dataVencimento && !b.dataVencimento) comparison = 0;
        else if (!a.dataVencimento) comparison = 1;
        else if (!b.dataVencimento) comparison = -1;
        else {
          const [dayA, monthA, yearA] = a.dataVencimento.split('/').map(Number);
          const [dayB, monthB, yearB] = b.dataVencimento.split('/').map(Number);
          const dateA = new Date(yearA, monthA - 1, dayA);
          const dateB = new Date(yearB, monthB - 1, dayB);
          comparison = dateA.getTime() - dateB.getTime();
        }
        break;

      case 'Importância':
        const importanceOrder = { Alta: 1, Média: 2, Baixa: 3 };
        comparison = importanceOrder[a.importancia] - importanceOrder[b.importancia];
        break;

      case 'Data de criação':
        comparison = a.dataCriacao.getTime() - b.dataCriacao.getTime();
        break;
    }

    return filters.orderDirection === 'Crescente' ? comparison : -comparison;
  });

  return filteredTasks;
}

/**
 * @summary
 * Retrieves a specific task by ID
 *
 * @function taskGet
 * @module services/task
 *
 * @param {string} id - Task identifier
 *
 * @returns {Promise<TaskEntity | null>} Task entity or null if not found
 */
export async function taskGet(id: string): Promise<TaskEntity | null> {
  const task = tasks.find((t) => t.id === id);
  return task || null;
}

/**
 * @summary
 * Updates an existing task with new information
 *
 * @function taskUpdate
 * @module services/task
 *
 * @param {string} id - Task identifier
 * @param {TaskUpdateRequest} data - Update parameters
 *
 * @returns {Promise<TaskEntity | null>} Updated task entity or null if not found
 *
 * @throws {Error} When validation fails
 */
export async function taskUpdate(id: string, data: TaskUpdateRequest): Promise<TaskEntity | null> {
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return null;
  }

  /**
   * @validation Validate required fields
   */
  if (!data.titulo || data.titulo.trim().length === 0) {
    throw new Error('tituloObrigatorio');
  }

  if (data.titulo.length > 100) {
    throw new Error('tituloMuitoLongo');
  }

  if (data.descricao && data.descricao.length > 500) {
    throw new Error('descricaoMuitoLonga');
  }

  const oldTask = { ...tasks[taskIndex] };

  /**
   * @rule {fn-order-processing}
   * Update task fields and check if status should change from Vencida to Pendente
   */
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    titulo: data.titulo,
    descricao: data.descricao,
    dataVencimento: data.dataVencimento,
    horaVencimento: data.horaVencimento,
    importancia: data.importancia,
    dataAtualizacao: new Date(),
  };

  /**
   * @rule {fn-order-processing}
   * If task was Vencida and due date changed to future, change status to Pendente
   */
  if (tasks[taskIndex].status === TaskStatus.Vencida && data.dataVencimento) {
    const [day, month, year] = data.dataVencimento.split('/').map(Number);
    const dueDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDate >= today) {
      tasks[taskIndex].status = TaskStatus.Pendente;
      await recordHistory({
        idTarefa: id,
        tipoAlteracao: 'Alteração de Status',
        campoAlterado: 'status',
        valorAnterior: TaskStatus.Vencida,
        valorNovo: TaskStatus.Pendente,
        origemAlteracao: 'Automática',
      });
    }
  }

  /**
   * @rule {fn-order-processing}
   * Record changes in history
   */
  const changedFields: Array<{ field: string; oldValue: any; newValue: any }> = [];

  if (oldTask.titulo !== data.titulo) {
    changedFields.push({ field: 'titulo', oldValue: oldTask.titulo, newValue: data.titulo });
  }
  if (oldTask.descricao !== data.descricao) {
    changedFields.push({
      field: 'descricao',
      oldValue: oldTask.descricao,
      newValue: data.descricao,
    });
  }
  if (oldTask.dataVencimento !== data.dataVencimento) {
    changedFields.push({
      field: 'dataVencimento',
      oldValue: oldTask.dataVencimento,
      newValue: data.dataVencimento,
    });
  }
  if (oldTask.horaVencimento !== data.horaVencimento) {
    changedFields.push({
      field: 'horaVencimento',
      oldValue: oldTask.horaVencimento,
      newValue: data.horaVencimento,
    });
  }
  if (oldTask.importancia !== data.importancia) {
    changedFields.push({
      field: 'importancia',
      oldValue: oldTask.importancia,
      newValue: data.importancia,
    });
  }

  for (const change of changedFields) {
    await recordHistory({
      idTarefa: id,
      tipoAlteracao: 'Edição',
      campoAlterado: change.field,
      valorAnterior: String(change.oldValue),
      valorNovo: String(change.newValue),
      origemAlteracao: 'Manual',
    });
  }

  return tasks[taskIndex];
}

/**
 * @summary
 * Deletes a task permanently
 *
 * @function taskDelete
 * @module services/task
 *
 * @param {string} id - Task identifier
 *
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function taskDelete(id: string): Promise<boolean> {
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return false;
  }

  /**
   * @rule {fn-order-processing}
   * Record deletion in history before removing
   */
  await recordHistory({
    idTarefa: id,
    tipoAlteracao: 'Exclusão',
    campoAlterado: null,
    valorAnterior: null,
    valorNovo: null,
    origemAlteracao: 'Manual',
  });

  tasks.splice(taskIndex, 1);
  return true;
}

/**
 * @summary
 * Updates the status of a task
 *
 * @function taskUpdateStatus
 * @module services/task
 *
 * @param {string} id - Task identifier
 * @param {TaskStatus} status - New status
 *
 * @returns {Promise<TaskEntity | null>} Updated task entity or null if not found
 *
 * @throws {Error} When status change is not allowed
 */
export async function taskUpdateStatus(id: string, status: TaskStatus): Promise<TaskEntity | null> {
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return null;
  }

  const oldStatus = tasks[taskIndex].status;

  /**
   * @rule {fn-order-processing}
   * Validate status change rules
   */
  if (oldStatus === TaskStatus.Vencida && status === TaskStatus.Pendente) {
    throw new Error('alteracaoNaoPermitida');
  }

  tasks[taskIndex].status = status;
  tasks[taskIndex].dataAtualizacao = new Date();

  /**
   * @rule {fn-order-processing}
   * Record status change in history
   */
  await recordHistory({
    idTarefa: id,
    tipoAlteracao: 'Alteração de Status',
    campoAlterado: 'status',
    valorAnterior: oldStatus,
    valorNovo: status,
    origemAlteracao: 'Manual',
  });

  return tasks[taskIndex];
}

/**
 * @summary
 * Checks for overdue tasks and updates their status
 *
 * @function taskCheckOverdue
 * @module services/task
 *
 * @returns {Promise<void>}
 */
export async function taskCheckOverdue(): Promise<void> {
  const now = new Date();

  for (const task of tasks) {
    if (task.status === TaskStatus.Pendente && task.dataVencimento) {
      const [day, month, year] = task.dataVencimento.split('/').map(Number);
      const dueDate = new Date(year, month - 1, day);

      if (task.horaVencimento) {
        const [hours, minutes] = task.horaVencimento.split(':').map(Number);
        dueDate.setHours(hours, minutes);
      } else {
        dueDate.setHours(23, 59, 59);
      }

      /**
       * @rule {fn-order-processing}
       * Update status to Vencida if due date has passed
       */
      if (dueDate < now) {
        task.status = TaskStatus.Vencida;
        task.dataAtualizacao = new Date();

        await recordHistory({
          idTarefa: task.id,
          tipoAlteracao: 'Alteração de Status',
          campoAlterado: 'status',
          valorAnterior: TaskStatus.Pendente,
          valorNovo: TaskStatus.Vencida,
          origemAlteracao: 'Automática',
        });
      }
    }
  }
}

/**
 * @summary
 * Records a change in task history
 *
 * @function recordHistory
 * @module services/task
 *
 * @param {object} data - History entry data
 *
 * @returns {Promise<void>}
 */
async function recordHistory(data: {
  idTarefa: string;
  tipoAlteracao: string;
  campoAlterado: string | null;
  valorAnterior: string | null;
  valorNovo: string | null;
  origemAlteracao: string;
}): Promise<void> {
  const entry: HistoryEntry = {
    id: uuidv4(),
    idTarefa: data.idTarefa,
    dataAlteracao: new Date(),
    tipoAlteracao: data.tipoAlteracao,
    campoAlterado: data.campoAlterado,
    valorAnterior: data.valorAnterior,
    valorNovo: data.valorNovo,
    origemAlteracao: data.origemAlteracao,
  };

  history.push(entry);
}

/**
 * @summary
 * Retrieves task history with optional filters
 *
 * @function taskGetHistory
 * @module services/task
 *
 * @param {string} idTarefa - Task identifier
 * @param {string} [filterTipo] - Filter by change type
 * @param {string} [filterOrigem] - Filter by change origin
 *
 * @returns {Promise<HistoryEntry[]>} Task history entries
 */
export async function taskGetHistory(
  idTarefa: string,
  filterTipo?: string,
  filterOrigem?: string
): Promise<HistoryEntry[]> {
  let entries = history.filter((h) => h.idTarefa === idTarefa);

  if (filterTipo && filterTipo !== 'Todas') {
    entries = entries.filter((h) => h.tipoAlteracao === filterTipo);
  }

  if (filterOrigem && filterOrigem !== 'Todas') {
    entries = entries.filter((h) => h.origemAlteracao === filterOrigem);
  }

  /**
   * @rule {fn-order-processing}
   * Sort by date descending (most recent first)
   */
  entries.sort((a, b) => b.dataAlteracao.getTime() - a.dataAlteracao.getTime());

  return entries;
}
