import { Button } from '@/core/components/button';
import { useNavigation } from '@/core/hooks/useNavigation';

export const NotFoundPage = () => {
  const { goHome } = useNavigation();

  return (
    <div className='flex h-full min-h-fit flex-col items-center justify-center gap-4 px-6 py-12'>
      <h1 className='text-4xl font-bold'>404</h1>
      <p className='text-muted-foreground'>Página não encontrada</p>
      <Button onClick={goHome}>Voltar para o início</Button>
    </div>
  );
};
