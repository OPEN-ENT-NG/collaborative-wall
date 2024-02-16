import { useUser } from "@edifice-ui/react";

import { rights } from "~/config";
import { CollaborativeWallProps } from "~/models/wall";

export const useUserRights = ({
  data,
}: {
  data: CollaborativeWallProps | undefined;
}): {
  canUpdate: boolean | undefined;
} => {
  const { user } = useUser();
  const { shared } = data || {};

  const userId = user?.userId;
  const groupsIds = user?.groupsIds;
  const isOwner = data?.owner.userId === userId;

  let canUpdate;

  if (isOwner) {
    canUpdate = true;
  }

  if (!isOwner && rights) {
    canUpdate = shared?.some((right) => {
      //@ts-ignore
      const groupId = right["groupId"];
      //@ts-ignore
      const userRight = right[rights.contrib.right];

      if (groupId !== undefined && groupsIds?.includes(groupId)) {
        return userRight;
      }

      //@ts-ignore
      const userRightUserId = right["userId"];
      return userRightUserId !== undefined && userId === userRightUserId
        ? userRight
        : false;
    });
  }

  return {
    canUpdate,
  };
};
