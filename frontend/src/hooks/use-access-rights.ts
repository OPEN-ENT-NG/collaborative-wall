import { useUser } from "@edifice-ui/react";
import { useEffect } from "react";
import { NoteProps } from "~/models/notes";
import { useWall } from "~/services/queries";
import { useRightsStore } from "~/store/rights/store";
import { checkHasRights } from "~/utils/check-has-rights";

export const useAccessStore = () => {
  const { wall } = useWall();
  const { user } = useUser();

  useEffect(() => {
    const updateRightsInStore = async () => {
      const isCreator = await checkHasRights({
        roles: "creator",
        rights: wall?.rights,
      });
      const isManager = await checkHasRights({
        roles: "manager",
        rights: wall?.rights,
      });
      const isContributor = await checkHasRights({
        roles: "contrib",
        rights: wall?.rights,
      });
      const isReader = await checkHasRights({
        roles: "read",
        rights: wall?.rights,
      });
      const allRolesButRead = await checkHasRights({
        roles: ["creator", "manager", "contrib"],
        rights: wall?.rights,
      });

      useRightsStore.setState((state) => ({
        ...state,
        isCreator,
        isManager,
        isContributor,
        isReader,
        allRolesButRead,
        isLoading: false,
      }));
    };
    updateRightsInStore();
  }, [wall?.rights]);

  const hasRightsToMoveNote = (note: NoteProps) => {
    const right = (useRightsStore.getState().isCreator ||
      useRightsStore.getState().isManager ||
      (useRightsStore.getState().isContributor &&
        note?.owner?.userId.includes(user?.userId as string))) as boolean;
    return right;
  };

  const hasRightsToUpdateNote = (note: NoteProps) => {
    const right = (useRightsStore.getState().isCreator ||
      useRightsStore.getState().isManager ||
      (useRightsStore.getState().isContributor &&
        note?.owner?.userId.includes(user?.userId as string))) as boolean;

    return right;
  };

  return { useRightsStore, hasRightsToMoveNote, hasRightsToUpdateNote };
};
