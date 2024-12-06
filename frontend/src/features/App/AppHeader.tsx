import {
  AppHeader as BaseAppHeader,
  Breadcrumb,
  LoadingScreen,
  useEdificeClient,
} from '@edifice.io/react';
import { IWebApp } from '@edifice.io/client';
import { useQueryClient } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { loadWall } from '~/services/api';
import { useWall, wallQueryOptions } from '~/services/queries';
import { useWebsocketStore, useWhiteboardStore } from '~/store';
import { AppActions } from './AppActions';

/* Lazy Loaded Modals */
const UpdateModal = lazy(
  async () => await import('~/components/ResourceModal'),
);
const BackgroundModal = lazy(
  async () => await import('~/components/BackgroundModal/BackgroundModal'),
);
const ShareModal = lazy(async () => await import('~/components/ShareModal'));

export const AppHeader = () => {
  const queryClient = useQueryClient();
  const params = useParams();

  const data = queryClient.getQueryData(
    wallQueryOptions(params.wallId!).queryKey,
  );

  const shareOptions = {
    resourceCreatorId: data!.owner.userId,
    resourceId: data!._id,
    resourceRights: data!.rights,
  };

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

  const { currentApp } = useEdificeClient();
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
              wall={wall}
              isOpen={openBackgroundModal}
              setIsOpen={setIsOpenBackgroundModal}
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
              shareOptions={shareOptions}
              onCancel={() => setOpenShareModal(false)}
              onSuccess={() => setOpenShareModal(false)}
            />
          )}
        </Suspense>
      </>
    )
  );
};
