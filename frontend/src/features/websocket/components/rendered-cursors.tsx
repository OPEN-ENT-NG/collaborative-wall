import { createWebsocketStore } from "~/store";
import { useConnectedUsers } from "../hooks/use-connected-users";
import { useWebsocketStore } from "../hooks/use-websocket-store";
import { Cursor } from "./cursor";

export const RenderedCursors = () => {
  const [filteredUsers, numberOfUsers] = useConnectedUsers();

  const { moveUsers } = useWebsocketStore();

  const isVisible = createWebsocketStore((state) => state.isVisible);

  const renderCursors = () => {
    if (!filteredUsers || !moveUsers) return null;

    if (isVisible) return;

    return moveUsers.map((moveUser) => {
      const user = filteredUsers.find((user) => user.id === moveUser.id);
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
