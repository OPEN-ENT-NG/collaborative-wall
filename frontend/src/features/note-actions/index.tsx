import { RefAttributes } from "react";

import { Copy, Delete, Edit, Options } from "@edifice-ui/icons";
import { Dropdown, IconButton, IconButtonProps } from "@edifice-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { NoteProps } from "~/models/notes";
import { notesQueryOptions, useDeleteNote } from "~/services/queries";
import { useHistoryStore } from "~/store";

export const NoteActions = ({ note }: { note: NoteProps }) => {
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const deleteNote = useDeleteNote();
  const { setHistory } = useHistoryStore();

  const { t } = useTranslation();

  const handleEdit = () => {
    navigate(`note/${note._id}?mode=edit`);
  };

  const handleCopy = () => {
    // TODO
  };

  const handleDelete = async () => {
    await deleteNote.mutateAsync(note);

    queryClient.setQueryData(
      notesQueryOptions(note.idwall).queryKey,
      (previousNotes) => {
        return previousNotes?.filter(
          (previousNote) => previousNote._id !== note._id,
        );
      },
    );

    setHistory({
      type: "delete",
      item: note,
    });
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div onMouseDown={(event) => event.stopPropagation()}>
      <Dropdown placement="right-start">
        {(
          triggerProps: JSX.IntrinsicAttributes &
            Omit<IconButtonProps, "ref"> &
            RefAttributes<HTMLButtonElement>,
        ) => (
          <>
            <IconButton
              {...triggerProps}
              type="button"
              aria-label="label"
              color="secondary"
              variant="ghost"
              icon={<Options />}
              className="card-actions-btn"
            />
            <Dropdown.Menu>
              <Dropdown.Item icon={<Edit />} onClick={handleEdit}>
                {t("edit")}
              </Dropdown.Item>
              <Dropdown.Item icon={<Copy />} onClick={handleCopy}>
                {t("duplicate")}
              </Dropdown.Item>
              <Dropdown.Item icon={<Delete />} onClick={handleDelete}>
                {t("remove")}
              </Dropdown.Item>
            </Dropdown.Menu>
          </>
        )}
      </Dropdown>
    </div>
  );
};
