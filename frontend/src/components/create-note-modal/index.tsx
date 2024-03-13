import { useState } from "react";

import { Button, Modal, useOdeClient } from "@edifice-ui/react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { ContentNote } from "../content-note";
import { noteColors } from "~/config/init-config";
import { NoteMedia } from "~/models/noteMedia";
import { PickedNoteProps } from "~/models/notes";
import { useCreateNote } from "~/services/queries";
import { useHistoryStore, useWhiteboard } from "~/store";

export default function CreateNoteModal({ wallId }: { wallId: string }) {
  const createNote = useCreateNote();

  const { t } = useTranslation();
  const { appCode } = useOdeClient();

  const { setOpenCreateModal, openCreateModal, positionViewport, zoom } =
    useWhiteboard(
      useShallow((state) => ({
        setOpenCreateModal: state.setOpenCreateModal,
        openCreateModal: state.openCreateModal,
        positionViewport: state.positionViewport,
        zoom: state.zoom,
      })),
    );
  const { setHistory } = useHistoryStore();

  const [colorValue, setColorValue] = useState<string[]>([
    noteColors.yellow.background,
  ]);
  const [media, setMedia] = useState<NoteMedia | null>(null);

  const handleCreateNote = async () => {
    const note: PickedNoteProps = {
      content: "",
      color: colorValue,
      idwall: wallId,
      media: media,
      x: Math.trunc((positionViewport.x * -1 + window.innerWidth / 2) / zoom),
      y: Math.trunc((positionViewport.y * -1 + window.innerHeight / 2) / zoom),
    };

    try {
      const response = await createNote.mutateAsync(note);

      const { status, wall } = response;

      if (status === "ok") {
        const size = wall.length;
        const note = wall[size - 1];

        setHistory({
          type: "create",
          item: note,
        });
      }
      setOpenCreateModal(false);
    } catch (error) {
      console.error(error);
    }
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
            <ContentNote
              setColorValue={setColorValue}
              setMedia={setMedia}
              media={media}
            />
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
