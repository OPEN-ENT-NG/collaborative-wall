import { LoadingScreen } from "@edifice-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { Outlet } from "react-router-dom";
import ReactFlow from "reactflow";
import "reactflow/dist/base.css";
import { useShallow } from "zustand/react/shallow";
import { EmptyScreenError } from "~/components/emptyscreen-error";
import { nodeExtent, translateExtent } from "~/config";
import { loadWall } from "~/services/api";
import { useNotes, useWall, wallQueryOptions } from "~/services/queries";
import { createWebsocketStore, useWhiteboard } from "~/store";
import { Status } from "~/store/websocket/types";
import { useCustomRF } from "../reactflow/use-custom-reactflow";
import { RenderedCursors } from "../websocket/components/rendered-cursors";
import { useEvents } from "../websocket/hooks/use-events";
import { useWebsocketStore } from "../websocket/hooks/use-websocket-store";
import { CollaborativeWallContainer } from "./components/container";
import { CustomBackground } from "./components/custom-background";
import { ToolbarWrapper } from "./components/toolbar";

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

export const Wall = () => {
  const queryClient = useQueryClient();

  const { wall, query } = useWall();
  const { notes } = useNotes();

  const {
    openShareModal,
    openUpdateModal,
    isOpenDropdown,
    isMobile,
    openBackgroundModal,
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
    })),
  );

  const status = createWebsocketStore((state) => state.status);
  const openSocketModal = createWebsocketStore(
    (state) => state.openSocketModal,
  );

  const { setOpenSocketModal, sendWallUpdateEvent } = useWebsocketStore();

  const {
    nodes,
    nodeTypes,
    onInit,
    onNodesChange,
    onNodeClick,
    onNodeDrag,
    onNodeDragStop,
    onNodeDragStart,
    onPaneMouseMove,
  } = useCustomRF();

  const handleOnUpdateSuccess = async () => {
    if (!wall) return;

    const newWall = await loadWall(wall._id);

    sendWallUpdateEvent(newWall);

    await queryClient.invalidateQueries({
      queryKey: wallQueryOptions(wall._id).queryKey,
    });

    setOpenUpdateModal(false);
  };

  useEvents(wall?._id as string);

  if (query.isPending || status === Status.IDLE)
    return <LoadingScreen position={false} />;

  if (!wall || !notes || query.isError) return <EmptyScreenError />;

  return (
    <>
      <CollaborativeWallContainer>
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
            panOnScroll={true}
            onInit={onInit}
            onNodesChange={onNodesChange}
            onNodeClick={isOpenDropdown ? undefined : onNodeClick}
            onNodeDragStart={onNodeDragStart}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            onPaneMouseMove={onPaneMouseMove}
          >
            <RenderedCursors />
            <CustomBackground />
            <ToolbarWrapper isMobile={isMobile} />
          </ReactFlow>
        </div>

        <Outlet />
      </CollaborativeWallContainer>

      <Suspense fallback={<LoadingScreen position={false} />}>
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
