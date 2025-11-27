import { useNavigate, useLocation, useParams } from 'react-router-dom';

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const goBack = () => navigate(-1);
  const goHome = () => navigate('/');
  const isCurrentPath = (path: string) => location.pathname === path;

  return {
    navigate,
    location,
    params,
    goBack,
    goHome,
    isCurrentPath,
  };
};
