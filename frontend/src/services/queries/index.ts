import { useToast } from "@edifice-ui/react";
import { useMutation } from "@tanstack/react-query";
import { ShareRight, UpdateParameters } from "edifice-ts-client";
import { t } from "i18next";

import { shareResource, updateResource } from "../api";

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
