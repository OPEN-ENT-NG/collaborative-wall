import { useEffect, useReducer } from "react";

import { useOdeClient, useToast, useUser } from "@edifice-ui/react";
import { UseMutationResult } from "@tanstack/react-query";
import {
  odeServices,
  type ShareRightAction,
  type ShareRightWithVisibles,
  type ShareRight,
  type ShareRightActionDisplayName,
  IResource,
  PutShareResponse,
  UpdateResult,
  UpdateParameters,
  BlogUpdate,
} from "edifice-ts-client";
import { useTranslation } from "react-i18next";

import { CallbackProps } from "../ShareModal";
import { shareResource, updateResource } from "~/services/api";

interface UseShareResourceModalProps {
  onSuccess: ({ entId, thumbnail, resourceId, rights }: CallbackProps) => void;
  resource: IResource;
  updateResource?: UseMutationResult<
    UpdateResult,
    unknown,
    UpdateParameters,
    unknown
  >;
  shareResource?: UseMutationResult<
    PutShareResponse,
    unknown,
    {
      resourceId: string;
      rights: ShareRight[];
    },
    unknown
  >;
}

type State = {
  isSharing: boolean;
  shareRights: ShareRightWithVisibles;
  shareRightActions: ShareRightAction[];
};

export type ShareAction =
  | { type: "init"; payload: Partial<State> }
  | { type: "updateShareRights"; payload: ShareRightWithVisibles }
  | { type: "toggleRight"; payload: ShareRightWithVisibles }
  | { type: "deleteRow"; payload: ShareRightWithVisibles }
  | { type: "isSharing"; payload: boolean };

const initialState: State = {
  isSharing: false,
  shareRights: {
    rights: [],
    visibleBookmarks: [],
    visibleGroups: [],
    visibleUsers: [],
  },
  shareRightActions: [],
};

function reducer(state: State, action: ShareAction) {
  switch (action.type) {
    case "init":
      return { ...state, ...action.payload };
    case "deleteRow":
      return { ...state, shareRights: action.payload };
    case "updateShareRights":
      return { ...state, shareRights: action.payload };
    case "toggleRight":
      return { ...state, shareRights: action.payload };
    case "isSharing":
      return { ...state, isSharing: true };
    default:
      throw new Error(`Unhandled action type`);
  }
}

