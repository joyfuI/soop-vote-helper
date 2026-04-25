import { useMutation } from '@tanstack/react-query';

import fetchBase from '../utils/fetchBase';

export const usePostVoteStartQuery = () => {
  return useMutation({
    mutationFn: () => fetchBase('/api/vote/start', { method: 'POST' }),
  });
};

export const usePostVoteStopQuery = () => {
  return useMutation({
    mutationFn: () => fetchBase('/api/vote/stop', { method: 'POST' }),
  });
};

export const usePostVoteClearQuery = () => {
  return useMutation({
    mutationFn: () => fetchBase('/api/vote/clear', { method: 'POST' }),
  });
};
