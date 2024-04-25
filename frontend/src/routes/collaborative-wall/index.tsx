import { QueryClient } from "@tanstack/react-query";
import { LoaderFunctionArgs } from "react-router-dom";

import {
  notesQueryOptions,
  useWall,
  wallQueryOptions,
} from "~/services/queries";

import { LoadingScreen, useTrashedResource } from "@edifice-ui/react";
import "reactflow/dist/style.css";
import { AppHeader } from "~/features/app/app-header";
import { Wall } from "~/features/collaborative-wall/wall";
import { useAccessStore } from "~/hooks/use-access-rights";
import { useWhiteboard } from "~/store";
import { useRightsStore } from "~/store/rights/store";
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
  const isLoadingRights = useRightsStore((state) => state.isLoading);

  const { wall } = useWall();

  useAccessStore();
  useTrashedResource(wall?._id);

  if (isLoadingRights) return <LoadingScreen position={false} />;

  return (
    <>
      <AppHeader />
      <Wall />
    </>
  );
};
