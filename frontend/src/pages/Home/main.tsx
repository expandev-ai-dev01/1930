import { useEffect } from 'react';
import { useNavigation } from '@/core/hooks/useNavigation';

function HomePage() {
  const { navigate } = useNavigation();

  useEffect(() => {
    navigate('/');
  }, [navigate]);

  return null;
}

export { HomePage };
