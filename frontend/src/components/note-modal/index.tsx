import { Button, Modal } from "@edifice-ui/react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { NoteProps } from "~/services/api";

export interface NoteModalProps {
  isOpen: boolean;
  setIsOpen: (bool: boolean) => void;
  noteData: NoteProps | undefined;
}

export default function NoteModal({
  isOpen,
  setIsOpen,
  noteData,
}: NoteModalProps): JSX.Element | null {
  const { t } = useTranslation();

  return isOpen
    ? createPortal(
        <Modal
          id="NoteModal"
          onModalClose={() => setIsOpen(false)}
          size="md"
          isOpen={isOpen}
          focusId=""
        >
          <Modal.Header onModalClose={() => setIsOpen(false)}>
            {t("Note")}
          </Modal.Header>
          <Modal.Subtitle>{noteData?.owner?.displayName}</Modal.Subtitle>
          <Modal.Body>
            <p>{noteData?.content}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              color="primary"
              variant="filled"
              onClick={() => setIsOpen(false)}
            >
              {t("Fermer")}
            </Button>
          </Modal.Footer>
        </Modal>,
        document.getElementById("portal") as HTMLElement,
      )
    : null;
}
