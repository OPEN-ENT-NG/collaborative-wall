import {
  AppHeader as BaseAppHeader,
  Breadcrumb,
  LoadingScreen,
  useOdeClient,
} from "@edifice-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { IWebApp } from "edifice-ts-client";
import { Suspense, lazy } from "react";
import { useShallow } from "zustand/react/shallow";
import { loadWall } from "~/services/api";
import { useWall, wallQueryOptions } from "~/services/queries";
import { useWebsocketStore, useWhiteboardStore } from "~/store";
import { AppActions } from "./app-actions";

/* Lazy Loaded Modals */
const UpdateModal = lazy(
  async () => await import("~/components/resource-modal"),
);
const BackgroundModal = lazy(
  async () => await import("~/components/background-modal"),
);
const ShareModal = lazy(async () => await import("~/components/share-modal"));

export const AppHeader = () => {
  const queryClient = useQueryClient();

  const {
    isMobile,
    openShareModal,
    openUpdateModal,
    openBackgroundModal,
    setOpenShareModal,
    setOpenUpdateModal,
    setIsOpenBackgroundModal,
  } = useWhiteboardStore(
    useShallow((state) => ({
      isMobile: state.isMobile,
      openShareModal: state.openShareModal,
      openUpdateModal: state.openUpdateModal,
      openBackgroundModal: state.openBackgroundModal,
      setOpenShareModal: state.setOpenShareModal,
      setOpenUpdateModal: state.setOpenUpdateModal,
      setIsOpenBackgroundModal: state.setIsOpenBackgroundModal,
    })),
  );

  const { sendWallUpdateEvent } = useWebsocketStore();

  const { currentApp } = useOdeClient();
  const { wall } = useWall();

  const handleOnUpdateSuccess = async () => {
    if (!wall) return;

    const newWall = await loadWall(wall._id);

    await sendWallUpdateEvent(newWall);

    await queryClient.invalidateQueries({
      queryKey: wallQueryOptions(wall._id).queryKey,
    });

    setOpenUpdateModal(false);
  };

  return (
    !isMobile && (
      <>
        <BaseAppHeader isFullscreen render={() => <AppActions />}>
          <Breadcrumb app={currentApp as IWebApp} name={wall?.name} />
        </BaseAppHeader>
        <Suspense fallback={<LoadingScreen position={false} />}>
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
        </Suspense>
      </>
    )
  );
};
