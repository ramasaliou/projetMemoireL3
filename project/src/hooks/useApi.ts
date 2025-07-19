import { useState, useCallback } from 'react';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (url: string, options?: RequestInit) => Promise<T | null>;
  reset: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useApi<T = any>(): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (url: string, options: RequestInit = {}): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(`${API_BASE_URL}${url}`, config);
      const result: ApiResponse<T> = await response.json();

      if (response.ok && result.success) {
        setData(result.data || null);
        return result.data || null;
      } else {
        const errorMessage = result.message || result.error || 'Une erreur est survenue';
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
}

// Hook spécialisé pour les requêtes GET
export function useGet<T = any>(endpoint: string) {
  const api = useApi<T>();
  
  const fetchData = useCallback(async () => {
    return await api.execute(endpoint, { method: 'GET' });
  }, [api, endpoint]);

  return {
    ...api,
    fetchData,
  };
}

// Hook spécialisé pour les requêtes POST
export function usePost<T = any>() {
  const api = useApi<T>();
  
  const postData = useCallback(async (endpoint: string, body: any) => {
    return await api.execute(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }, [api]);

  return {
    ...api,
    postData,
  };
}

// Hook spécialisé pour les requêtes PUT
export function usePut<T = any>() {
  const api = useApi<T>();
  
  const putData = useCallback(async (endpoint: string, body: any) => {
    return await api.execute(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }, [api]);

  return {
    ...api,
    putData,
  };
}

// Hook spécialisé pour les requêtes DELETE
export function useDelete<T = any>() {
  const api = useApi<T>();
  
  const deleteData = useCallback(async (endpoint: string) => {
    return await api.execute(endpoint, { method: 'DELETE' });
  }, [api]);

  return {
    ...api,
    deleteData,
  };
} 