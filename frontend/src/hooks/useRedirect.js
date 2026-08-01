import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function useRedirect() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate('/admin/login', { replace: true });
    else if (!isAdmin) navigate('/', { replace: true });
  }, [user, isAdmin, loading, navigate]);

  return { loading };
}
