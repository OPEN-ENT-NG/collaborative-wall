import { useUser } from "@edifice-ui/react";

import { useMousePosition } from "~/hooks/useMousePosition";
import { useWebsocketStore } from "~/store";

const MAX_USERS_CONNECTED = 5;

export const useConnectedUsers = () => {
  const { user } = useUser();

  useMousePosition();

  const { connectedUsers } = useWebsocketStore();

  const filteredUsers = connectedUsers.filter(
    (connectedUser: { id: string | undefined }) =>
      connectedUser.id !== user?.userId,
  );

  const numberOfUsers = connectedUsers.length <= MAX_USERS_CONNECTED;

  return [filteredUsers, numberOfUsers] as const;
};
