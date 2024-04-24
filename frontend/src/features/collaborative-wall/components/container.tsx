import { ReactNode } from "react";
import { MoveUser } from "~/models/types";
import { ConnectedUsers } from "~/store/websocket/types";
import { Cursor } from "../../websocket/components/cursor";
import { useConnectedUsers } from "../../websocket/hooks/use-connected-users";
import { useWebsocketStore } from "../../websocket/hooks/use-websocket-store";

const renderCursors = (coUsers: ConnectedUsers[], moveUsers: MoveUser[]) => {
  if (!coUsers) return null;

  return moveUsers.map((moveUser) => {
    const user = coUsers.find((user) => user.id === moveUser.id);

    return (
      <Cursor
        key={moveUser.id}
        username={user?.name}
        point={[moveUser.x, moveUser.y]}
      />
    );
  });
};

export const CollaborativeWallContainer = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [filteredUsers, numberOfUsers] = useConnectedUsers();

  const { moveUsers } = useWebsocketStore();

  return (
    <div className="collaborativewall-container">
      {numberOfUsers && renderCursors(filteredUsers, moveUsers)}
      {children}
    </div>
  );
};
