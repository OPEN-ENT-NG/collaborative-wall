import { Button, LoadingScreen, useEdificeClient } from '@edifice.io/react';
import { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useWall } from '~/services/queries';

import { useWhiteboardStore } from '~/store';

const DescriptionModal = lazy(
  async () => await import('~/features/Description/DescriptionModal'),
);

export const Description = () => {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();
  const { wall } = useWall();
  const { openDescriptionModal, setOpenDescriptionModal } = useWhiteboardStore(
    useShallow((state) => ({
      openDescriptionModal: state.openDescriptionModal,
      setOpenDescriptionModal: state.setOpenDescriptionModal,
    })),
  );

  return (
    <div className="description-wall d-flex justify-content-between py-8 px-16 px-md-48">
      <p className="text-truncate">{wall?.description}</p>
      <Button
        variant="ghost"
        color="tertiary"
        onClick={() => setOpenDescriptionModal(true)}
        style={{ whiteSpace: 'nowrap' }}
      >
        {t('collaborativewall.see.more', { ns: appCode })}
      </Button>

      <Suspense fallback={<LoadingScreen position={false} />}>
        {openDescriptionModal && wall?.description && <DescriptionModal />}
      </Suspense>
    </div>
  );
};
