import { Button, Heading, Layout } from "@edifice-ui/react";
import { t } from "i18next";
import { useCallback } from "react";
import { useLocation, useNavigate, useRouteError } from "react-router-dom";
const HOME_URI = import.meta.env.PROD ? `/collaborativewall` : `/`;

export const PageError = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const location = useLocation();
  console.error(error);

  const handleBack = useCallback(() => {
    // check wether we were editing wall while having error => if so redirect to home
    if (error instanceof Response && location.pathname.includes(`/id/`)) {
      navigate(HOME_URI);
    } else {
      navigate(-1);
    }
  }, [navigate, location, error]);
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
        <Button color="primary" onClick={handleBack}>
          {t("back")}
        </Button>
      </div>
    </Layout>
  );
};
