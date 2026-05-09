import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';

import fetchBase from '../utils/fetchBase';
import fetchJson from '../utils/fetchJson';

export const usePostSoopQuery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (streamerId: string) =>
      fetchBase(`/api/soop/${streamerId}`, { method: 'POST' }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['soop', variables] });
    },
  });
};

export type GetSoopResponse = { id: string; isPlay: boolean };

export const useGetSoopQueries = (streamerIds: string[]) => {
  return useQueries({
    queries: streamerIds.map((streamerId) => ({
      queryKey: ['soop', streamerId],
      queryFn: () => fetchJson<GetSoopResponse>(`/api/soop/${streamerId}`),
    })),
    combine: (results) =>
      results.map(
        (result, index) =>
          result.data ?? { id: streamerIds[index], isPlay: false },
      ),
  });
};

export const useDeleteSoopQuery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (streamerId: string) =>
      fetchBase(`/api/soop/${streamerId}`, { method: 'DELETE' }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['soop', variables] });
    },
  });
};
