import { Fragment, RefAttributes, useEffect } from 'react';

import { Dropdown, IconButton, IconButtonProps } from '@edifice.io/react';
import { IconOptions } from '@edifice.io/react/icons';
import { NoteDropdownMenuOptions } from '~/features/Note/components/NoteActions';
import { useWhiteboardStore } from '~/store';

export const NoteActionList = ({
  noteId,
  triggerProps,
  dropdownOptions,
}: {
  noteId: string;
  triggerProps: JSX.IntrinsicAttributes &
    Omit<IconButtonProps, 'ref'> &
    RefAttributes<HTMLButtonElement>;
  dropdownOptions: NoteDropdownMenuOptions[];
}) => {
  const { setDropdownState } = useWhiteboardStore();

  useEffect(() => {
    setDropdownState({
      isOpen: triggerProps['aria-expanded'] as boolean,
      idDropdown: noteId,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerProps['aria-expanded']]);

  return (
    <>
      <IconButton
        {...triggerProps}
        type="button"
        aria-label="label"
        color="secondary"
        variant="ghost"
        icon={<IconOptions />}
        className="card-actions-btn bg-white"
      />
      <Dropdown.Menu>
        {dropdownOptions.map((dropdownOption, index) => (
          <Fragment key={index}>
            {dropdownOption.type === 'divider' ? (
              <Dropdown.Separator />
            ) : (
              !dropdownOption.hidden && (
                <Dropdown.Item
                  icon={dropdownOption.icon}
                  onClick={dropdownOption.action}
                >
                  {dropdownOption.label}
                </Dropdown.Item>
              )
            )}
          </Fragment>
        ))}
      </Dropdown.Menu>
    </>
  );
};