export default function useShare({
  onSuccess,
  resource,
  /* updateResource,
  shareResource, */
}: UseShareResourceModalProps) {
  const { appCode } = useOdeClient();
  const { user, avatar } = useUser();

  const [state, dispatch] = useReducer(reducer, initialState);

  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      const shareRightActions: ShareRightAction[] = await odeServices
        .share()
        .getActionsForApp(appCode);

      const shareRights: ShareRightWithVisibles = await odeServices
        .share()
        .getRightsForResource(appCode, resource.assetId);

      dispatch({
        type: "init",
        payload: {
          shareRightActions,
          shareRights,
        },
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleRight = (
    shareRight: ShareRight,
    actionName: ShareRightActionDisplayName,
  ) => {
    const { rights, ...props } = state.shareRights;

    const newShareRights: ShareRight[] = [...rights];
    const index: number = newShareRights.findIndex(
      (x) => x.id === shareRight.id,
    );
    const actionObject = state.shareRightActions.filter(
      (shareRightAction) => shareRightAction.id === actionName,
    )[0];

    const isActionRemoving: boolean =
      newShareRights[index].actions.findIndex(
        (action) => action.id === actionName,
      ) > -1;

    if (isActionRemoving) {
      // remove selected action and actions that requires the selected action
      let updatedActions = newShareRights[index].actions.filter(
        (action) => action.id !== actionName,
      );
      const requiredActions = state.shareRightActions.filter(
        (shareRightAction) => shareRightAction.requires?.includes(actionName),
      );
      updatedActions = updatedActions.filter(
        (action) =>
          !requiredActions.find(
            (requiredAction) => requiredAction.id === action.id,
          ),
      );

      newShareRights[index] = {
        ...newShareRights[index],
        actions: updatedActions,
      };
    } else {
      // add required actions
      const requiredActions = state.shareRightActions.filter(
        (shareRightAction) =>
          actionObject.requires?.includes(shareRightAction.id) &&
          !newShareRights[index].actions.find(
            (action) => action.id === shareRightAction.id,
          ),
      );
      newShareRights[index] = {
        ...newShareRights[index],
        actions: [
          ...newShareRights[index].actions,
          actionObject,
          ...requiredActions,
        ],
      };
    }

    // if bookmark then apply right to users and groups
    if (shareRight.type === "sharebookmark") {
      newShareRights[index].users?.forEach((user: { id: any }) => {
        const userIndex = newShareRights.findIndex(
          (item) => item.id === user.id,
        );
        newShareRights[userIndex] = {
          ...newShareRights[userIndex],
          actions: newShareRights[index].actions,
        };
      });

      newShareRights[index].groups?.forEach((user: { id: any }) => {
        const userIndex = newShareRights.findIndex(
          (item) => item.id === user.id,
        );
        newShareRights[userIndex] = {
          ...newShareRights[userIndex],
          actions: newShareRights[index].actions,
        };
      });
    }

    dispatch({
      type: "toggleRight",
      payload: {
        rights: newShareRights,
        ...props,
      },
    });
  };

  const toast = useToast();

  const handleShare = async (shareBlogPayload?: BlogUpdate) => {
    dispatch({
      type: "isSharing",
      payload: true,
    });

    try {
      //TODO move this logic into services
      // add my rights if needed (because visible api does not return my rights)
      const myRights = resource.rights
        .filter((right) => user && right.includes(`user:${user.userId}`))
        .map((right) => right.split(":")[2])
        .filter((right) => !!right);

      const shares = [...state.shareRights.rights];

      if (myRights.length > 0) {
        const actions: ShareRightAction[] = myRights.map((right) => {
          return {
            displayName: right,
            id: right,
          } as ShareRightAction;
        });
        shares.push({
          actions,
          avatarUrl: "",
          directoryUrl: "",
          displayName: user!.username,
          id: user!.userId,
          type: "user",
        });
      }

      console.log({ shareBlogPayload });

      let successUpdated;

      // update publication data
      if (appCode === "blog") {
        successUpdated = await updateResource("blog", {
          params: shareBlogPayload as BlogUpdate,
        });
      } else {
        successUpdated = await updateResource("blog", {
          params: {
            entId: resource.assetId || "",
            trashed: resource.trashed || false,
            name: resource.name || "",
            thumbnail: resource.thumbnail || "",
            description: resource.description || "",
            public: resource.public || false,
            slug: resource.slug || "",
          },
        });
      }

      await shareResource("blog", {
        resourceId: resource.assetId,
        rights: shares,
      });

      console.log({ successUpdated });

      onSuccess?.({
        entId: successUpdated.entId,
        thumbnail: successUpdated.thumbnail || "",
        resourceId: resource.assetId,
        rights: shares,
      });

      toast.success(t("explorer.shared.status.saved"));
    } catch (error) {
      if (typeof error === "string") toast.error(error);
      console.error("Failed to save share", error);
    } finally {
      dispatch({
        type: "isSharing",
        payload: false,
      });
    }
  };

  const handleDeleteRow = (shareRight: ShareRight) => {
    dispatch({
      type: "deleteRow",
      payload: {
        ...state.shareRights,
        rights: state.shareRights.rights.filter(
          (right: { id: any }) =>
            right.id !== shareRight.id &&
            !shareRight.users?.find(
              (user: { id: any }) => user.id === right.id,
            ) &&
            !shareRight.groups?.find(
              (group: { id: any }) => group.id === right.id,
            ),
        ),
      },
    });
  };

  const currentIsAuthor = () =>
    resource && resource.creatorId === user?.userId ? true : false;

  return {
    state,
    dispatch,
    currentIsAuthor,
    myAvatar: avatar,
    handleDeleteRow,
    handleShare,
    toggleRight,
  };
}
