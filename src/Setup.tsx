import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useState } from 'react';

import FormLabel from './components/FormLabel';
import StreamerList from './components/StreamerList';
import VotingItemList from './components/VotingItemList';
import { VOTE_COMMAND } from './constant';
import { useDeleteSoopQuery, usePostSoopQuery } from './hooks/useSoopQuery';
import useStore from './hooks/useStore';
import { useDeleteStoresQuery } from './hooks/useStoreQuery';
import {
  usePostVoteClearQuery,
  usePostVoteStartQuery,
  usePostVoteStopQuery,
} from './hooks/useVoteQuery';

const Setup = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [streamerIds, setStreamerIds] = useStore('streamerIds', []);
  const [votingItems, setVotingItems] = useStore('votingItems', {});

  const { mutateAsync: connectMutateAsync } = usePostSoopQuery();
  const { mutate: disconnectMutate } = useDeleteSoopQuery();
  const { mutate: voteClearMutate } = usePostVoteClearQuery();
  const { mutate: voteStartMutate } = usePostVoteStartQuery();
  const { mutate: voteStopMutate } = usePostVoteStopQuery();
  const { mutate: clearMutate } = useDeleteStoresQuery();

  const handleStreamerAdd = (value: string) => {
    setStreamerIds((oldValue) => {
      const set = new Set(oldValue);
      set.add(value);
      return Array.from(set);
    });
  };

  const handleStreamerDelete = (value: string) => {
    setStreamerIds((oldValue) => oldValue.filter((item) => item !== value));
  };

  const handleVotingAdd = (key: string, name: string, color: string) => {
    setVotingItems((oldValue) => {
      return { ...oldValue, [key]: { name, color } };
    });
  };

  const handleVotingDelete = (key: string) => {
    setVotingItems((oldValue) => {
      const { [key]: _, ...newValue } = oldValue;
      return newValue;
    });
  };

  const handleConnect = async (value: string) => {
    try {
      await connectMutateAsync(value);
    } catch {
      alert('연결 실패!');
      return false;
    }
    return true;
  };

  const handleDisconnect = (value: string): undefined => {
    disconnectMutate(value);
  };

  return (
    <Stack spacing={2}>
      <FormLabel
        description="채팅을 연결할 스트리머의 SOOP ID를 등록하고 버튼을 눌러 연결하세요."
        label="SOOP ID 연결"
      >
        <StreamerList
          data={streamerIds}
          onAdd={handleStreamerAdd}
          onConnect={handleConnect}
          onDelete={handleStreamerDelete}
          onDisconnect={handleDisconnect}
        />
      </FormLabel>

      <FormLabel
        description={`정확히 '${VOTE_COMMAND} [키]' 형태로 입력한 채팅만 집계됩니다.`}
        label="투표 항목"
      >
        <VotingItemList
          data={votingItems}
          onAdd={handleVotingAdd}
          onDelete={handleVotingDelete}
        />
      </FormLabel>

      <FormLabel
        description="'SOOP ID 연결'에서 채팅이 연결된 채팅방만 집계가 됩니다."
        label="투표 집계"
      >
        {isStarted ? (
          <Button
            color="error"
            onClick={() => {
              voteStopMutate();
              setIsStarted(false);
            }}
            size="large"
            variant="contained"
          >
            집계 중지
          </Button>
        ) : (
          <Button
            color="primary"
            onClick={() => {
              voteStartMutate();
              setIsStarted(true);
            }}
            size="large"
            variant="contained"
          >
            집계 시작
          </Button>
        )}
      </FormLabel>

      <FormLabel
        description="모든 설정은 실시간으로 저장됩니다. 처음부터 하고 싶으면 초기화 버튼을 누르세요."
        label="초기화"
      >
        <Stack direction="row" spacing={1}>
          <Button
            color="warning"
            onClick={() => voteClearMutate()}
            variant="contained"
          >
            집계 데이터 초기화
          </Button>
          <Button
            color="error"
            onClick={() => {
              voteClearMutate();
              clearMutate();
            }}
            variant="contained"
          >
            전체 초기화
          </Button>
        </Stack>
      </FormLabel>
    </Stack>
  );
};

export default Setup;
