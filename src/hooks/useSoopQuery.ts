import { useMutation } from '@tanstack/react-query';

import fetchBase from '../utils/fetchBase';

export const usePostSoopQuery = () => {
  return useMutation({
    mutationFn: (streamerId: string) =>
      fetchBase(`/api/soop/${streamerId}`, { method: 'POST' }),
  });
};

export const useDeleteSoopQuery = () => {
  return useMutation({
    mutationFn: (streamerId: string) =>
      fetchBase(`/api/soop/${streamerId}`, { method: 'DELETE' }),
  });
};
