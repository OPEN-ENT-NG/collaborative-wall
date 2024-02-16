import { usePaths, EmptyScreen } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

export default function EmptyScreenError(): JSX.Element {
  const [imagePath] = usePaths();
  const { t } = useTranslation();

  return (
    <EmptyScreen
      imageSrc={`${imagePath}/emptyscreen/illu-error.svg`}
      imageAlt={t("explorer.emptyScreen.error.alt")}
      text={"explorer.emptyScreen.error.text"}
    />
  );
}
