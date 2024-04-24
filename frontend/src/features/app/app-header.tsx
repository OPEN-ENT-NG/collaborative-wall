import {
  AppHeader as BaseAppHeader,
  Breadcrumb,
  useOdeClient,
} from "@edifice-ui/react";
import { IWebApp } from "edifice-ts-client";
import { useWall } from "~/services/queries";
import { useWhiteboard } from "~/store";
import { AppActions } from "./app-actions";

export const AppHeader = () => {
  const isMobile = useWhiteboard((state) => state.isMobile);

  const { currentApp } = useOdeClient();
  const { wall } = useWall();

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
