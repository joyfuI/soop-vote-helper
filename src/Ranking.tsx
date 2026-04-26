import { useAutoAnimate } from '@formkit/auto-animate/react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';

import { VOTE_COMMAND } from './constant';
import { useGetChatVoteResultQuery } from './hooks/useChatQuery';
import useStore from './hooks/useStore';

const Ranking = () => {
  const [votingItems] = useStore('votingItems', {});

  const { data } = useGetChatVoteResultQuery();

  const [animationParent] = useAutoAnimate();

  const rankingData = useMemo(() => {
    const votingKeys = Object.keys(votingItems);
    const originalData =
      data?.reduce<
        Record<string, { key: string; name: string; voteCount: number }>
      >((acc, cur) => {
        const key = cur.comment.replace(`${VOTE_COMMAND} `, '');
        acc[key] = {
          key,
          name: votingItems[key]?.name,
          voteCount: cur.voteCount,
        };
        return acc;
      }, {}) ?? {};
    return votingKeys
      .map(
        (key) =>
          originalData[key] ?? {
            key,
            name: votingItems[key].name,
            voteCount: 0,
          },
      )
      .toSorted((a, b) => b.voteCount - a.voteCount);
  }, [votingItems, data]);

  return (
    <Stack
      ref={animationParent}
      spacing={1}
      sx={{ color: 'black', minWidth: 200, minHeight: 200 }}
    >
      {rankingData.map((item) => (
        <Stack
          direction="row"
          key={item.key}
          spacing={3}
          sx={{ justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography
            sx={{ fontSize: 40, fontWeight: 'bold', whiteSpace: 'nowrap' }}
          >
            {item.name}
          </Typography>
          <Chip
            label={item.voteCount}
            sx={{
              height: 56,
              backgroundColor:
                ['#fdc700', '#cad5e2', '#bb4d00'][
                  rankingData.findIndex(
                    ({ voteCount }) => voteCount === item.voteCount,
                  )
                ] ?? '#ebebeb',
              fontSize: 40,
              fontWeight: 'bold',
            }}
          />
        </Stack>
      ))}
    </Stack>
  );
};

export default Ranking;
