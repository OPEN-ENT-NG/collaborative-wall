import { RouteObject, createBrowserRouter } from "react-router-dom";

import ErrorPage from "~/components/page-error";

import "~/styles/index.css";

const routes: RouteObject[] = [
  {
    path: "id/:id",
    async lazy() {
      const { wallLoader, CollaborativeWall } = await import(
        "./collaborative-wall"
      );
      return {
        loader: wallLoader,
        Component: CollaborativeWall,
      };
    },
    children: [
      {
        path: "note/:idnote",
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

export const router = createBrowserRouter(routes, {
  basename: import.meta.env.PROD ? "/collaborativewall" : "/",
});
