import { useState, useCallback } from 'react';

// Hook personalizado para gerenciar estado da API
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      setError(err.message || 'Erro desconhecido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError,
  };
};

// Hook específico para listas de dados
export const useApiList = (apiCall) => {
  const [data, setData] = useState([]);
  const { loading, error, execute, clearError } = useApi();

  const loadData = useCallback(async (filters = {}) => {
    try {
      const result = await execute(() => apiCall(filters));
      setData(result || []);
      return result;
    } catch (err) {
      setData([]);
      throw err;
    }
  }, [apiCall, execute]);

  const addItem = useCallback((newItem) => {
    setData(prev => [...prev, newItem]);
  }, []);

  const updateItem = useCallback((id, updatedItem) => {
    setData(prev => prev.map(item => 
      item.id === id ? { ...item, ...updatedItem } : item
    ));
  }, []);

  const removeItem = useCallback((id) => {
    setData(prev => prev.filter(item => item.id !== id));
  }, []);

  return {
    data,
    loading,
    error,
    loadData,
    addItem,
    updateItem,
    removeItem,
    clearError,
  };
};
