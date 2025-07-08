import { useState, useEffect, useCallback } from 'react';

export interface MenuItem {
  id: string;
  key: string;
  label: string;
  to?: string;
  icon?: string;
  type: 'menu' | 'submenu' | 'section';
  order: number;
  isActive: boolean;
  isExternal?: boolean;
  target?: string;
  children?: MenuItem[];
  roles?: any[];
  permissions?: any[];
}

export interface UseMenuReturn {
  menus: MenuItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  clearCache: () => void;
}

// Cache for menu data
const MENU_CACHE_KEY = 'user_menus_cache';
const MENU_CACHE_TIMESTAMP_KEY = 'user_menus_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const useMenu = (): UseMenuReturn => {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearCache = useCallback(() => {
    localStorage.removeItem(MENU_CACHE_KEY);
    localStorage.removeItem(MENU_CACHE_TIMESTAMP_KEY);
  }, []);

  const getCachedMenus = useCallback((): MenuItem[] | null => {
    try {
      const cached = localStorage.getItem(MENU_CACHE_KEY);
      const timestamp = localStorage.getItem(MENU_CACHE_TIMESTAMP_KEY);

      if (cached && timestamp) {
        const cacheTime = parseInt(timestamp);
        const now = Date.now();

        if (now - cacheTime < CACHE_DURATION) {
          return JSON.parse(cached);
        }
      }
    } catch (err) {
      console.warn('Failed to get cached menus:', err);
    }
    return null;
  }, []);

  const setCachedMenus = useCallback((menuData: MenuItem[]) => {
    try {
      localStorage.setItem(MENU_CACHE_KEY, JSON.stringify(menuData));
      localStorage.setItem(MENU_CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (err) {
      console.warn('Failed to cache menus:', err);
    }
  }, []);

  const fetchMenus = useCallback(async (useCache = true) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (useCache) {
        const cachedMenus = getCachedMenus();
        if (cachedMenus) {
          setMenus(cachedMenus);
          setLoading(false);
          return;
        }
      }

      // Get token from localStorage
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');

      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/menus/user-menus`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If unauthorized, clear cache and token
        if (response.status === 401) {
          clearCache();
          localStorage.removeItem('token');
          localStorage.removeItem('access_token');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMenus(data);
      setCachedMenus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch menus');
    } finally {
      setLoading(false);
    }
  }, [getCachedMenus, setCachedMenus, clearCache]);

  const refetch = useCallback(() => {
    fetchMenus(false); // Force refresh without cache
  }, [fetchMenus]);

  useEffect(() => {
    fetchMenus(true); // Use cache on initial load
  }, [fetchMenus]);

  return {
    menus,
    loading,
    error,
    refetch,
    clearCache,
  };
};

export default useMenu;
