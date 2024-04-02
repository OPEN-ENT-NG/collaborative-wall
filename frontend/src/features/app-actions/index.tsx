import { Fragment, RefAttributes } from "react";

import {
  Options,
  Print,
  Settings,
  Share,
  SetBackground,
} from "@edifice-ui/icons";
import {
  Dropdown,
  IconButtonProps,
  IconButton,
  useOdeClient,
  DropdownMenuOptions,
} from "@edifice-ui/react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { useAccess } from "~/hooks/useAccess";
import { useWhiteboard } from "~/store";

export type ActionDropdownMenuOptions = DropdownMenuOptions & {
  id: string;
  visibility?: boolean;
};

export const AppActions = () => {
  const { isCreator, isManager } = useAccess();
  const { appCode } = useOdeClient();
  const { t } = useTranslation();

  const { setOpenShareModal, setOpenUpdateModal, setIsOpenBackgroundModal } =
    useWhiteboard(
      useShallow((state) => ({
        setOpenShareModal: state.setOpenShareModal,
        setOpenUpdateModal: state.setOpenUpdateModal,
        setIsOpenBackgroundModal: state.setIsOpenBackgroundModal,
      })),
    );

  const dropdownOptions: ActionDropdownMenuOptions[] = [
    {
      id: "background",
      label: t("collaborativewall.modal.background", { ns: appCode }),
      icon: <SetBackground />,
      action: () => setIsOpenBackgroundModal(true),
      visibility: isCreator || isManager,
    },
    {
      id: "share",
      label: t("share"),
      icon: <Share />,
      action: () => setOpenShareModal(true),
      visibility: isCreator || isManager,
    },
    {
      id: "properties",
      label: t("properties"),
      icon: <Settings />,
      action: () => setOpenUpdateModal(true),
      visibility: isCreator || isManager,
    },
    {
      id: "print",
      label: t("print"),
      icon: <Print />,
      action: () => console.log("print"),
      visibility: true,
    },
  ];

  return (
    <Dropdown>
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
            color="primary"
            variant="outline"
            icon={<Options />}
          />

          <Dropdown.Menu>
            {dropdownOptions.map((option) => (
              <Fragment key={option.id}>
                {option.type === "divider" ? (
                  <Dropdown.Separator />
                ) : (
                  option.visibility && (
                    <Dropdown.Item
                      icon={option.icon}
                      onClick={() => option.action(null)}
                    >
                      {option.label}
                    </Dropdown.Item>
                  )
                )}
              </Fragment>
            ))}
          </Dropdown.Menu>
        </>
      )}
    </Dropdown>
  );
};
