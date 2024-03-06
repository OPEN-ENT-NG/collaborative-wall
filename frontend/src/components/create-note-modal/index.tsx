import { useState } from "react";

import { Button, Modal, useOdeClient } from "@edifice-ui/react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { ContentNote } from "../content-note";
import { noteColors } from "~/config/init-config";
import { NoteProps, PickedNoteProps } from "~/models/notes";
import { useCreateNote } from "~/services/queries";
import { useWhiteboard } from "~/store";

export default function CreateNoteModal({ wallId }: { wallId: string }) {
  const data = useLoaderData() as NoteProps;
  const createNote = useCreateNote(wallId);

  const { t } = useTranslation();
  const { appCode } = useOdeClient();

  const { setOpenCreateModal, openCreateModal } = useWhiteboard(
    useShallow((state) => ({
      setOpenCreateModal: state.setOpenCreateModal,
      openCreateModal: state.openCreateModal,
    })),
  );

  const [colorValue, setColorValue] = useState<string[]>([
    noteColors.white.background,
  ]);

  const handleCreateNote = () => {
    const note: PickedNoteProps = {
      content: "",
      color: colorValue,
      idwall: wallId,
      modified: data.modified,
      x: 10,
      y: 10,
    };
    createNote.mutate(note as any);

    setOpenCreateModal(false);
  };

  return openCreateModal
    ? createPortal(
        <Modal
          id="NoteModal"
          onModalClose={() => setOpenCreateModal(false)}
          size="md"
          isOpen={openCreateModal}
          focusId=""
          scrollable={true}
        >
          <Modal.Header onModalClose={() => setOpenCreateModal(false)}>
            {t("collaborativewall.create.note")}
          </Modal.Header>
          <Modal.Body>
            <ContentNote dataNote={data} setColorValue={setColorValue} />
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              color="tertiary"
              variant="ghost"
              onClick={() => setOpenCreateModal(false)}
            >
              {t("collaborativewall.modal.cancel", { ns: appCode })}
            </Button>
            <Button
              type="button"
              color="primary"
              variant="filled"
              onClick={handleCreateNote}
            >
              {t("collaborativewall.modal.add")}
            </Button>
          </Modal.Footer>
        </Modal>,
        document.getElementById("portal") as HTMLElement,
      )
    : null;
}
