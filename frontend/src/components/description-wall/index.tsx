import { Button, useOdeClient } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { useWhiteboard } from "~/store";

export function DescriptionWall({ description }: { description: string }) {
  const { appCode } = useOdeClient();
  const { t } = useTranslation();

  const { seOpenDescriptionModal } = useWhiteboard(
    useShallow((state) => ({
      seOpenDescriptionModal: state.seOpenDescriptionModal,
      openDescriptionModal: state.openDescriptionModal,
    })),
  );

  return (
    <div className="description-wall">
      <p className="text-truncate">{description}</p>
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
