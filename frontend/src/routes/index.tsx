import { odeServices } from "edifice-ts-client";
import {
  Link,
  RouteObject,
  createBrowserRouter,
  useLoaderData,
} from "react-router-dom";

import { CollaborativeWallProps } from "./collaborative-wall";
import ErrorPage from "~/components/page-error";

import "~/styles/index.css";

/* TEMPORARY */
function Root() {
  const data = useLoaderData() as CollaborativeWallProps[];

  return (
    <ul>
      {data.map((wall) => {
        return (
          <li>
            <Link to={`id/${wall._id}`}>{wall._id}</Link>
          </li>
        );
      })}
    </ul>
  );
}
const routes: RouteObject[] = [
  /* TEMPORARY */
  {
    path: "/",
    loader: async () => {
      const walls = await odeServices
        .http()
        .get<CollaborativeWallProps>(`/collaborativewall/list/all`);

      console.log(walls);
      return walls;
    },
    element: <Root />,
  },
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
