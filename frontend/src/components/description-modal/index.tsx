import { Modal, Button } from "@edifice-ui/react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

export default function DescriptionModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (bool: boolean) => void;
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
            <p>
              Lorem ipsum dolor sit amet. Sed inventore dolore quo accusantium
              assumenda non quos nihil. Ut dolores error ut dolores asperiores
              sit debitis odit cum unde quia vel ipsa atque et exercitationem
              harum est natus Quis. Rem eligendi quisquam ab necessitatibus
              pariatur eos itaque fuga qui rerum dolores rem nesciunt nostrum.
              Est itaque voluptatem id unde doloremque sit quos nemo. Lorem
              ipsum dolor sit amet. Sed inventore dolore quo accusantium
              assumenda non quos nihil. Ut dolores error ut dolores asperiores
              sit debitis odit cum unde quia vel ipsa atque et exercitationem
              harum est natus Quis. Rem eligendi quisquam ab necessitatibus
              pariatur eos itaque fuga qui rerum dolores rem nesciunt nostrum.
              Est itaque voluptatem id unde doloremque sit quos nemo.
            </p>
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
