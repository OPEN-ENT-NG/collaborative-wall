import { ReactNode } from "react";
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

  const renderCursors = () => {
    if (!filteredUsers || !moveUsers) return null;

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
    <div className="collaborativewall-container">
      {numberOfUsers && renderCursors()}
      {children}
    </div>
  );
};
