import { Fragment, RefAttributes } from "react";

import { Copy, Delete, Edit, Options } from "@edifice-ui/icons";
import {
  Dropdown,
  DropdownMenuOptions,
  IconButton,
  IconButtonProps,
} from "@edifice-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { useAccess } from "~/hooks/useAccess";
import { useRealTimeService } from "~/hooks/useRealTimeService";
import { NoteProps } from "~/models/notes";
import { notesQueryOptions } from "~/services/queries";
import { useHistoryStore } from "~/store";

export type NoteDropdownMenuOptions = DropdownMenuOptions & {
  hidden?: boolean;
};

export const NoteActions = ({
  note,
  // setIsOpenDropdown,
}: {
  note: NoteProps;
  // setIsOpenDropdown: (value: boolean) => void;
}) => {
  const navigate = useNavigate();

  const { hasRightsToUpdateNote } = useAccess();

  const params = useParams();
  const queryClient = useQueryClient();
  const { deleteNote } = useRealTimeService(params.wallId!);
  const { setHistory } = useHistoryStore();

  const { t } = useTranslation();

  const handleEdit = () => {
    navigate(`note/${note._id}?mode=edit`);
  };

  const handleCopy = () => {
    // TODO
  };

  const handleDelete = async () => {
    await deleteNote(note);

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
      icon: <Copy />,
      label: t("duplicate"),
      action: handleCopy,
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
    <div onMouseDown={(event) => event.stopPropagation()}>
      <Dropdown placement="right-start">
        {(
          triggerProps: JSX.IntrinsicAttributes &
            Omit<IconButtonProps, "ref"> &
            RefAttributes<HTMLButtonElement>,
        ) => {
          // setIsOpenDropdown(triggerProps["aria-expanded"] as boolean);
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
                          onClick={() => dropdownOption.action(null)}
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
        }}
      </Dropdown>
    </div>
  );
};
