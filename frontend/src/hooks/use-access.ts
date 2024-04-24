import { useUser } from "@edifice-ui/react";

import { NoteProps } from "~/models/notes";
import { useWall } from "~/services/queries";
import { useHasRights } from "./use-has-rights";

export const useAccess = () => {
  const { wall } = useWall();
  const { user } = useUser();

  const isCreator = useHasRights({
    roles: "creator",
    rights: wall?.rights,
  });

  const isManager = useHasRights({
    roles: "manager",
    rights: wall?.rights,
  });

  const isContributor = useHasRights({
    roles: "contrib",
    rights: wall?.rights,
  });

  const isReader = useHasRights({
    roles: "read",
    rights: wall?.rights,
  });

  const allRolesButRead = useHasRights({
    roles: ["creator", "manager", "contrib"],
    rights: wall?.rights,
  });

  const hasRightsToMoveNote = (note: NoteProps) => {
    const right = (isCreator ||
      isManager ||
      (isContributor &&
        note?.owner?.userId.includes(user?.userId as string))) as boolean;

    return right;
  };

  const hasRightsToUpdateNote = (note: NoteProps) => {
    return (isCreator ||
      isManager ||
      (isContributor &&
        note?.owner?.userId.includes(user?.userId as string))) as boolean;
  };

  return {
    isCreator,
    isManager,
    isContributor,
    isReader,
    hasRightsToMoveNote,
    hasRightsToUpdateNote,
    allRolesButRead,
  };
};
