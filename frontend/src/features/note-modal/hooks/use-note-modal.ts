import { RefObject, useCallback } from "react";

import { EditorRef } from "@edifice-ui/editor";
import { useOdeClient } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";
import {
  useBeforeUnload,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { v4 as uuid } from "uuid";

import { useWebsocketStore } from "~/features/websocket/hooks/use-websocket-store";
import { NoteMedia } from "~/models/note-media";
import { NoteProps, PickedNoteProps } from "~/models/notes";
import { useWhiteboard } from "~/store";
import { useShallow } from "zustand/react/shallow";
import { useQueryClient } from "@tanstack/react-query";
import { noteQueryOptions } from "~/services/queries";

export type EditionMode = "read" | "edit" | "create";
export const authorizedModes: EditionMode[] = ["read", "edit", "create"];

export const useNoteModal = (
  editorRef: RefObject<EditorRef>,
  colorValue: string[],
  loadedData: NoteProps | undefined,
  media: NoteMedia | null,
) => {
  const [searchParams] = useSearchParams();

  const queryClient = useQueryClient();

  const params = useParams<{ wallId: string; noteId: string }>();

  const navigate = useNavigate();
  const editionMode: EditionMode =
    (searchParams.get("mode") as EditionMode) || "create";

  const isReadMode = editionMode === "read";
  const isEditMode = editionMode === "edit";
  const isCreateMode = editionMode === "create";

  const { t } = useTranslation();
  const { appCode } = useOdeClient();
  const { wallId } = useParams();
  const { sendNoteAddedEvent, sendNoteUpdated } = useWebsocketStore();

  const { positionViewport } = useWhiteboard(
    useShallow((state) => ({
      positionViewport: state.positionViewport,
    })),
  );

  const randomPosition = () => {
    const min = -100;
    const max = 100;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const isDirty = useCallback(() => {
    return (
      loadedData?.color?.[0] != colorValue[0] ||
      loadedData.content != (editorRef.current?.getContent("html") as string) ||
      loadedData.media?.id != media?.id
    );
  }, [loadedData, colorValue, editorRef, media]);

  useBeforeUnload((event) => {
    if (isCreateMode || (isEditMode && isDirty())) {
      event.preventDefault();
    }
  });

  const navigateBack = () => navigate("..");

  const handleCreateNote = async () => {
    if (!wallId) {
      throw Error("Wall id is undefined");
    }

    const note: PickedNoteProps = {
      content: editorRef.current?.getContent("html") as string,
      color: colorValue,
      idwall: wallId,
      media: media,
      x: Math.trunc(
        positionViewport.x * -1 +
          window.innerWidth / 2 -
          100 +
          randomPosition(),
      ),
      y: Math.trunc(
        positionViewport.y * -1 +
          window.innerHeight / 2 -
          150 +
          randomPosition(),
      ),
    };

    try {
      await sendNoteAddedEvent({
        ...note,
        actionType: "Do",
        actionId: uuid(),
      });
      navigateBack();
    } catch (error) {
      console.error(error);
    }
  };

  const noteQueries = noteQueryOptions(
    params.wallId as string,
    params.noteId as string,
  );

  const handleSaveNote = async () => {
    if (!loadedData) return;

    const note: PickedNoteProps = {
      content: editorRef.current?.getContent("html") as string,
      color: colorValue,
      idwall: loadedData?.idwall as string,
      media: media || null,
      modified: loadedData?.modified,
      x: loadedData?.x,
      y: loadedData?.y,
    };
    await sendNoteUpdated({
      _id: loadedData?._id,
      content: note.content,
      media: note.media,
      color: note.color,
      x: note.x,
      y: note.y,
      actionType: "Do",
      actionId: uuid(),
    });

    await queryClient.invalidateQueries({
      queryKey: noteQueries.queryKey,
    });

    navigateBack();
  };

  const handleClose = () => {
    if (isCreateMode || (isEditMode && isDirty())) {
      const res: boolean = window.confirm(
        t("collaborativewall.modal.note.confirm.close", { ns: appCode }),
      );
      if (res) {
        navigateBack();
      }
    } else {
      navigateBack();
    }
  };

  const handleNavigateToEditMode = () => {
    if (!loadedData) return;

    navigate(`../note/${loadedData._id}?mode=edit`);
  };

  return {
    editionMode,
    isReadMode,
    isEditMode,
    isCreateMode,
    handleNavigateToEditMode,
    handleCreateNote,
    handleSaveNote,
    handleClose,
  };
};
