import { QueryClient } from '@tanstack/react-query';
import { Explorer } from 'ode-explorer/lib';
import { RouteObject, createBrowserRouter } from 'react-router-dom';

import { explorerConfig } from '~/config';
import { PageError } from '~/routes/page-error';
import { NotFound } from './not-found';
const routes = (queryClient: QueryClient): RouteObject[] => [
  {
    path: '/*',
    async lazy() {
      const { loader, Root: Component } = await import('~/routes/root');
      return {
        loader,
        Component,
      };
    },
    children: [
      {
        index: true,
        element: <Explorer config={explorerConfig} />,
      },
      {
        path: 'id/:wallId',
        async lazy() {
          const { loader, Component } = await import('./collaborative-wall');
          return {
            loader: loader(queryClient),
            Component,
          };
        },
        children: [
          {
            path: 'note',
            async lazy() {
              const { Component } = await import('./note-modal');
              return { Component };
            },
          },
          {
            path: 'note/:noteId',
            async lazy() {
              const { noteLoader, Component } = await import('./note-modal');
              return { loader: noteLoader(queryClient), Component };
            },
          },
        ],
        errorElement: <PageError />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
    errorElement: <PageError />,
  },
  {
    path: 'print/id/:wallId',
    async lazy() {
      const { wallLoader, Component } = await import('./print');
      return {
        loader: wallLoader(queryClient),
        Component,
      };
    },
    errorElement: <PageError />,
  },
];

export const basename = import.meta.env.PROD ? '/collaborativewall' : '/';

export const router = (queryClient: QueryClient) =>
  createBrowserRouter(routes(queryClient), {
    basename,
  });
