import { Modal, Button, useOdeClient } from "@edifice-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { wallQueryOptions } from "~/services/queries";
import { useWhiteboard } from "~/store";

export default function DescriptionModal(): JSX.Element | null {
  const { appCode } = useOdeClient();
  const { t } = useTranslation();
  const params = useParams();

  const { data: wall } = useQuery({
    queryKey: wallQueryOptions(params.wallId as string).queryKey,
    queryFn: wallQueryOptions(params.wallId as string).queryFn,
  });

  const { openDescriptionModal, seOpenDescriptionModal } = useWhiteboard(
    useShallow((state) => ({
      seOpenDescriptionModal: state.setOpenDescriptionModal,
      openDescriptionModal: state.openDescriptionModal,
    })),
  );

  const handleClose = () => seOpenDescriptionModal(false);

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
            {t("collaborativewall.modal.description", { ns: appCode })}
          </Modal.Header>
          <Modal.Body>
            <p>{wall?.description}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              color="primary"
              variant="filled"
              onClick={handleClose}
            >
              {t("close")}
            </Button>
          </Modal.Footer>
        </Modal>,
        document.getElementById("portal") as HTMLElement,
      )
    : null;
}
