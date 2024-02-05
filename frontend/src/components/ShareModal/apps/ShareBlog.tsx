import { useOdeClient, Heading, Radio } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

import { PublicationType } from "../hooks/useShareBlog";

export interface ShareBlogProps {
  radioPublicationValue: PublicationType | string;
  onRadioPublicationChange: (event: PublicationType) => void;
}

export default function ShareBlog({
  radioPublicationValue,
  onRadioPublicationChange,
}: ShareBlogProps) {
  const { appCode } = useOdeClient();
  const { t } = useTranslation(appCode);

  return (
    <>
      <hr />

      <Heading headingStyle="h4" level="h3" className="mb-16">
        {t("explorer.publication.steps")}
      </Heading>

      <Radio
        label={t("explorer.immediat.publication")}
        id="publication-now"
        name="publication"
        value={"IMMEDIATE" as PublicationType}
        model={radioPublicationValue as string}
        checked={radioPublicationValue === "IMMEDIATE"}
        onChange={(e) =>
          onRadioPublicationChange(e.target.value as PublicationType)
        }
      />
      <Radio
        label={t("explorer.validate.publication")}
        id="publication-validate"
        name="publication"
        value={"RESTRAINT" as PublicationType}
        checked={radioPublicationValue === "RESTRAINT"}
        model={radioPublicationValue as string}
        onChange={(e) =>
          onRadioPublicationChange(e.target.value as PublicationType)
        }
      />
    </>
  );
}
