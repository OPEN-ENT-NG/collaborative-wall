import { Button, useOdeClient } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { useWall } from "~/services/queries";

import { useWhiteboard } from "~/store";

export default function DescriptionWall() {
  const { appCode } = useOdeClient();
  const { t } = useTranslation();

  const { wall } = useWall();

  const { seOpenDescriptionModal } = useWhiteboard(
    useShallow((state) => ({
      seOpenDescriptionModal: state.setOpenDescriptionModal,
      openDescriptionModal: state.openDescriptionModal,
    })),
  );

  return (
    <div className="description-wall d-flex justify-content-between">
      <p className="text-truncate">{wall?.description}</p>
      <Button
        variant="ghost"
        color="tertiary"
        onClick={() => seOpenDescriptionModal(true)}
        style={{ whiteSpace: "nowrap" }}
      >
        {t("collaborativewall.see.more", { ns: appCode })}
      </Button>
    </div>
  );
}
