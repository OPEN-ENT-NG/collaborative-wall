import { useUser } from "@edifice-ui/react";
import { useWebsocketStore } from "~/store";
import { Cursor } from "./cursor";

export const RenderedCursors = () => {
  const { user } = useUser();

  const connectedUsers = useWebsocketStore((state) => state.connectedUsers);
  const maxConnectedUsers = useWebsocketStore(
    (state) => state.maxConnectedUsers,
  );
  // const isVisible = useWebsocketStore((state) => state.isVisible);
  const moveUsers = useWebsocketStore((state) => state.moveUsers);

  const numberOfUsers = connectedUsers.length <= maxConnectedUsers;
  const filteredUsers = connectedUsers.filter(
    (connectedUser: { id: string | undefined }) =>
      connectedUser.id !== user?.userId,
  );

  const renderCursors = () => {
    if (!filteredUsers || !moveUsers) return null;

    return moveUsers.map((moveUser) => {
      const user = filteredUsers.find((user) => user.id === moveUser.id);

      if (moveUser.x === 0 && moveUser.y === 0) return;

      return (
        <Cursor
          key={moveUser.id}
          username={user?.name}
          point={[moveUser.x, moveUser.y]}
        />
      );
    });
  };

  return numberOfUsers ? renderCursors() : null;
};
