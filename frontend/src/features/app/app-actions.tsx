import { Fragment, RefAttributes } from "react";

import {
  Options,
  Print,
  SetBackground,
  Settings,
  Share,
} from "@edifice-ui/icons";
import {
  Dropdown,
  DropdownMenuOptions,
  IconButton,
  IconButtonProps,
  useOdeClient,
} from "@edifice-ui/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useWall } from "~/services/queries";
import { useWhiteboardStore } from "~/store";
import { useRightsStore } from "~/store/rights/store";

export type ActionDropdownMenuOptions = DropdownMenuOptions & {
  id: string;
  visibility?: boolean;
};

export const AppActions = () => {
  const navigate = useNavigate();

  const { wall } = useWall();
  const { appCode } = useOdeClient();
  const { t } = useTranslation();

  /** Store to handle correctly rights to access ressource to avoid unexpected re-renders  */
  const { isCreator, isManager } = useRightsStore(
    useShallow((state) => ({
      isCreator: state.isCreator,
      isManager: state.isManager,
    })),
  );

  /* When destructring methods, it's okay to not shallow. We doesn't use stored state */
  const { setOpenShareModal, setOpenUpdateModal, setIsOpenBackgroundModal } =
    useWhiteboardStore();

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
      action: () => navigate(`/print/id/${wall?._id}`),
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
