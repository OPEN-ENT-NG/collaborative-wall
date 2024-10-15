import { queryOptions } from '@tanstack/react-query';
import { IAction } from 'edifice-ts-client';
import { sessionHasWorkflowRights } from '~/services/api';

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
