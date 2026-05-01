import { useQuery } from '@tanstack/react-query';

import fetchJson from '../utils/fetchJson';

export const useGetChatListQuery = (params?: { limit?: number }) => {
  return useQuery({
    queryKey: ['chat', 'list', params],
    queryFn: () =>
      fetchJson<
        {
          id: number;
          streamerId: string;
          receivedTime: string;
          username: string;
          userId: string;
          comment: string;
        }[]
      >(
        `/api/chat/list?${new URLSearchParams(params as Record<string, string>).toString()}`,
      ),
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
  });
};

export const useGetChatVoteResultQuery = () => {
  return useQuery({
    queryKey: ['chat', 'vote', 'result'],
    queryFn: () =>
      fetchJson<{ comment: string; voteCount: number }[]>(
        '/api/chat/vote/result',
      ),
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
  });
};

export const useGetChatVoteHistoryQuery = (params?: {
  windowMinutes?: number;
  bucketMinutes?: number;
}) => {
  return useQuery({
    queryKey: ['chat', 'vote', 'history', params],
    queryFn: () =>
      fetchJson<{ bucketTime: string; comment: string; voteCount: number }[]>(
        `/api/chat/vote/history?${new URLSearchParams(params as Record<string, string>).toString()}`,
      ),
    refetchInterval: 1000,
    refetchIntervalInBackground: true,
  });
};
