import { Modal, Button, useOdeClient } from "@edifice-ui/react";
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
  const { appCode } = useOdeClient();
  const { t } = useTranslation();

  const handleClose = () => setIsOpen(false);

  return isOpen
    ? createPortal(
        <Modal
          id="DescriptionModal"
          onModalClose={handleClose}
          size="md"
          isOpen={isOpen}
          focusId="nextButtonId"
        >
          <Modal.Header onModalClose={handleClose}>
            {t("collaborativewall.modal.description", { ns: appCode })}
          </Modal.Header>
          <Modal.Body>
            <p>{description}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              color="primary"
              variant="filled"
              onClick={handleClose}
            >
              {t("collaborativewall.modal.close", { ns: appCode })}
            </Button>
          </Modal.Footer>
        </Modal>,
        document.getElementById("portal") as HTMLElement,
      )
    : null;
}
