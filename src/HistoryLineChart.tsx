import { labelMarkClasses } from '@mui/x-charts/ChartsLabel';
import type { LineSeries } from '@mui/x-charts/LineChart';
import { LineChart, lineClasses } from '@mui/x-charts/LineChart';
import { useMemo } from 'react';

import { VOTE_COMMAND } from './constant';
import { useGetChatVoteHistoryQuery } from './hooks/useChatQuery';
import useStore from './hooks/useStore';

const HistoryLineChart = () => {
  const [votingItems] = useStore('votingItems', {});

  const { data } = useGetChatVoteHistoryQuery({ windowMinutes: 10 });

  const chartData = useMemo(() => {
    const votingKeys = Object.keys(votingItems);
    const originalData =
      data?.reduce<Record<string, LineSeries>>((acc, cur) => {
        const key = cur.comment.replace(`${VOTE_COMMAND} `, '');
        if (acc[key]?.data) {
          acc[key].data = [...acc[key].data, cur.voteCount];
        } else {
          acc[key] = {
            data: [cur.voteCount],
            label: votingItems[key]?.name,
            color: votingItems[key]?.color,
            connectNulls: true,
            showMark: true,
          };
        }
        return acc;
      }, {}) ?? {};
    return votingKeys.map(
      (key) =>
        originalData[key] ?? {
          data: [0],
          label: votingItems[key].name,
          color: votingItems[key].color,
          connectNulls: true,
          showMark: true,
        },
    );
  }, [votingItems, data]);

  const xLabels = useMemo(
    () =>
      Array.from(new Set(data?.map((item) => item.minute))).map((item) => {
        const date = new Date(item);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      }),
    [data],
  );

  return (
    <LineChart
      height={500}
      series={chartData}
      slotProps={{
        legend: { sx: { color: 'black', fontSize: 40, fontWeight: 'bold' } },
        tooltip: { trigger: 'none' },
      }}
      sx={{
        [`& .${lineClasses.line}, & .${lineClasses.mark}`]: { strokeWidth: 4 },
        [`& .${labelMarkClasses.fill}`]: { strokeWidth: 4 },
        [`& .${labelMarkClasses.root}`]: { width: 20, height: 20 },
      }}
      xAxis={[{ scaleType: 'point', data: xLabels }]}
    />
  );
};

export default HistoryLineChart;
