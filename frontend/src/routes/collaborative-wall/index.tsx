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

    await Promise.all([
      queryClient.fetchQuery(queryWall),
      queryClient.fetchQuery(queryNotes),
    ]);

    return { query };
  };

export const CollaborativeWall = () => {
  const { wall, query } = useWall();
  const { notes } = useNotes();

  if (query.isPending) return <LoadingScreen />;

  if (!wall || !notes || query.isError) return <EmptyScreenError />;

  return <Wall wall={wall} notes={notes} />;
};
