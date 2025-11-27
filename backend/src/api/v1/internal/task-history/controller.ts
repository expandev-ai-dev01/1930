/**
 * @summary
 * Task history controller handling history retrieval operations.
 * Implements business logic for viewing task change history.
 *
 * @module api/v1/internal/task-history/controller
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { successResponse } from '@/utils/response';
import { taskGetHistory, taskGet } from '@/services/task';

/**
 * @api {get} /api/v1/internal/task/:id/history Get Task History
 * @apiName GetTaskHistory
 * @apiGroup TaskHistory
 * @apiVersion 1.0.0
 *
 * @apiDescription Retrieves the change history for a specific task
 *
 * @apiParam {String} id Task identifier
 * @apiParam {String} [filterTipo] Filter by change type: 'Todas', 'Criação', 'Edição', 'Alteração de Status', 'Exclusão'
 * @apiParam {String} [filterOrigem] Filter by origin: 'Todas', 'Manual', 'Automática'
 *
 * @apiSuccess {Array} history List of history entries
 *
 * @apiError {String} NotFoundError Task not found
 * @apiError {String} ServerError Internal server error
 */
export async function getHistoryHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    /**
     * @validation Parameter and query validation
     */
    const paramsSchema = z.object({
      id: z.string().uuid('idTarefaInvalido'),
    });

    const querySchema = z.object({
      filterTipo: z
        .enum(['Todas', 'Criação', 'Edição', 'Alteração de Status', 'Exclusão'])
        .optional()
        .default('Todas'),
      filterOrigem: z.enum(['Todas', 'Manual', 'Automática']).optional().default('Todas'),
    });

    const { id } = paramsSchema.parse(req.params);
    const filters = querySchema.parse(req.query);

    /**
     * @rule {fn-order-processing}
     * Verify task exists before retrieving history
     */
    const task = await taskGet(id);

    if (!task) {
      return next({
        statusCode: 404,
        code: 'tarefaNaoEncontrada',
        message: 'A tarefa solicitada não foi encontrada',
      });
    }

    const historyEntries = await taskGetHistory(id, filters.filterTipo, filters.filterOrigem);

    res.json(successResponse(historyEntries));
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
