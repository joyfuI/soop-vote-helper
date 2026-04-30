import { createHashRouter } from 'react-router';

import App from './App';
import ChatHistory from './ChatHistory';
import HistoryLineChart from './HistoryLineChart';
import Ranking from './Ranking';
import ResultBarChart from './ResultBarChart';
import ResultPieChart from './ResultPieChart';
import VoteCommand from './VoteCommand';

export const createAppRouter = () =>
  createHashRouter([
    { path: '/', Component: App },
    { path: '/vote-command', Component: VoteCommand },
    { path: '/chat-history', Component: ChatHistory },
    { path: '/result-pie-chart', Component: ResultPieChart },
    { path: '/result-bar-chart', Component: ResultBarChart },
    { path: '/ranking', Component: Ranking },
    { path: '/history-line-chart', Component: HistoryLineChart },
  ]);
