/**
 * @summary
 * Task management controller handling CRUD operations for tasks.
 * Implements business logic for task creation, listing, retrieval, update, and deletion.
 *
 * @module api/v1/internal/task/controller
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/utils/response';
import {
  taskCreate,
  taskList,
  taskGet,
  taskUpdate,
  taskDelete,
  taskUpdateStatus,
  taskCheckOverdue,
} from '@/services/task';
import { TaskStatus, TaskImportance } from '@/services/task/taskTypes';

/**
 * @api {get} /api/v1/internal/task List Tasks
 * @apiName ListTasks
 * @apiGroup Task
 * @apiVersion 1.0.0
 *
 * @apiDescription Retrieves a filtered and sorted list of tasks for the authenticated user
 *
 * @apiParam {String} [filterStatus] Filter by status: 'Todas', 'Pendentes', 'Concluídas', 'Vencidas'
 * @apiParam {String} [filterImportance] Filter by importance: 'Todas', 'Alta', 'Média', 'Baixa'
 * @apiParam {String} [filterPeriod] Filter by period: 'Todas', 'Hoje', 'Esta semana', 'Este mês', 'Próximas ao vencimento', 'Vencidas', 'Sem data'
 * @apiParam {String} [orderBy] Sort by: 'Data de vencimento', 'Importância', 'Data de criação'
 * @apiParam {String} [orderDirection] Sort direction: 'Crescente', 'Decrescente'
 * @apiParam {String} [searchTerm] Search term for title or description
 *
 * @apiSuccess {Array} tasks List of tasks matching criteria
 *
 * @apiError {String} UnauthorizedError User not authenticated
 * @apiError {String} ServerError Internal server error
 */
export async function listHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    /**
     * @validation Query parameter validation
     */
    const querySchema = z.object({
      filterStatus: z
        .enum(['Todas', 'Pendentes', 'Concluídas', 'Vencidas'])
        .optional()
        .default('Todas'),
      filterImportance: z.enum(['Todas', 'Alta', 'Média', 'Baixa']).optional().default('Todas'),
      filterPeriod: z
        .enum([
          'Todas',
          'Hoje',
          'Esta semana',
          'Este mês',
          'Próximas ao vencimento',
          'Vencidas',
          'Sem data',
        ])
        .optional()
        .default('Todas'),
      orderBy: z
        .enum(['Data de vencimento', 'Importância', 'Data de criação'])
        .optional()
        .default('Data de vencimento'),
      orderDirection: z.enum(['Crescente', 'Decrescente']).optional().default('Crescente'),
      searchTerm: z.string().optional(),
    });

    const filters = querySchema.parse(req.query);

    /**
     * @rule {fn-order-processing}
     * Check for overdue tasks before listing
     */
    await taskCheckOverdue();

    const tasks = await taskList({
      filterStatus: filters.filterStatus,
      filterImportance: filters.filterImportance,
      filterPeriod: filters.filterPeriod,
      orderBy: filters.orderBy,
      orderDirection: filters.orderDirection,
      searchTerm: filters.searchTerm,
    });

    res.json(successResponse(tasks));
  } catch (error: any) {
    next(error);
  }
}

/**
 * @api {post} /api/v1/internal/task Create Task
 * @apiName CreateTask
 * @apiGroup Task
 * @apiVersion 1.0.0
 *
 * @apiDescription Creates a new task with the specified parameters
 *
 * @apiParam {String} titulo Task title (max 100 characters)
 * @apiParam {String} [descricao] Task description (max 500 characters)
 * @apiParam {String} [dataVencimento] Due date in DD/MM/YYYY format
 * @apiParam {String} [horaVencimento] Due time in HH:MM format
 * @apiParam {String} importancia Importance level: 'Alta', 'Média', 'Baixa'
 *
 * @apiSuccess {String} id Task identifier
 * @apiSuccess {String} titulo Task title
 * @apiSuccess {String} status Task status
 *
 * @apiError {String} ValidationError Invalid parameters provided
 * @apiError {String} ServerError Internal server error
 */
