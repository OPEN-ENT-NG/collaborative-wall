import { QueryClient } from "@tanstack/react-query";
import { LoaderFunctionArgs } from "react-router-dom";

import {
  notesQueryOptions,
  useNotes,
  useWall,
  wallQueryOptions,
} from "~/services/queries";

import { LoadingScreen } from "@edifice-ui/react";
import "reactflow/dist/style.css";
import { EmptyScreenError } from "~/components/emptyscreen-error";
import { Wall } from "~/features/collaborative-wall/wall";
import { useWhiteboard } from "~/store";
import "./index.css";

export const loader =
  (queryClient: QueryClient) =>
  async ({ params, request }: LoaderFunctionArgs) => {
    const queryWall = wallQueryOptions(params.wallId as string);
    const queryNotes = notesQueryOptions(params.wallId as string);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("xApp");

    if (query) {
      useWhiteboard.setState((state) => ({
        ...state,
        isMobile: !!query,
      }));
    }

    const [wall, notes] = await Promise.all([
      queryClient.ensureQueryData(queryWall),
      queryClient.ensureQueryData(queryNotes),
    ]);

    if (!wall || !notes) {
      throw new Response("", {
        status: 404,
        statusText: "Not Found",
      });
    }

    return { wall, notes, query };
  };

export const CollaborativeWall = () => {
  const { wall, query } = useWall();
  const { notes } = useNotes();

  if (query.isPending) return <LoadingScreen />;

  if (!wall || !notes || query.isError) return <EmptyScreenError />;

  return <Wall />;
};
