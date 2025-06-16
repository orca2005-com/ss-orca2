import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('API call failed:', err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

export function usePaginatedApi<T>(
  apiCall: (page: number, limit: number) => Promise<{ data: T[]; pagination: any }>,
  limit = 10
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState<any>(null);

  const fetchData = useCallback(async (pageNum: number, reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall(pageNum, limit);
      
      if (reset) {
        setData(result.data);
      } else {
        setData(prev => [...prev, ...result.data]);
      }
      
      setPagination(result.pagination);
      setHasMore(pageNum < result.pagination.totalPages);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Paginated API call failed:', err);
    } finally {
      setLoading(false);
    }
  }, [apiCall, limit]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchData(page + 1);
    }
  }, [fetchData, loading, hasMore, page]);

  const refresh = useCallback(() => {
    fetchData(1, true);
  }, [fetchData]);

  useEffect(() => {
    fetchData(1, true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    hasMore,
    pagination,
    loadMore,
    refresh,
  };
}