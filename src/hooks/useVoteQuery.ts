import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import fetchBase from '../utils/fetchBase';
import fetchJson from '../utils/fetchJson';

export const usePostVoteStartQuery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchBase('/api/vote/start', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vote', 'start'] });
    },
  });
};

export const useGetVoteStartQuery = () => {
  return useQuery({
    queryKey: ['vote', 'start'],
    queryFn: () => fetchJson<boolean>('/api/vote/start'),
  });
};

export const usePostVoteStopQuery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchBase('/api/vote/stop', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vote', 'start'] });
    },
  });
};

export const usePostVoteClearQuery = () => {
  return useMutation({
    mutationFn: () => fetchBase('/api/vote/clear', { method: 'POST' }),
  });
};
