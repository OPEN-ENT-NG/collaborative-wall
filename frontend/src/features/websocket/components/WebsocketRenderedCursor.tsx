import { useUser } from "@edifice-ui/react";
import { useWebsocketStore } from "~/store";
import { Cursor } from "./WebsocketCursor";

export const WebsocketRenderedCursors = () => {
  const { user } = useUser();

  /* const queryForMetadata = useWebsocketStore((state) => state.queryForMetadata); */
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
      /* if (!user?.name) {
        // if missing  user => query for metadata
        queryForMetadata();
      } */
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
