import { Button, Modal, useEdificeClient } from '@edifice.io/react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface ModalProps {
  isOpen: boolean;
  onSuccess?: (formulaEditor: string) => void;
  onClose: () => void;
}

export default function WebsocketModal({ isOpen, onClose }: ModalProps) {
  const { t } = useTranslation();
  const { appCode } = useEdificeClient();

  return isOpen
    ? createPortal(
        <Modal id="WebsocketModal" onModalClose={onClose} isOpen={isOpen}>
          <Modal.Header onModalClose={onClose}>
            {t('collaborativewall.modal.realtime.title', { ns: appCode })}
          </Modal.Header>
          <Modal.Body>
            <p>{t('collaborativewall.modal.realtime.text', { ns: appCode })}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              color="primary"
              onClick={onClose}
              type="button"
              variant="filled"
            >
              {t('collaborativewall.modal.close', { ns: appCode })}
            </Button>
          </Modal.Footer>
        </Modal>,
        document.getElementById('portal') as HTMLElement,
      )
    : null;
}
