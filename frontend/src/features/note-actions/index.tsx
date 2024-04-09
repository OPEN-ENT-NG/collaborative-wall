import { RefAttributes } from "react";

import { Delete, Edit } from "@edifice-ui/icons";
import {
  Dropdown,
  DropdownMenuOptions,
  IconButtonProps,
} from "@edifice-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ActionList } from "../note-modal/components/ActionList";
import { useAccess } from "~/hooks/useAccess";
import { NoteProps } from "~/models/notes";
import { notesQueryOptions, useDeleteNote } from "~/services/queries";
import { useHistoryStore } from "~/store";

export type NoteDropdownMenuOptions = DropdownMenuOptions & {
  hidden?: boolean;
};

export const NoteActions = ({
  note,
  setIsOpenDropdown,
}: {
  note: NoteProps;
  setIsOpenDropdown: (value: boolean) => void;
}) => {
  const navigate = useNavigate();

  const { hasRightsToUpdateNote } = useAccess();

  const queryClient = useQueryClient();
  const deleteNote = useDeleteNote();
  const { setHistory } = useHistoryStore();

  const { t } = useTranslation();

  const handleEdit = () => {
    navigate(`note/${note._id}?mode=edit`);
  };

  /* const handleCopy = () => {
    TODO
  }; */

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

  const dropdownOptions: NoteDropdownMenuOptions[] = [
    {
      icon: <Edit />,
      label: t("edit"),
      action: handleEdit,
      hidden: !hasRightsToUpdateNote(note),
    },
    {
      icon: <Delete />,
      label: t("remove"),
      action: handleDelete,
      hidden: !hasRightsToUpdateNote(note),
    },
  ];

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div onMouseDown={(event) => event.preventDefault()}>
      <Dropdown placement="right-start">
        {(
          triggerProps: JSX.IntrinsicAttributes &
            Omit<IconButtonProps, "ref"> &
            RefAttributes<HTMLButtonElement>,
        ) => (
          <ActionList
            triggerProps={triggerProps}
            setIsOpenDropdown={setIsOpenDropdown}
            dropdownOptions={dropdownOptions}
          />
        )}
      </Dropdown>
    </div>
  );
};
