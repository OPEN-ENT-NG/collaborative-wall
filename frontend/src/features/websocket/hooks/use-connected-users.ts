import { useUser } from "@edifice-ui/react";

import { useWebsocketStore } from "./use-websocket-store";

export const useConnectedUsers = () => {
  const { user } = useUser();

  const { connectedUsers, maxConnectedUsers } = useWebsocketStore();

  const filteredUsers = connectedUsers.filter(
    (connectedUser: { id: string | undefined }) =>
      connectedUser.id !== user?.userId,
  );

  const numberOfUsers = connectedUsers.length <= maxConnectedUsers;

  return [filteredUsers, numberOfUsers] as const;
};
