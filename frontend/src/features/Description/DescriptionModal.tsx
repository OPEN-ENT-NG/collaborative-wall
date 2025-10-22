import { Button, Modal, useEdificeClient } from '@edifice.io/react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { useWall } from '~/services/queries';

import { useWhiteboardStore } from '~/store';

export default function DescriptionModal() {
  const { appCode } = useEdificeClient();
  const { t } = useTranslation();

  const { wall } = useWall();

  const { openDescriptionModal, setOpenDescriptionModal } = useWhiteboardStore(
    useShallow((state) => ({
      setOpenDescriptionModal: state.setOpenDescriptionModal,
      openDescriptionModal: state.openDescriptionModal,
    })),
  );

  const handleClose = () => setOpenDescriptionModal(false);

  return openDescriptionModal
    ? createPortal(
        <Modal
          id="DescriptionModal"
          onModalClose={handleClose}
          size="md"
          isOpen={openDescriptionModal}
          focusId="nextButtonId"
        >
          <Modal.Header onModalClose={handleClose}>
            {t('collaborativewall.modal.description', { ns: appCode })}
          </Modal.Header>
          <Modal.Body>
            <p style={{ whiteSpace: 'pre-line' }}>{wall?.description}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              color="primary"
              variant="filled"
              onClick={handleClose}
            >
              {t('close')}
            </Button>
          </Modal.Footer>
        </Modal>,
        document.getElementById('portal') as HTMLElement,
      )
    : null;
}
