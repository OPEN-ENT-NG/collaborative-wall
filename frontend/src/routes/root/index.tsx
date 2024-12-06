import { Layout, LoadingScreen, useEdificeClient } from '@edifice.io/react';
import { Outlet, matchPath, useLocation } from 'react-router-dom';

import { basename } from '..';

/** Check old format URL and redirect if needed */
export const loader = async () => {
  const hashLocation = location.hash.substring(1);

  // Check if the URL is an old format (angular root with hash) and redirect to the new format
  if (hashLocation) {
    const isWallPath = matchPath('/view/:wallId', hashLocation);

    if (isWallPath) {
      // Redirect to the new format
      const redirectPath = `/id/${isWallPath?.params.wallId}`;
      location.replace(
        location.origin + basename.replace(/\/$/g, '') + redirectPath,
      );
    }
  }

  return null;
};

export const Root = () => {
  const location = useLocation();

  const { init } = useEdificeClient();

  if (!init) return <LoadingScreen position={false} />;

  return (
    <Layout headless={location.pathname !== '/'}>
      <Outlet />
    </Layout>
  );
};

export default Root;
