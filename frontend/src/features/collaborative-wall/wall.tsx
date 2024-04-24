import { LoadingScreen, useTrashedResource } from "@edifice-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { Outlet } from "react-router-dom";
import ReactFlow from "reactflow";
import { useShallow } from "zustand/react/shallow";
import { nodeExtent, translateExtent } from "~/config";
import { NoteProps } from "~/models/notes";
import { CollaborativeWallProps } from "~/models/wall";
import { loadWall } from "~/services/api";
import { wallQueryOptions } from "~/services/queries";
import { useWhiteboard } from "~/store";
import { AppHeader } from "../app/app-header";
import { useCustomRF } from "../reactflow/use-custom-reactflow";
import { useEvents } from "../websocket/hooks/use-events";
import { useWebsocketStore } from "../websocket/hooks/use-websocket-store";
import { CollaborativeWallContainer } from "./components/container";
import { CustomBackground } from "./components/custom-background";
import { ToolbarWrapper } from "./components/toolbar";

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

export const Wall = ({
  wall,
  notes,
}: {
  wall: CollaborativeWallProps;
  notes: NoteProps[];
}) => {
  const queryClient = useQueryClient();

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

  const { openSocketModal, setOpenSocketModal, sendWallUpdateEvent } =
    useWebsocketStore();

  const {
    nodes,
    nodeTypes,
    onNodesChange,
    onNodeClick,
    onNodeDrag,
    onNodeDragStop,
    onNodeDragStart,
  } = useCustomRF(notes);

  const handleOnUpdateSuccess = async () => {
    await queryClient.invalidateQueries({
      queryKey: wallQueryOptions(wall._id).queryKey,
    });

    if (!wall) return;

    const newWall = await loadWall(wall._id);

    sendWallUpdateEvent(newWall);
    setOpenUpdateModal(false);
  };

  useTrashedResource(wall._id);
  useEvents(wall._id as string);

  return (
    <>
      <AppHeader />

      <CollaborativeWallContainer>
        {wall.description && !isMobile && <DescriptionWall />}

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
        {wall.description && <DescriptionModal />}

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
