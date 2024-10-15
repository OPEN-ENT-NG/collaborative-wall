import { RefAttributes } from 'react';

import { Delete, Edit } from '@edifice-ui/icons';
import {
  Dropdown,
  DropdownMenuOptions,
  IconButtonProps,
} from '@edifice-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { v4 as uuid } from 'uuid';
import { useAccessStore } from '~/hooks/useAccessStore';
import { useInvalidateNoteQueries } from '~/hooks/useInvalidateNoteQueries';
import { NoteProps } from '~/models/notes';
import { useWebsocketStore } from '~/store';
import { NoteActionList } from './NoteActionList';

export type NoteDropdownMenuOptions = DropdownMenuOptions & {
  hidden?: boolean;
};

export const NoteActions = ({ note }: { note: NoteProps }) => {
  const navigate = useNavigate();
  const invalidateNoteQueries = useInvalidateNoteQueries();

  const { t } = useTranslation();

  const { hasRightsToUpdateNote } = useAccessStore();
  const { sendNoteDeletedEvent } = useWebsocketStore();

  const handleEdit = (event: React.MouseEvent) => {
    // Stop Mouse click event propagation when user clicks on dropdown action
    // to prevent ReactFlow onNodeClick event to open Note Modal on read mode
    if (event) {
      event.stopPropagation();
    }

    navigate(`note/${note._id}?mode=edit`);
  };

  const handleDelete = async (event: React.MouseEvent) => {
    // Stop Mouse click event propagation when user clicks on dropdown action
    // to prevent ReactFlow onNodeClick event to open Note Modal on read mode
    if (event) {
      event.stopPropagation();
    }

    await sendNoteDeletedEvent({
      _id: note._id,
      actionType: 'Do',
      actionId: uuid(),
    });
    await invalidateNoteQueries();
  };

  const dropdownOptions: NoteDropdownMenuOptions[] = [
    {
      icon: <Edit />,
      label: t('edit'),
      action: handleEdit,
      hidden: !hasRightsToUpdateNote(note),
    },
    {
      icon: <Delete />,
      label: t('remove'),
      action: handleDelete,
      hidden: !hasRightsToUpdateNote(note),
    },
  ];

  return (
    <div className="dropdown-note-action nodrag">
      <Dropdown placement="right-start">
        {(
          triggerProps: JSX.IntrinsicAttributes &
            Omit<IconButtonProps, 'ref'> &
            RefAttributes<HTMLButtonElement>,
        ) => (
          <NoteActionList
            noteId={note._id}
            triggerProps={triggerProps}
            dropdownOptions={dropdownOptions}
          />
        )}
      </Dropdown>
    </div>
  );
};
