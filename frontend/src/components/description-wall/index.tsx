import { Button } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

export function DescriptionWall({
  setIsOpen,
  description,
}: {
  setIsOpen: (bool: boolean) => void;
  description: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="description-wall">
      <p className="text-truncate">{description}</p>
      <Button
        variant="ghost"
        color="tertiary"
        onClick={() => setIsOpen(true)}
        style={{ whiteSpace: "nowrap" }}
      >
        {t("collaborativewall.see.more")}
      </Button>
    </div>
  );
}
