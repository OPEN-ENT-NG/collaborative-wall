import { Button, useOdeClient } from "@edifice-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { wallQueryOptions } from "~/services/queries";
import { useWhiteboard } from "~/store";

export function DescriptionWall() {
  const { appCode } = useOdeClient();
  const { t } = useTranslation();
  const params = useParams();

  const { data: wall } = useQuery({
    queryKey: wallQueryOptions(params.wallId as string).queryKey,
    queryFn: wallQueryOptions(params.wallId as string).queryFn,
  });

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
