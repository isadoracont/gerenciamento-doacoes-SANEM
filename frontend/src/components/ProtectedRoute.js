"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '../services/authService';

export default function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await authService.validateToken();
        setIsAuthenticated(authenticated);
        
        if (!authenticated) {
          router.push('/');
        }
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
