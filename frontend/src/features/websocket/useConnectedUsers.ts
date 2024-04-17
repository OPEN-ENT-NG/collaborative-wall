import { useUser } from "@edifice-ui/react";

import { useMousePosition } from "~/hooks/useMousePosition";
import { useWebsocketStore } from "~/store";

export const useConnectedUsers = () => {
  const { user } = useUser();

  useMousePosition();

  const { connectedUsers, maxConnectedUsers } = useWebsocketStore();

  const filteredUsers = connectedUsers.filter(
    (connectedUser: { id: string | undefined }) =>
      connectedUser.id !== user?.userId,
  );

  const numberOfUsers = connectedUsers.length <= maxConnectedUsers;

  return [filteredUsers, numberOfUsers] as const;
};
