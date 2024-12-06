import React, { StrictMode } from 'react';

import '@edifice.io/bootstrap/dist/index.css';
import { EdificeClientProvider, EdificeThemeProvider } from '@edifice.io/react';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './i18n';

import { router } from './routes';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement!);

if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, root, 1000);
  });
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: unknown) => {
      if (error === '0090') window.location.replace('/auth/login');
    },
  }),
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2,
    },
  },
});

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <EdificeClientProvider
        params={{
          app: 'collaborativewall',
        }}
      >
        <EdificeThemeProvider>
          <RouterProvider router={router(queryClient)} />
        </EdificeThemeProvider>
      </EdificeClientProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
