import { useUser } from "@edifice-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { useHasRights } from "./useHasRights";
import { NoteProps } from "~/models/notes";
import { wallQueryOptions } from "~/services/queries";

export const useAccess = () => {
  const params = useParams();

  const { data: wall } = useQuery({
    queryKey: wallQueryOptions(params.wallId as string).queryKey,
    queryFn: wallQueryOptions(params.wallId as string).queryFn,
  });

  const { user } = useUser();

  const isCreator = useHasRights({
    roles: "creator",
    rights: wall?.rights,
  });

  const isManager = useHasRights({
    roles: ["manager"],
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

  const hasRightsToMoveNote = (note: NoteProps) => {
    return ((isCreator && isManager) ||
      (isContributor &&
        note?.owner?.userId.includes(user?.userId as string))) as boolean;
  };

  return { isCreator, isManager, isContributor, isReader, hasRightsToMoveNote };
};
