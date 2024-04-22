import { useUser } from "@edifice-ui/react";
import { useParams } from "react-router-dom";

import { NoteProps } from "~/models/notes";
import { useGetWall } from "~/services/queries";
import { useHasRights } from "./use-has-rights";

export const useAccess = () => {
  const params = useParams();

  const { data: wall } = useGetWall(params.wallId as string);

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