export async function createHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    /**
     * @validation Request body validation
     */
    const bodySchema = z.object({
      titulo: z.string().min(1, 'tituloObrigatorio').max(100, 'tituloMuitoLongo'),
      descricao: z.string().max(500, 'descricaoMuitoLonga').optional(),
      dataVencimento: z
        .string()
        .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'dataVencimentoInvalida')
        .optional(),
      horaVencimento: z
        .string()
        .regex(/^\d{2}:\d{2}$/, 'horaVencimentoInvalida')
        .optional(),
      importancia: z.enum(['Alta', 'Média', 'Baixa'], {
        errorMap: () => ({ message: 'importanciaInvalida' }),
      }),
    });

    const data = bodySchema.parse(req.body);

    /**
     * @rule {fn-order-processing}
     * Validate due date is not in the past
     */
    if (data.dataVencimento) {
      const [day, month, year] = data.dataVencimento.split('/').map(Number);
      const dueDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        return next({
          statusCode: 400,
          code: 'dataVencimentoPassado',
          message: 'A data de vencimento não pode ser anterior à data atual',
        });
      }
    }

    const task = await taskCreate({
      titulo: data.titulo,
      descricao: data.descricao || null,
      dataVencimento: data.dataVencimento || null,
      horaVencimento: data.horaVencimento || null,
      importancia: data.importancia as TaskImportance,
    });

    res.status(201).json(successResponse(task));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: error.errors[0].message,
        details: error.errors,
      });
    }
    next(error);
  }
}

/**
 * @api {get} /api/v1/internal/task/:id Get Task
 * @apiName GetTask
 * @apiGroup Task
 * @apiVersion 1.0.0
 *
 * @apiDescription Retrieves detailed information about a specific task
 *
 * @apiParam {String} id Task identifier
 *
 * @apiSuccess {Object} task Task details
 *
 * @apiError {String} NotFoundError Task not found
 * @apiError {String} ServerError Internal server error
 */
export async function getHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    /**
     * @validation Parameter validation
     */
    const paramsSchema = z.object({
      id: z.string().uuid('idTarefaInvalido'),
    });

    const { id } = paramsSchema.parse(req.params);

    const task = await taskGet(id);

    if (!task) {
      return next({
        statusCode: 404,
        code: 'tarefaNaoEncontrada',
        message: 'A tarefa solicitada não foi encontrada',
      });
    }

    res.json(successResponse(task));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: error.errors[0].message,
      });
    }
    next(error);
  }
}

/**
 * @api {put} /api/v1/internal/task/:id Update Task
 * @apiName UpdateTask
 * @apiGroup Task
 * @apiVersion 1.0.0
 *
 * @apiDescription Updates an existing task with new information
 *
 * @apiParam {String} id Task identifier
 * @apiParam {String} titulo Task title (max 100 characters)
 * @apiParam {String} [descricao] Task description (max 500 characters)
 * @apiParam {String} [dataVencimento] Due date in DD/MM/YYYY format
 * @apiParam {String} [horaVencimento] Due time in HH:MM format
 * @apiParam {String} importancia Importance level: 'Alta', 'Média', 'Baixa'
 *
 * @apiSuccess {Object} task Updated task details
 *
 * @apiError {String} ValidationError Invalid parameters
 * @apiError {String} NotFoundError Task not found
 * @apiError {String} ServerError Internal server error
 */
