import { Button } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

export function DescriptionWall({
  setIsOpen,
}: {
  setIsOpen: (bool: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <div
      style={{
        position: "fixed",
        top: "73px",
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
        Lorem ipsum dolor sit amet. Sed inventore dolore quo accusantium
        assumenda non quos nihil
      </p>
      <Button variant="ghost" color="tertiary" onClick={() => setIsOpen(true)}>
        {t("explorer.see.more")}
      </Button>
    </div>
  );
}
