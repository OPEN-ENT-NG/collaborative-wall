import { useUser } from "@edifice-ui/react";
import { NoteProps } from "~/models/notes";
import { useRightsStore } from "~/store/rights/store";

export const useAccessStore = () => {
  const { user } = useUser();

  const userRights = useRightsStore((state) => state.userRights);

  const hasRightsToMoveNote = (note: NoteProps) => {
    const right = (userRights.creator ||
      userRights.manager ||
      (userRights.contrib &&
        note?.owner?.userId.includes(user?.userId as string))) as boolean;
    return right;
  };

  const hasRightsToUpdateNote = (note: NoteProps) => {
    const right = (userRights.creator ||
      userRights.manager ||
      (userRights.contrib &&
        note?.owner?.userId.includes(user?.userId as string))) as boolean;

    return right;
  };

  return { userRights, hasRightsToMoveNote, hasRightsToUpdateNote };
};
