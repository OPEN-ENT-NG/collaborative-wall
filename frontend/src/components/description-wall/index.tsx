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
    <div
      style={{
        position: "fixed",
        zIndex: "11",
        backgroundColor: "rgb(255 255 255 / 80%)",
        width: "100%",
        display: "flex",
        padding: "8px 48px 8px 48px",
        alignItems: "center",
        gap: "8px",
        lineHeight: "22px",
      }}
    >
      <p
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {description}
      </p>
      <Button variant="ghost" color="tertiary" onClick={() => setIsOpen(true)}>
        <p style={{ whiteSpace: "nowrap" }}>{t("explorer.see.more")}</p>
      </Button>
    </div>
  );
}
