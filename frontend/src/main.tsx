import React, { StrictMode } from "react";

import { OdeClientProvider, ThemeProvider } from "@edifice-ui/react";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./i18n";

import { router } from "./routes";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

if (import.meta.env.DEV) {
  // eslint-disable-next-line global-require
  import("@axe-core/react").then((axe) => {
    axe.default(React, root, 1000);
  });
}

/* if (import.meta.env.DEV) {
  import("edifice-bootstrap/dist/index.css");
} */

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: unknown) => {
      if (error === "0090") window.location.replace("/auth/login");
    },
  }),
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <OdeClientProvider
        params={{
          app: "collaborativewall",
        }}
      >
        <ThemeProvider>
          <RouterProvider router={router(queryClient)} />
        </ThemeProvider>
      </OdeClientProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
);
