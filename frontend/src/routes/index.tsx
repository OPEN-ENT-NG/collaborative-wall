import { LoadingScreen } from "@edifice-ui/react";
import { QueryClient } from "@tanstack/react-query";
import { odeServices } from "edifice-ts-client";
import {
  ActionFunctionArgs,
  Form,
  Link,
  RouteObject,
  createBrowserRouter,
  useLoaderData,
} from "react-router-dom";

import ErrorPage from "~/components/page-error";
import { useCollaborativeWallRedirect } from "~/hooks/useCollaborativeWallRedirect";
import { CollaborativeWallProps } from "~/models/wall";

import "~/styles/index.css";

/* TEMPORARY */
function Root() {
  const data = useLoaderData() as CollaborativeWallProps[];

  const isLoading = useCollaborativeWallRedirect();

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <ul>
        {data.map((wall) => {
          return (
            <li key={wall._id}>
              <Link to={`id/${wall._id}`}>{wall._id}</Link>
            </li>
          );
        })}
      </ul>
      <Form method="post">
        <h1>Create a collaborative wall</h1>
        <input type="text" name="name" />
        <button>create</button>
      </Form>
    </>
  );
}
const routes = (queryClient: QueryClient): RouteObject[] => [
  /* TEMPORARY */
  {
    path: "/",
    loader: async () => {
      const walls = await odeServices
        .http()
        .get<CollaborativeWallProps[]>(`/collaborativewall/list/all`);

      return walls;
    },
    action: async ({ request }: ActionFunctionArgs) => {
      const formData = await request.formData();
      const name = formData.get("name");

      const data = {
        name,
        background: "/collaborativewall/public/img/default.jpg",
      };
      const wall = await odeServices.http().post("/collaborativewall", data);

      return { wall };
    },
    element: <Root />,
    /* children: [
      {
        index: true,
        element: <Explorer config={explorerConfig} />,
      },
    ], */
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
