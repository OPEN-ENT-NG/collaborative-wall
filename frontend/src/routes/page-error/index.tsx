import { Button, Heading, Layout } from "@edifice-ui/react";
import { t } from "i18next";
import { useNavigate, useRouteError } from "react-router-dom";

export const PageError = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  console.error(error);

  return (
    <Layout>
      <div className="d-flex flex-column gap-16 align-items-center mt-64">
        <Heading level="h2" headingStyle="h2" className="text-secondary">
          {t("oops")}
        </Heading>
        <div className="text">
          {t("collaborativewall.notfound.or.unauthorized", {
            ns: "collaborativewall",
          })}
        </div>
        <Button color="primary" onClick={() => navigate(-1)}>
          {t("back")}
        </Button>
      </div>
    </Layout>
  );
};
