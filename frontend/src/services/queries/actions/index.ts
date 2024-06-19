import { queryOptions } from "@tanstack/react-query";
import { ACTION, IAction } from "edifice-ts-client";
import { workflows } from "~/config/workflows";
import { sessionHasWorkflowRights } from "~/services/api";

export const wallActions: IAction[] = [
  {
    id: ACTION.OPEN,
    workflow: workflows.view,
    right: "read",
  },
  {
    id: ACTION.EDIT,
    workflow: workflows.view,
    right: "manager",
  },
  {
    id: ACTION.CREATE,
    workflow: workflows.create,
    right: "manager",
  },
  {
    id: ACTION.PUBLISH,
    workflow: workflows.create,
    right: "manager",
  },
  {
    id: ACTION.SHARE,
    workflow: workflows.view,
    right: "creator",
  },
  {
    id: ACTION.PRINT,
    workflow: workflows.create,
    right: "read",
  },
];

/** Query actions availability depending on workflow rights */
export const availableActionsQuery = (actions: IAction[]) => {
  const actionRights = actions.map((action) => action.workflow);
  return queryOptions({
    queryKey: actionRights,
    queryFn: async () => await sessionHasWorkflowRights(actionRights),
    select: (data: Record<string, boolean>) => {
      return actions
        .filter((action: IAction) => data[action.workflow])
        .map((action) => ({
          ...action,
          available: true,
        })) as IAction[];
    },
    staleTime: Infinity,
  });
};
