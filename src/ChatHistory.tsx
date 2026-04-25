import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import randomColor from 'randomcolor';

import { VOTE_COMMAND } from './constant';
import { useGetChatListQuery } from './hooks/useChatQuery';
import useStore from './hooks/useStore';

const ChatHistory = () => {
  const [votingItems] = useStore('votingItems', {});

  const { data } = useGetChatListQuery({ limit: 10 });

  const votingKeys = Object.keys(votingItems);

  return (
    <Stack
      direction="column-reverse"
      spacing={1}
      sx={{
        minWidth: 100,
        minHeight: 300,
        maxHeight: 300,
        color: 'black',
        overflow: 'hidden',
      }}
    >
      {data?.map((item) => (
        <Typography key={item.id} sx={{ fontSize: 16 }}>
          <span
            style={{
              display: 'inline-block',
              width: 40,
              color: randomColor({ seed: item.streamerId, luminosity: 'dark' }),
              fontSize: 10,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.streamerId}
          </span>{' '}
          |{' '}
          <span
            style={{
              marginRight: 8,
              color: randomColor({ seed: item.userId, luminosity: 'dark' }),
              fontWeight: 'bold',
            }}
          >
            {item.username}
          </span>
          <span
            style={{
              textDecoration: votingKeys.includes(
                item.comment.replace(`${VOTE_COMMAND} `, ''),
              )
                ? 'none'
                : 'line-through',
            }}
          >
            {item.comment}
          </span>
        </Typography>
      ))}
    </Stack>
  );
};

export default ChatHistory;
