import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { VOTE_COMMAND } from './constant';
import useStore from './hooks/useStore';

const VoteCommand = () => {
  const [votingItems] = useStore('votingItems', {});

  return (
    <Stack spacing={1} sx={{ color: 'black', minWidth: 100, minHeight: 100 }}>
      {Object.entries(votingItems).map(([key, value]) => (
        <Stack
          direction="row"
          key={key}
          spacing={1}
          sx={{ alignItems: 'center' }}
        >
          <Typography sx={{ fontSize: 20, fontWeight: 'bold' }}>
            {value.name}:
          </Typography>
          <Chip
            label={`${VOTE_COMMAND} ${key}`}
            sx={{
              backgroundColor: '#ebebeb',
              fontSize: 20,
              fontWeight: 'bold',
            }}
          />
        </Stack>
      ))}
    </Stack>
  );
};

export default VoteCommand;
