import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/core/components/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  resetKey?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  prevResetKey?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, prevResetKey: props.resetKey };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  static getDerivedStateFromProps(
    props: ErrorBoundaryProps,
    state: ErrorBoundaryState,
  ): Partial<ErrorBoundaryState> | null {
    if (props.resetKey !== state.prevResetKey) {
      return {
        hasError: false,
        error: undefined,
        prevResetKey: props.resetKey,
      };
    }
    return null;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className='flex h-screen w-full flex-col items-center justify-center gap-4'>
            <h1 className='text-2xl font-bold'>Algo deu errado</h1>
            <Button onClick={() => window.location.reload()}>Recarregar</Button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
