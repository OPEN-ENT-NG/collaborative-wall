import { Button, Modal } from '@edifice-ui/react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface ModalProps {
  isOpen: boolean;
  onSuccess?: (formulaEditor: string) => void;
  onCancel?: () => void;
  contentText: string | undefined;
}

const NoteCantooModal = ({ isOpen, onCancel, contentText }: ModalProps) => {
  const { t } = useTranslation();

  const handleOnClose = () => {
    onCancel?.();
  };

  const Cantoo = (window as any).Cantoo;

  const cantooHTML = Cantoo?.formatText(contentText);

  return createPortal(
    <Modal id="NoteCantooModal" isOpen={isOpen} onModalClose={handleOnClose}>
      <Modal.Header onModalClose={handleOnClose}>
        {t('tiptap.cantoo.formatText')}
      </Modal.Header>
      <Modal.Body>
        <div dangerouslySetInnerHTML={{ __html: cantooHTML }} />
      </Modal.Body>
      <Modal.Footer>
        <Button
          color="tertiary"
          onClick={onCancel}
          type="button"
          variant="ghost"
        >
          {t('tiptap.cantoo.close')}
        </Button>
      </Modal.Footer>
    </Modal>,
    document.getElementById('portal') as HTMLElement,
  );
};

export default NoteCantooModal;
