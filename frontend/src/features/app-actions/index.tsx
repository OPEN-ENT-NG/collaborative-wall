import { RefAttributes } from "react";

import { Options, Landscape } from "@edifice-ui/icons";
import {
  Button,
  Dropdown,
  IconButtonProps,
  IconButton,
} from "@edifice-ui/react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { useAccess } from "~/hooks/useAccess";
import { useWhiteboard } from "~/store";

export const AppActions = () => {
  const { isCreator } = useAccess();
  const { t } = useTranslation();

  const { setOpenShareModal, setIsOpenBackgroundModal } = useWhiteboard(
    useShallow((state) => ({
      setOpenShareModal: state.setOpenShareModal,
      setIsOpenBackgroundModal: state.setIsOpenBackgroundModal,
    })),
  );

  const renderButton = () => {
    return isCreator ? (
      <Button variant="filled" onClick={() => setOpenShareModal(true)}>
        {t("share")}
      </Button>
    ) : null;
  };

  return (
    <>
      {renderButton()}

      {isCreator && (
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
                <Dropdown.Item
                  icon={<Landscape />}
                  onClick={() => setIsOpenBackgroundModal(true)}
                >
                  {t("collaborativewall.modal.background")}
                </Dropdown.Item>
              </Dropdown.Menu>
            </>
          )}
        </Dropdown>
      )}
    </>
  );
};
