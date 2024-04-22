import {
  AppHeader as BaseAppHeader,
  Breadcrumb,
  useOdeClient,
} from "@edifice-ui/react";
import { IWebApp } from "edifice-ts-client";
import { useParams } from "react-router-dom";
import { useGetWall } from "~/services/queries";
import { useWhiteboard } from "~/store";
import { AppActions } from "./app-actions";

export const AppHeader = () => {
  const params = useParams();
  const isMobile = useWhiteboard((state) => state.isMobile);

  const { currentApp } = useOdeClient();
  const { data: wall } = useGetWall(params.wallId as string);

  return (
    !isMobile && (
      <BaseAppHeader
        isFullscreen
        style={{ position: "sticky" }}
        render={() => <AppActions />}
      >
        <Breadcrumb app={currentApp as IWebApp} name={wall?.name} />
      </BaseAppHeader>
    )
  );
};
