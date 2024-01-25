import { Modal, Button } from "@edifice-ui/react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

export default function DescriptionModal({
  isOpen,
  setIsOpen,
  description,
}: {
  isOpen: boolean;
  setIsOpen: (bool: boolean) => void;
  description: string;
}): JSX.Element | null {
  const { t } = useTranslation();

  return isOpen
    ? createPortal(
        <Modal
          id="TrashModal"
          onModalClose={() => setIsOpen(false)}
          size="md"
          isOpen={isOpen}
          focusId="nextButtonId"
        >
          <Modal.Header onModalClose={() => setIsOpen(false)}>
            {t("description")}
          </Modal.Header>
          <Modal.Body>
            <p>{description}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              color="primary"
              variant="filled"
              onClick={() => setIsOpen(false)}
            >
              {t("explorer.modal.onboarding.trash.close")}
            </Button>
          </Modal.Footer>
        </Modal>,
        document.getElementById("portal") as HTMLElement,
      )
    : null;
}
