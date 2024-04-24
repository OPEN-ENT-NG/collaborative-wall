import { Suspense, lazy, useEffect, useMemo } from "react";

import { LoadingScreen, useTrashedResource } from "@edifice-ui/react";

import { QueryClient, useQueryClient } from "@tanstack/react-query";
import {
  LoaderFunctionArgs,
  Outlet,
  useLoaderData,
  useParams,
} from "react-router-dom";
import ReactFlow from "reactflow";
import { useShallow } from "zustand/react/shallow";

import { EmptyScreenError } from "~/components/emptyscreen-error";
import { ToolbarWrapper } from "~/features/collaborative-wall/toolbar";
import { getWall } from "~/services/api";
import {
  notesQueryOptions,
  useWallWithNotes,
  wallQueryOptions,
} from "~/services/queries";
import { useWhiteboard } from "~/store";

import { AppHeader } from "~/features/app/app-header";
import { CustomBackground } from "~/features/collaborative-wall/custom-background";
import { Note } from "~/features/collaborative-wall/note";
import { useCustomRF } from "~/features/reactflow/use-custom-reactflow";
import { useEvents } from "~/features/websocket/hooks/use-events";
import { useWebsocketStore } from "~/features/websocket/hooks/use-websocket-store";

import { CollaborativeWallContainer } from "~/features/collaborative-wall/container";

import { NoteProps } from "~/models/notes";
import { CollaborativeWallProps } from "~/models/wall";

import { nodeExtent, translateExtent } from "~/config";

import "reactflow/dist/style.css";
import "./index.css";

interface LoaderData {
  wall: CollaborativeWallProps;
  notes: NoteProps[];
  query: string | null;
}

const DescriptionWall = lazy(
  async () =>
    await import("~/features/description/components/description-wall"),
);
const DescriptionModal = lazy(
  async () =>
    await import("~/features/description/components/description-modal"),
);
const UpdateModal = lazy(
  async () => await import("~/components/resource-modal"),
);
const ShareModal = lazy(async () => await import("~/components/share-modal"));
const WebsocketModal = lazy(
  async () => await import("~/features/websocket/components/modal"),
);
const BackgroundModal = lazy(
  async () => await import("~/components/background-modal"),
);

export const wallLoader =
  (queryClient: QueryClient) =>
  async ({ params, request }: LoaderFunctionArgs) => {
    const { wallId } = params;

    const queryWall = wallQueryOptions(wallId as string);
    const queryNotes = notesQueryOptions(wallId as string);

    const wall =
      queryClient.getQueryData(queryWall.queryKey) ??
      (await queryClient.fetchQuery(queryWall));
    const notes =
      queryClient.getQueryData(queryNotes.queryKey) ??
      (await queryClient.fetchQuery(queryNotes));

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("xApp");

    if (!wall || !notes) {
      throw new Response("", {
        status: 404,
        statusText: "Not Found",
      });
    }

    return { wall, notes, query };
  };

export const CollaborativeWall = () => {
  const params = useParams();
  const queryClient = useQueryClient();

  const nodeTypes = useMemo(() => ({ note: Note }), []);

  const { query } = useLoaderData() as LoaderData;

  const [
    { data: wall, isPending: isWallLoading, isError: isWallError },
    { data: notes, isPending: isNotesLoading, isError: isNotesError },
  ] = useWallWithNotes(params.wallId!);

  const {
    openShareModal,
    openUpdateModal,
    isOpenDropdown,
    isMobile,
    openBackgroundModal,
    setIsMobile,
    setOpenShareModal,
    setOpenUpdateModal,
    setIsOpenBackgroundModal,
  } = useWhiteboard(
    useShallow((state) => ({
      openShareModal: state.openShareModal,
      openUpdateModal: state.openUpdateModal,
      isMobile: state.isMobile,
      isOpenDropdown: state.isOpenDropdown,
      openBackgroundModal: state.openBackgroundModal,
      setOpenShareModal: state.setOpenShareModal,
      setOpenUpdateModal: state.setOpenUpdateModal,
      setIsOpenBackgroundModal: state.setIsOpenBackgroundModal,
      setIsMobile: state.setIsMobile,
    })),
  );

  const { openSocketModal, setOpenSocketModal, sendWallUpdateEvent } =
    useWebsocketStore();

  const {
    nodes,
    onNodesChange,
    onNodeClick,
    onNodeDrag,
    onNodeDragStop,
    onNodeDragStart,
  } = useCustomRF(notes);

  const handleOnUpdateSuccess = async () => {
    await queryClient.invalidateQueries({
      queryKey: wallQueryOptions(params.wallId as string).queryKey,
    });

    if (!wall) return;

    const newWall = await getWall(wall._id);

    sendWallUpdateEvent(newWall);
    setOpenUpdateModal(false);
  };

  useTrashedResource(params?.wallId);
  useEvents(params?.wallId as string);

  useEffect(() => {
    if (query) setIsMobile(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  if (isWallLoading && isNotesLoading) return <LoadingScreen />;

  if (isWallError || isNotesError) return <EmptyScreenError />;

  return (
    <>
      <AppHeader />

      <CollaborativeWallContainer>
        {wall?.description && !isMobile && <DescriptionWall />}

        <div className="collaborativewall-reactflow">
          <ReactFlow
            nodes={nodes}
            nodeTypes={nodeTypes}
            translateExtent={translateExtent}
            nodeExtent={nodeExtent}
            minZoom={1}
            maxZoom={1}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            onlyRenderVisibleElements={true}
            panOnScroll={true}
            onNodesChange={onNodesChange}
            onNodeClick={isOpenDropdown ? undefined : onNodeClick}
            onNodeDragStart={onNodeDragStart}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
          >
            <CustomBackground />
            <ToolbarWrapper isMobile={isMobile} />
          </ReactFlow>
        </div>

        <Outlet />
      </CollaborativeWallContainer>

      <Suspense fallback={<LoadingScreen />}>
        {wall?.description && <DescriptionModal />}

        {openBackgroundModal && wall && (
          <BackgroundModal
            setIsOpen={setIsOpenBackgroundModal}
            isOpen={openBackgroundModal}
            wall={wall}
          />
        )}
        {openUpdateModal && wall && (
          <UpdateModal
            mode="update"
            isOpen={openUpdateModal}
            resourceId={wall._id}
            onCancel={() => setOpenUpdateModal(false)}
            onSuccess={handleOnUpdateSuccess}
          />
        )}
        {openShareModal && wall && (
          <ShareModal
            isOpen={openShareModal}
            resourceId={wall._id}
            onCancel={() => setOpenShareModal(false)}
            onSuccess={() => setOpenShareModal(false)}
          />
        )}
        {openSocketModal && (
          <WebsocketModal
            isOpen={openSocketModal}
            onClose={() => setOpenSocketModal(false)}
          />
        )}
      </Suspense>
    </>
  );
};
