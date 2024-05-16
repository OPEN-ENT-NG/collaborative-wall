import { Fragment, RefAttributes, useEffect } from "react";

import { Options } from "@edifice-ui/icons";
import { Dropdown, IconButton, IconButtonProps } from "@edifice-ui/react";
import { NoteDropdownMenuOptions } from "~/features/note-actions/types";
import { useWhiteboardStore } from "~/store";

export const ActionList = ({
  triggerProps,
  dropdownOptions,
}: {
  triggerProps: JSX.IntrinsicAttributes &
    Omit<IconButtonProps, "ref"> &
    RefAttributes<HTMLButtonElement>;
  dropdownOptions: NoteDropdownMenuOptions[];
}) => {
  const { setIsOpenDropdown } = useWhiteboardStore();

  useEffect(() => {
    setIsOpenDropdown(triggerProps["aria-expanded"] as boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerProps["aria-expanded"]]);

  return (
    <>
      <IconButton
        {...triggerProps}
        type="button"
        aria-label="label"
        color="secondary"
        variant="ghost"
        icon={<Options />}
        className="card-actions-btn bg-white"
      />
      <Dropdown.Menu>
        {dropdownOptions.map((dropdownOption, index) => (
          <Fragment key={index}>
            {dropdownOption.type === "divider" ? (
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
