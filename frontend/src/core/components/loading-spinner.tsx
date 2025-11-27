import * as React from 'react';
import { cn } from '@/core/lib/utils';
import { Loader2 } from 'lucide-react';

function LoadingSpinner({ className, ...props }: React.ComponentProps<typeof Loader2>) {
  return (
    <Loader2
      className={cn('h-4 w-4 animate-spin', className)}
      {...props}
    />
  );
}

export { LoadingSpinner };
