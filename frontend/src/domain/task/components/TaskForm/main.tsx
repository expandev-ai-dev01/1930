import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema } from '../../validations';
import type { Task } from '../../types';
import { Button } from '@/core/components/button';
import { Input } from '@/core/components/input';
import { Textarea } from '@/core/components/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/core/components/form';
import { z } from 'zod';
import DOMPurify from 'dompurify';

type TaskFormInput = z.input<typeof taskSchema>;
type TaskFormOutput = z.output<typeof taskSchema>;

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: TaskFormOutput) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

function TaskForm({ task, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const form = useForm<TaskFormInput, any, TaskFormOutput>({
    resolver: zodResolver(taskSchema),
    mode: 'onBlur',
    defaultValues: {
      titulo: task?.titulo || '',
      descricao: task?.descricao || '',
      dataVencimento: task?.dataVencimento || '',
      horaVencimento: task?.horaVencimento || '',
      importancia: task?.importancia || 'Média',
    },
  });

  const handleSubmit = (data: TaskFormOutput) => {
    const sanitizedData = {
      ...data,
      descricao: data.descricao ? DOMPurify.sanitize(data.descricao) : undefined,
    };
    onSubmit(sanitizedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título *</FormLabel>
              <FormControl>
                <Input placeholder="Digite o título da tarefa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Digite uma descrição detalhada (opcional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="dataVencimento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Vencimento</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="DD/MM/AAAA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="horaVencimento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de Vencimento</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="HH:MM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="importancia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Importância *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a importância" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : task ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export { TaskForm };
