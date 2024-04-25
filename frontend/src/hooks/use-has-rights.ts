import { useCallback, useEffect, useState } from "react";

import { ResourceRight, odeServices, type RightRole } from "edifice-ts-client";

export interface IObjectWithRights {
  rights: string[];
}

type Roles = RightRole | RightRole[];

interface UseHasRightsProps {
  roles: Roles;
  rights:
    | string
    | string[]
    | IObjectWithRights
    | IObjectWithRights[]
    | undefined;
}

export function useHasRights({ roles, rights }: UseHasRightsProps) {
  const [state, setState] = useState<boolean>(false);

  const convertToArray = (rights: string | string[]) =>
    rights instanceof Array ? rights : [rights];

  const checkRightForMultipleResources = useCallback(
    async (roles: Roles, rights: ResourceRight[][] | string[][]) => {
      const can = Array.isArray(roles)
        ? await odeServices
            .rights()
            .sessionHasAtLeastOneResourceRightForEachList(roles, rights)
        : await odeServices
            .rights()
            .sessionHasResourceRightForEachList(roles, rights);
      setState(can);
    },
    [],
  );

  const checkRights = async (roles: Roles, rights: string | string[]) => {
    const safeRights = convertToArray(rights);
    const can = Array.isArray(roles)
      ? await odeServices
          .rights()
          .sessionHasAtLeastOneResourceRight(roles, safeRights)
      : await odeServices.rights().sessionHasResourceRight(roles, safeRights);
    setState(can);
  };

  useEffect(() => {
    (async () => {
      if (roles === undefined) {
        setState(true);
        return;
      }
      if (Array.isArray(rights)) {
        if (rights.length > 0) {
          if (typeof rights[0] === "string") {
            await checkRights(roles, rights as string[]);
          } else {
            const rightsArray = (rights as IObjectWithRights[]).map(
              (right) => right.rights,
            );
            await checkRightForMultipleResources(roles, rightsArray);
          }
        } else {
          setState(false);
        }
      } else {
        if (typeof rights === "string") {
          await checkRights(roles, rights);
        } else if (rights) {
          await checkRights(roles, rights.rights);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rights, roles]);

  return state;
}
