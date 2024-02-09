import { Button, Modal } from "@edifice-ui/react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  LoaderFunctionArgs,
  useLoaderData,
  useNavigate,
} from "react-router-dom";

import { NoteProps } from "~/models/notes";
import { getNote } from "~/services/api";

export async function noteLoader({ params }: LoaderFunctionArgs) {
  const { id, idnote } = params;

  if (!id || !idnote) {
    throw new Response("", {
      status: 404,
      statusText: "Wall id or Note id is null",
    });
  }

  const note = await getNote(id, idnote);

  if (!note) {
    throw new Response("", {
      status: 404,
      statusText: "Not Found",
    });
  }

  return note;
}

export const NoteModal = () => {
  const { t } = useTranslation();
  const data = useLoaderData() as NoteProps;
  const navigate = useNavigate();

  return data ? (
    createPortal(
      <Modal
        id="NoteModal"
        onModalClose={() => navigate("..")}
        size="md"
        isOpen={true}
        focusId=""
      >
        <Modal.Header onModalClose={() => navigate("..")}>
          {t("Note")}
        </Modal.Header>
        <Modal.Subtitle>{data.owner?.displayName}</Modal.Subtitle>
        <Modal.Body>
          <p>{data.content}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            color="primary"
            variant="filled"
            onClick={() => navigate("..")}
          >
            {t("Fermer")}
          </Button>
        </Modal.Footer>
      </Modal>,
      document.getElementById("portal") as HTMLElement,
    )
  ) : (
    <p>{t("collaborativewall.note.notfound")}</p>
  );
};
