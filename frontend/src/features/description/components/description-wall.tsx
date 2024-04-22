import { Button, useOdeClient } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { useGetWall } from "~/services/queries";

import { useWhiteboard } from "~/store";

export default function DescriptionWall() {
  const { appCode } = useOdeClient();
  const { t } = useTranslation();
  const params = useParams();

  const { data: wall } = useGetWall(params.wallId as string);

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
