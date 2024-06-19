import { QueryClient } from "@tanstack/react-query";
import { LoaderFunctionArgs } from "react-router-dom";

import {
  notesQueryOptions,
  useWall,
  wallQueryOptions,
} from "~/services/queries";

import { LoadingScreen, useTrashedResource } from "@edifice-ui/react";
import { odeServices } from "edifice-ts-client";
import { AppHeader } from "~/features/App/AppHeader";
import { Description } from "~/features/Description/Description";
import { Wall } from "~/features/Wall/Wall";
import { useAccessStore } from "~/hooks/useAccessStore";
import { useRightsStore, useWhiteboardStore } from "~/store";
import "./index.css";

export const loader =
  (queryClient: QueryClient) =>
  async ({ params, request }: LoaderFunctionArgs) => {
    const queryWall = wallQueryOptions(params.wallId as string);
    const queryNotes = notesQueryOptions(params.wallId as string);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("xApp");

    if (query) {
      useWhiteboardStore.setState((state) => ({
        ...state,
        isMobile: !!query,
      }));
    }

    const wall = await queryClient.ensureQueryData(queryWall);
    const notes = await queryClient.ensureQueryData(queryNotes);

    if (
      odeServices.http().isResponseError() &&
      odeServices.http().latestResponse.status === 401
    ) {
      throw new Response("", {
        status: 401,
        statusText: odeServices.http().latestResponse.statusText,
      });
    }

    return { wall, notes, query };
  };

export const Component = () => {
  const isLoadingRights = useRightsStore((state) => state.isLoading);
  const isMobile = useWhiteboardStore((state) => state.isMobile);

  const { wall } = useWall();

  useAccessStore();
  useTrashedResource(wall?._id);

  if (isLoadingRights) return <LoadingScreen position={false} />;

  return (
    <>
      <div className="position-fixed z-3 top-0 start-0 end-0">
        {!isMobile ? (
          <>
            <AppHeader />
            {wall?.description && <Description />}
          </>
        ) : null}
      </div>
      <Wall />
    </>
  );
};
