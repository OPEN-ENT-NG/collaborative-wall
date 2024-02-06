import { useToast } from "@edifice-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { IAction, ShareRight, UpdateParameters } from "edifice-ts-client";
import { t } from "i18next";

import {
  sessionHasWorkflowRights,
  shareResource,
  updateResource,
} from "../api";
import { workflows } from "~/config";

export const useActions = () => {
  const { view, list } = workflows;

  return useQuery<Record<string, boolean>, Error, IAction[]>({
    queryKey: ["actions"],
    queryFn: async () => {
      const availableRights = await sessionHasWorkflowRights([view, list]);
      return availableRights;
    },
    select: (data) => {
      const actions: any[] = [
        {
          id: "view",
          workflow: view,
        },
        {
          id: "list",
          workflow: list,
        },
      ];
      return actions.map((action) => ({
        ...action,
        available: data[action.workflow],
      }));
    },
  });
};

export const useShareResource = () => {
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      resourceId,
      rights,
    }: {
      resourceId: string;
      rights: ShareRight[];
    }) => await shareResource("blog", { resourceId, rights }),
    onError(error) {
      if (typeof error === "string")
        toast.error(t("explorer.shared.status.error"));
    },
  });
};

export const useUpdateResource = () => {
  const toast = useToast();

  return useMutation({
    mutationFn: async (params: UpdateParameters) => {
      console.log({ params });
      return await updateResource("blog", { params });
    },
    onError(error) {
      if (typeof error === "string") toast.error(t(error));
    },
  });
};
