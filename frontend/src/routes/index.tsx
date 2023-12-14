import { createBrowserRouter } from "react-router-dom";

import ErrorPage from "~/components/page-error";

import "~/styles/index.css";

const routes = [
  {
    path: "id/:id",
    async lazy() {
      const { mapLoader, CollaborativeWall } = await import(
        "./collaborativewall"
      );
      return {
        loader: mapLoader,
        Component: CollaborativeWall,
      };
    },
    errorElement: <ErrorPage />,
  },
];

export const router = createBrowserRouter(routes, {
  basename: import.meta.env.PROD ? "/collaborativewall" : "/",
});
