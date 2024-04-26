import { ReactNode } from "react";
import { createWebsocketStore } from "~/store";
import { Cursor } from "../../websocket/components/cursor";
import { useConnectedUsers } from "../../websocket/hooks/use-connected-users";
import { useWebsocketStore } from "../../websocket/hooks/use-websocket-store";

export const CollaborativeWallContainer = ({
  children,
}: {
  children: ReactNode;
}) => {
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

  return (
    <div className="collaborativewall-container vh-100">
      {numberOfUsers && renderCursors()}
      {children}
    </div>
  );
};
