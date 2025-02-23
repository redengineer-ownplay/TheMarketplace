import { useCallback } from 'react';
import { LoginRequest } from '@/types/api/auth';
import { login, logout } from '@/services/api/auth';

export const useAuth = () => {
  const handleLogin = useCallback(async (data: LoginRequest) => {
    return login(data);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
  }, []);

  return {
    login: handleLogin,
    logout: handleLogout,
  };
};
