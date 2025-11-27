import { z } from 'zod';

export const taskSchema = z.object({
  titulo: z
    .string('O título da tarefa é obrigatório')
    .min(1, 'O título da tarefa não pode estar vazio')
    .max(100, 'O título deve ter no máximo 100 caracteres'),
  descricao: z.string().max(500, 'A descrição deve ter no máximo 500 caracteres').optional(),
  dataVencimento: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'A data de vencimento deve estar no formato DD/MM/AAAA')
    .optional(),
  horaVencimento: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'A hora de vencimento deve estar no formato HH:MM')
    .optional(),
  importancia: z.enum(['Alta', 'Média', 'Baixa'], 'Selecione um nível de importância válido'),
});

export const taskStatusSchema = z.object({
  status: z.enum(['Pendente', 'Concluída'], 'Selecione um status válido'),
});
