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
import { Wall } from "~/models/wall";

import "~/styles/index.css";

/* TEMPORARY */
function Root() {
  const data = useLoaderData() as Wall[];

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
const routes: RouteObject[] = [
  /* TEMPORARY */
  {
    path: "/",
    loader: async () => {
      const walls = await odeServices
        .http()
        .get<Wall>(`/collaborativewall/list/all`);

      console.log(walls);
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
