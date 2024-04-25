import { QueryClient } from "@tanstack/react-query";
import { Explorer } from "ode-explorer/lib";
import { RouteObject, createBrowserRouter } from "react-router-dom";

import { explorerConfig } from "~/config/config";
import { PageError } from "~/routes/page-error";
import { NotFound } from "./not-found";
import Root from "./root";
import { CollaborativeWall, loader as wallLoader } from "./collaborative-wall";

const routes = (queryClient: QueryClient): RouteObject[] => [
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        async lazy() {
          const { loader } = await import("~/routes/root");
          return {
            loader,
          };
        },
        // @ts-ignore
        element: <Explorer config={explorerConfig} />,
      },
      {
        path: "id/:wallId",
        loader: wallLoader(queryClient),
        element: <CollaborativeWall />,

        /* async lazy() {
          const { loader, CollaborativeWall } = await import(
            "./collaborative-wall"
          );
          return {
            loader: loader(queryClient),
            Component: CollaborativeWall,
          };
        }, */
        children: [
          {
            path: "note",
            async lazy() {
              const { NoteModal } = await import(
                "../features/note-modal/components/note-modal"
              );
              return { Component: NoteModal };
            },
          },
          {
            path: "note/:noteId",
            async lazy() {
              const { noteLoader, NoteModal } = await import(
                "../features/note-modal/components/note-modal"
              );
              return { loader: noteLoader, Component: NoteModal };
            },
          },
        ],
        errorElement: <PageError />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
    errorElement: <PageError />,
  },
  {
    path: "print/id/:wallId",
    async lazy() {
      const { wallLoader, CollaborativeWall } = await import("./print");
      return {
        loader: wallLoader(queryClient),
        Component: CollaborativeWall,
      };
    },
    errorElement: <PageError />,
  },
];

export const basename = import.meta.env.PROD ? "/collaborativewall" : "/";

export const router = (queryClient: QueryClient) =>
  createBrowserRouter(routes(queryClient), {
    basename,
  });
