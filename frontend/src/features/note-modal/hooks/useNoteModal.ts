import { RefObject, useCallback } from "react";

import { EditorRef } from "@edifice-ui/editor";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultValues, SubmitHandler, useForm } from "react-hook-form";
import {
  useBeforeUnload,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { NoteMedia } from "~/models/noteMedia";
import { NoteProps, PickedNoteProps } from "~/models/notes";
import { useCreateNote, useUpdateNote } from "~/services/queries";
import { updateData } from "~/services/queries/helpers";
import { useHistoryStore, useWhiteboard } from "~/store";

export interface FormValues {
  color: string[];
  media: NoteMedia | null;
  content: string;
}

export type EditionMode = "read" | "edit" | "create";
export const authorizedModes: EditionMode[] = ["read", "edit", "create"];

export const useNoteModal = (
  editorRef: RefObject<EditorRef>,
  colorValue: string[],
  loadedData: NoteProps,
  media: NoteMedia | null,
) => {
  const navigate = useNavigate();

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();

  const queryClient = useQueryClient();
  const { setHistory } = useHistoryStore();

  const { wallId } = useParams();
  const [searchParams] = useSearchParams();
  const editionMode: EditionMode =
    (searchParams.get("mode") as EditionMode) || "create";

  const { positionViewport, zoom } = useWhiteboard(
    useShallow((state) => ({
      positionViewport: state.positionViewport,
      zoom: state.zoom,
    })),
  );

  const defaultValues: DefaultValues<FormValues> = {
    color: loadedData.color,
    media: loadedData.media,
    content: loadedData.content,
  };

  const {
    register,
    handleSubmit,
    formState: { isDirty, isValid, isSubmitting },
    control,
  } = useForm<FormValues>({ defaultValues });

  const isReadMode = editionMode === "read";
  const isEditMode = editionMode === "edit";
  const isCreateMode = editionMode === "create";

  // fix #WB2-1587: if user is leaving the page, a browser confirm box will be displayed
  useBeforeUnload(
    useCallback(
      (event) => {
        if (!isReadMode && isDirty) {
          event.preventDefault();
        }
      },
      [isReadMode, isDirty],
    ),
  );

  const navigateBack = () => navigate("..");

  const handleCreateNote = async () => {
    if (!wallId) {
      throw Error("Wall id is undefined");
    }

    const note: PickedNoteProps = {
      content: editorRef.current?.getContent("plain") as string,
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

      navigateBack();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveNote = async () => {
    const note: PickedNoteProps = {
      content: editorRef.current?.getContent("plain") as string,
      color: colorValue,
      idwall: loadedData.idwall as string,
      media: media || null,
      modified: loadedData.modified,
      x: loadedData.x,
      y: loadedData.y,
    };

    await updateNote.mutateAsync(
      { id: loadedData._id, note },
      {
        onSuccess: async (responseData) => {
          const { status, note: updatedNote } = responseData;

          if (status !== "ok") return;

          updateData(queryClient, updatedNote);

          setHistory({
            type: "edit",
            item: {
              ...updatedNote,
              content: loadedData.content,
              color: loadedData.color,
              media: loadedData.media,
            },
            previous: {
              x: loadedData.x,
              y: loadedData.y,
              color: loadedData.color,
              content: loadedData.content,
              media: loadedData.media || null,
            },
            next: {
              x: updatedNote.x,
              y: updatedNote.y,
              color: updatedNote.color,
              content: updatedNote.content,
              media: updatedNote.media || null,
            },
          });
        },
      },
    );

    navigateBack();
  };

  const handleNoteFormSubmit: SubmitHandler<FormValues> = async (
    formData: FormValues,
  ) => {
    console.log(formData);
    if (isCreateMode) {
      handleCreateNote();
    } else if (isEditMode) {
      handleSaveNote();
    }
  };

  const handleNavigateToEditMode = () => {
    navigate(`../note/${loadedData._id}?mode=edit`);
  };

  const handleModalClose = () => {
    navigateBack();
  };

  return {
    editionMode,
    isReadMode,
    isEditMode,
    isCreateMode,
    formState: { isDirty, isValid, isSubmitting },
    control,
    handleNavigateToEditMode,
    handleNoteFormSubmit,
    handleModalClose,
    handleSubmit,
    register,
  };
};
