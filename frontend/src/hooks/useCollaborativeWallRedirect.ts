import { useEffect } from "react";

import {
  useNavigate,
  useLocation,
  useNavigation,
  matchPath,
} from "react-router-dom";

export const useCollaborativeWallRedirect = () => {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const location = useLocation();

  const ngLocation = location.hash.substring(1);

  const wall = matchPath("/view/:wallId", ngLocation);
  const wallPath = `/id/${wall?.params.wallId}`;

  const isLoading = navigation.state === "loading";

  useEffect(() => {
    if (wall) navigate(wallPath);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isLoading;
};
