import type { BarSeries } from '@mui/x-charts/BarChart';
import { BarChart, barClasses } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { useMemo } from 'react';

import { VOTE_COMMAND } from './constant';
import { useGetChatVoteResultQuery } from './hooks/useChatQuery';
import useStore from './hooks/useStore';

const ResultBarChart = () => {
  const [votingItems] = useStore('votingItems', {});

  const { data } = useGetChatVoteResultQuery();

  const chartData = useMemo(() => {
    const votingKeys = Object.keys(votingItems);
    const originalData =
      data?.reduce<Record<string, BarSeries>>((acc, cur) => {
        const key = cur.comment.replace(`${VOTE_COMMAND} `, '');
        acc[key] = {
          data: [cur.voteCount],
          label: votingItems[key]?.name,
          color: votingItems[key]?.color,
          barLabel: 'value',
          barLabelPlacement: 'center',
        };
        return acc;
      }, {}) ?? {};
    return votingKeys.map(
      (key) =>
        originalData[key] ?? {
          data: [0],
          label: votingItems[key].name,
          color: votingItems[key].color,
          barLabel: 'value',
          barLabelPlacement: 'center',
        },
    );
  }, [votingItems, data]);

  return (
    <BarChart
      height={500}
      series={chartData}
      slotProps={{
        legend: { sx: { color: 'black', fontSize: 40, fontWeight: 'bold' } },
        tooltip: { trigger: 'none' },
      }}
      sx={{
        [`& .${barClasses.label}`]: { fontSize: 35, fontWeight: 'bold' },
        [`& .${axisClasses.bottom} .${axisClasses.tickLabel}`]: {
          display: 'none',
        },
      }}
    />
  );
};

export default ResultBarChart;
