import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { DotPath, DotPathValue, StoreType } from '../types';
import fetchBase from '../utils/fetchBase';
import fetchJson from '../utils/fetchJson';

export const useDeleteStoresQuery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchBase(`/api/store`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store'] });
    },
  });
};

export const useGetStoreQuery = <K extends DotPath<StoreType>>(key: K) => {
  return useQuery({
    queryKey: ['store', key],
    queryFn: () => fetchJson<DotPathValue<StoreType, K>>(`/api/store/${key}`),
  });
};

export const usePutStoreQuery = <K extends DotPath<StoreType>>(key: K) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (value: DotPathValue<StoreType, K>) =>
      fetchBase(`/api/store/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store', key] });
    },
  });
};

export const useDeleteStoreQuery = <K extends DotPath<StoreType>>(key: K) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchBase(`/api/store/${key}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store', key] });
    },
  });
};
