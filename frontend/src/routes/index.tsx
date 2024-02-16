import { QueryClient } from "@tanstack/react-query";
import { Explorer } from "ode-explorer/lib";
import { RouteObject, createBrowserRouter } from "react-router-dom";

import Root from "./root";
import ErrorPage from "~/components/page-error";
import { explorerConfig } from "~/config/config";

const routes = (queryClient: QueryClient): RouteObject[] => [
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        // @ts-ignore
        element: <Explorer config={explorerConfig} />,
      },
    ],
  },
  {
    path: "id/:wallId",
    async lazy() {
      const { wallLoader, CollaborativeWall } = await import(
        "./collaborative-wall"
      );
      return {
        loader: wallLoader(queryClient),
        Component: CollaborativeWall,
      };
    },
    children: [
      {
        path: "note/:noteId",
        async lazy() {
          const { noteLoader, NoteModal } = await import(
            "../components/note-modal"
          );
          return { loader: noteLoader, Component: NoteModal };
        },
      },
    ],
    errorElement: <ErrorPage />,
  },
];

export const router = (queryClient: QueryClient) =>
  createBrowserRouter(routes(queryClient), {
    basename: import.meta.env.PROD ? "/collaborativewall" : "/",
  });
