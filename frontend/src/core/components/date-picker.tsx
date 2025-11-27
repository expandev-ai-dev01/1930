import { format, type Locale } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/core/lib/utils';
import { Button } from '@/core/components/button';
import { Calendar } from '@/core/components/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/core/components/popover';

export interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  formatStr?: string;
  locale?: Locale;
}

function DatePicker({
  date,
  onDateChange,
  placeholder = 'Selecione uma data',
  disabled = false,
  className,
  formatStr = 'PPP',
  locale = ptBR,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          disabled={disabled}
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !date && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon />
          {date ? format(date, formatStr, { locale }) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar
          mode='single'
          selected={date}
          onSelect={onDateChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
