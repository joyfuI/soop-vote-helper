import type { PieValueType } from '@mui/x-charts';
import { PieChart, pieClasses } from '@mui/x-charts/PieChart';
import { useMemo } from 'react';

import { VOTE_COMMAND } from './constant';
import { useGetChatVoteResultQuery } from './hooks/useChatQuery';
import useStore from './hooks/useStore';

const ResultPieChart = () => {
  const [votingItems] = useStore('votingItems', {});

  const { data } = useGetChatVoteResultQuery();

  const chartData = useMemo(() => {
    const votingKeys = Object.keys(votingItems);
    const originalData =
      data?.reduce<Record<string, PieValueType>>((acc, cur) => {
        const key = cur.comment.replace(`${VOTE_COMMAND} `, '');
        acc[key] = {
          id: key,
          value: cur.voteCount,
          label: votingItems[key]?.name,
          color: votingItems[key]?.color,
        };
        return acc;
      }, {}) ?? {};
    return votingKeys.map(
      (key) =>
        originalData[key] ?? {
          id: key,
          value: 0,
          label: votingItems[key].name,
          color: votingItems[key].color,
        },
    );
  }, [votingItems, data]);

  return (
    <PieChart
      height={500}
      series={[{ data: chartData, arcLabel: 'value' }]}
      slotProps={{
        legend: { sx: { color: 'black', fontSize: 40, fontWeight: 'bold' } },
        tooltip: { trigger: 'none' },
      }}
      sx={{
        [`& .${pieClasses.arcLabel}`]: { fontSize: 35, fontWeight: 'bold' },
      }}
      width={500}
    />
  );
};

export default ResultPieChart;
