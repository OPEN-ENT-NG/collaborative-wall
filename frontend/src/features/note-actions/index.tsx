import { RefAttributes } from "react";

import { Delete, Edit } from "@edifice-ui/icons";
import { Dropdown, IconButtonProps } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { v4 as uuid } from "uuid";
import { useAccessStore } from "~/hooks/use-access-rights";
import { useInvalidateNoteQueries } from "~/hooks/use-invalidate-note-queries";
import { NoteProps } from "~/models/notes";
import { useWebsocketStore } from "~/store";
import { ActionList } from "../note-modal/components/action-list";
import { NoteDropdownMenuOptions } from "./types";

export const NoteActions = ({ note }: { note: NoteProps }) => {
  const navigate = useNavigate();
  const invalidateNoteQueries = useInvalidateNoteQueries();

  const { t } = useTranslation();

  const { hasRightsToUpdateNote } = useAccessStore();
  const { sendNoteDeletedEvent } = useWebsocketStore();

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();

    navigate(`note/${note._id}?mode=edit`);
  };

  const handleDelete = async (event: React.MouseEvent) => {
    event.stopPropagation();

    await sendNoteDeletedEvent({
      _id: note._id,
      actionType: "Do",
      actionId: uuid(),
    });
    await invalidateNoteQueries();
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
    <div className="dropdown-note-action nodrag">
      <Dropdown placement="right-start">
        {(
          triggerProps: JSX.IntrinsicAttributes &
            Omit<IconButtonProps, "ref"> &
            RefAttributes<HTMLButtonElement>,
        ) => (
          <ActionList
            noteId={note._id}
            triggerProps={triggerProps}
            dropdownOptions={dropdownOptions}
          />
        )}
      </Dropdown>
    </div>
  );
};
