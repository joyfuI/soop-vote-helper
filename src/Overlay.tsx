import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import ChatHistory from './ChatHistory';
import OverlayBox from './components/OverlayBox';
import ResultBarChart from './ResultBarChart';
import ResultPieChart from './ResultPieChart';
import VoteCommand from './VoteCommand';

const Overlay = () => {
  return (
    <>
      <Typography gutterBottom>
        URL을 복사하여 OBS, 프릭샷 등에 오버레이를 띄우는데 사용할 수 있습니다.
      </Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
        <OverlayBox path="/vote-command">
          <VoteCommand />
        </OverlayBox>
        <OverlayBox path="/chat-history">
          <ChatHistory />
        </OverlayBox>
        <OverlayBox path="/result-pie-chart">
          <ResultPieChart />
        </OverlayBox>
        <OverlayBox path="/result-bar-chart">
          <ResultBarChart />
        </OverlayBox>
      </Stack>
    </>
  );
};

export default Overlay;
