import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import ChatHistory from './ChatHistory';
import { VOTE_COMMAND } from './constant';
import Ranking from './Ranking';
import ResultBarChart from './ResultBarChart';
import ResultPieChart from './ResultPieChart';
import VoteCommand from './VoteCommand';

const Vote = () => {
  const [chartType, setChartType] = useState('pie');

  return (
    <Box sx={{ position: 'relative' }}>
      <Typography
        gutterBottom
        sx={{ '& code': { backgroundColor: 'lightyellow' } }}
        variant="h4"
      >
        <code>{VOTE_COMMAND} [키]</code> 채팅만 집계됩니다.
        <br />
        어떤 방에서 투표하던 아이디당 한 표만 집계되며, 중복 투표 시 마지막 표만
        유효합니다.
      </Typography>

      <Stack spacing={1} sx={{ zoom: 0.7 }}>
        <Box sx={{ position: 'absolute', right: 0 }}>
          <ChatHistory />
        </Box>

        <VoteCommand />

        <Box sx={{ width: 'fit-content', alignSelf: 'center' }}>
          <FormControl>
            <RadioGroup
              onChange={(event) => {
                setChartType(event.target.value);
              }}
              row
              value={chartType}
            >
              <FormControlLabel control={<Radio />} label="Pie" value="pie" />
              <FormControlLabel control={<Radio />} label="Bar" value="bar" />
              <FormControlLabel control={<Radio />} label="Rank" value="rank" />
            </RadioGroup>
          </FormControl>
          {
            {
              pie: <ResultPieChart />,
              bar: <ResultBarChart />,
              rank: <Ranking />,
            }[chartType]
          }
        </Box>
      </Stack>
    </Box>
  );
};

export default Vote;
