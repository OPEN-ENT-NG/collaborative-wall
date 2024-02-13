import { LoadingScreen, Layout } from "@edifice-ui/react";
import { Outlet } from "react-router-dom";

import { useCollaborativeWallRedirect } from "~/hooks/useCollaborativeWallRedirect";

function Root() {
  const isLoading = useCollaborativeWallRedirect();

  if (isLoading) return <LoadingScreen position={false} />;

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default Root;
