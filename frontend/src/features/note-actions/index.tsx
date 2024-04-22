import { RefAttributes } from "react";

import { Delete, Edit } from "@edifice-ui/icons";
import { Dropdown, IconButtonProps } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";

import { useAccess } from "~/hooks/use-access";
import { NoteProps } from "~/models/notes";
import { ActionList } from "../note-modal/components/action-list";
import { useWebsocketStore } from "../websocket/hooks/use-websocket-store";
import { NoteDropdownMenuOptions } from "./types";

export const NoteActions = ({ note }: { note: NoteProps }) => {
  const navigate = useNavigate();

  const { hasRightsToUpdateNote } = useAccess();

  const { sendNoteDeletedEvent } = useWebsocketStore();

  const { t } = useTranslation();

  const handleEdit = () => {
    navigate(`note/${note._id}?mode=edit`);
  };

  /* const handleCopy = () => {
    TODO
  }; */

  const handleDelete = async () => {
    await sendNoteDeletedEvent({
      _id: note._id,
      actionType: "Do",
      actionId: uuid(),
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
    <div
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <Dropdown placement="right-start">
        {(
          triggerProps: JSX.IntrinsicAttributes &
            Omit<IconButtonProps, "ref"> &
            RefAttributes<HTMLButtonElement>,
        ) => (
          <ActionList
            triggerProps={triggerProps}
            dropdownOptions={dropdownOptions}
          />
        )}
      </Dropdown>
    </div>
  );
};
