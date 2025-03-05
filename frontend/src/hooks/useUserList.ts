import { useUser } from '@edifice.io/react';
import { useWall } from '~/services/queries';
import { useWebsocketStore } from '~/store';

export const useUserList = () => {
  const { showCursors, setShowCursors } = useWebsocketStore();
  // Get the current wall
  const { wall } = useWall();
  // get the current user
  const { user } = useUser();
  // Get connected users from the websocket store
  let connectedUsers = useWebsocketStore((state) => state.connectedUsers);
  // If the current user is defined, add it to the list
  if (user) {
    // remove the current user from the list
    connectedUsers = connectedUsers.filter((u) => u.id !== user.userId);
    // sort the list by name
    connectedUsers = connectedUsers.sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    //add the current user to the list
    connectedUsers = [
      { id: user.userId, name: user.username, groupIds: user.groupsIds },
      ...connectedUsers,
    ];
  }
  // Add avatar to connected users
  const connectedUsersWithAvatar = connectedUsers.map((u) => {
    const rights = wall?.rights ?? [];
    const isCreator = rights.includes(`creator:${u.id}`);
    const isContrib =
      rights.includes(`user:${u.id}:contrib`) ||
      u.groupIds.some((g) => rights.includes(`group:${g}:contrib`));
    const isManage =
      rights.includes(`user:${u.id}:manager`) ||
      u.groupIds.some((g) => rights.includes(`group:${g}:manager`));
    return {
      ...u,
      right: isCreator
        ? 'creator'
        : isManage
          ? 'manager'
          : isContrib
            ? 'contrib'
            : 'read',
      isMe: u.id === user?.userId,
      avatar: `/userbook/avatar/${u.id}`,
    };
  });

  const toggleShowCursors = () => {
    setShowCursors(!showCursors);
  };
  return {
    connectedUsers: connectedUsersWithAvatar,
    showCursors,
    toggleShowCursors,
  };
};
