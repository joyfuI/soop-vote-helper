import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';

import { VOTE_COMMAND } from './constant';
import { createAppRouter } from './router';
import theme from './theme';

const queryClient = new QueryClient();
const router = createAppRouter();

const rootElement = document.getElementById('root');
if (rootElement && !rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ThemeProvider noSsr storageManager={null} theme={theme}>
        <QueryClientProvider client={queryClient}>
          <CssBaseline />
          <RouterProvider router={router} />
          {!location.hash ? <ReactQueryDevtools /> : null}
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>,
  );
}

// test
const streamerIds = ['dlsn9911', '9mogu9', 'haroha', 'kgoyangyeeee'] as const;
let isStarted: NodeJS.Timeout;
window.test = (
  streamerId: string,
  userId: string,
  comment: string,
  username?: string,
) => {
  if (streamerId) {
    window.electron.testChat(streamerId, userId, comment, username);
  } else {
    if (isStarted) {
      clearInterval(isStarted);
    } else {
      isStarted = setInterval(() => {
        const streamerId =
          streamerIds[Math.floor(Math.random() * streamerIds.length)];
        let userId: string;
        do {
          userId = Math.random().toString(36).substring(2, 10);
        } while (userId.length !== 8);
        const comment = `${VOTE_COMMAND} ${Math.floor(Math.random() * 5) + 1}`;
        window.electron.testChat(
          streamerId,
          userId.slice(0, 2),
          comment,
          userId,
        );
      }, 100);
    }
  }
};