export async function updateHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    /**
     * @validation Parameter and body validation
     */
    const paramsSchema = z.object({
      id: z.string().uuid('idTarefaInvalido'),
    });

    const bodySchema = z.object({
      titulo: z.string().min(1, 'tituloObrigatorio').max(100, 'tituloMuitoLongo'),
      descricao: z.string().max(500, 'descricaoMuitoLonga').optional(),
      dataVencimento: z
        .string()
        .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'dataVencimentoInvalida')
        .optional(),
      horaVencimento: z
        .string()
        .regex(/^\d{2}:\d{2}$/, 'horaVencimentoInvalida')
        .optional(),
      importancia: z.enum(['Alta', 'Média', 'Baixa'], {
        errorMap: () => ({ message: 'importanciaInvalida' }),
      }),
    });

    const { id } = paramsSchema.parse(req.params);
    const data = bodySchema.parse(req.body);

    /**
     * @rule {fn-order-processing}
     * Validate due date is not in the past
     */
    if (data.dataVencimento) {
      const [day, month, year] = data.dataVencimento.split('/').map(Number);
      const dueDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        return next({
          statusCode: 400,
          code: 'dataVencimentoPassado',
          message: 'A data de vencimento não pode ser anterior à data atual',
        });
      }
    }

    const task = await taskUpdate(id, {
      titulo: data.titulo,
      descricao: data.descricao || null,
      dataVencimento: data.dataVencimento || null,
      horaVencimento: data.horaVencimento || null,
      importancia: data.importancia as TaskImportance,
    });

    if (!task) {
      return next({
        statusCode: 404,
        code: 'tarefaNaoEncontrada',
        message: 'A tarefa solicitada não foi encontrada',
      });
    }

    res.json(successResponse(task));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: error.errors[0].message,
        details: error.errors,
      });
    }
    next(error);
  }
}

/**
 * @api {delete} /api/v1/internal/task/:id Delete Task
 * @apiName DeleteTask
 * @apiGroup Task
 * @apiVersion 1.0.0
 *
 * @apiDescription Permanently deletes a task
 *
 * @apiParam {String} id Task identifier
 *
 * @apiSuccess {Boolean} success Deletion confirmation
 *
 * @apiError {String} NotFoundError Task not found
 * @apiError {String} ServerError Internal server error
 */
export async function deleteHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    /**
     * @validation Parameter validation
     */
    const paramsSchema = z.object({
      id: z.string().uuid('idTarefaInvalido'),
    });

    const { id } = paramsSchema.parse(req.params);

    const deleted = await taskDelete(id);

    if (!deleted) {
      return next({
        statusCode: 404,
        code: 'tarefaNaoEncontrada',
        message: 'A tarefa solicitada não foi encontrada',
      });
    }

    res.json(successResponse({ deleted: true }));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: error.errors[0].message,
      });
    }
    next(error);
  }
}

/**
 * @api {patch} /api/v1/internal/task/:id/status Update Task Status
 * @apiName UpdateTaskStatus
 * @apiGroup Task
 * @apiVersion 1.0.0
 *
 * @apiDescription Updates the status of a task
 *
 * @apiParam {String} id Task identifier
 * @apiParam {String} status New status: 'Pendente', 'Concluída'
 *
 * @apiSuccess {Object} task Updated task details
 *
 * @apiError {String} ValidationError Invalid status
 * @apiError {String} NotFoundError Task not found
 * @apiError {String} ServerError Internal server error
 */
export async function updateStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    /**
     * @validation Parameter and body validation
     */
    const paramsSchema = z.object({
      id: z.string().uuid('idTarefaInvalido'),
    });

    const bodySchema = z.object({
      status: z.enum(['Pendente', 'Concluída'], {
        errorMap: () => ({ message: 'statusInvalido' }),
      }),
    });

    const { id } = paramsSchema.parse(req.params);
    const { status } = bodySchema.parse(req.body);

    const task = await taskUpdateStatus(id, status as TaskStatus);

    if (!task) {
      return next({
        statusCode: 404,
        code: 'tarefaNaoEncontrada',
        message: 'A tarefa solicitada não foi encontrada',
      });
    }

    res.json(successResponse(task));
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return next({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: error.errors[0].message,
      });
    }
    next(error);
  }
}
