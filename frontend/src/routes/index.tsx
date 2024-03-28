import { QueryClient } from "@tanstack/react-query";
import { Explorer } from "ode-explorer/lib";
import { RouteObject, createBrowserRouter } from "react-router-dom";

import Root from "./root";
import { explorerConfig } from "~/config/config";
import { PageError } from "~/routes/page-error";

const routes = (queryClient: QueryClient): RouteObject[] => [
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        async lazy() {
          const { rootLoader } = await import("~/routes/root");
          return {
            loader: rootLoader,
          };
        },
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
          const { noteLoader, UpdateNoteModal } = await import(
            "../components/update-note-modal"
          );
          return { loader: noteLoader, Component: UpdateNoteModal };
        },
      },
    ],
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
