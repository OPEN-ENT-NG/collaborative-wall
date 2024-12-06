import { QueryClient } from '@tanstack/react-query';
import { LoaderFunctionArgs } from 'react-router-dom';

import {
  notesQueryOptions,
  useWall,
  wallQueryOptions,
} from '~/services/queries';

import { checkUserRight, useTrashedResource } from '@edifice.io/react';
import { odeServices } from '@edifice.io/client';
import { AppHeader } from '~/features/App/AppHeader';
import { Description } from '~/features/Description/Description';
import { Wall } from '~/features/Wall/Wall';
import { useWhiteboardStore } from '~/store';
import { useRightsStore } from '~/store/rights/store';
import './index.css';

export const loader =
  (queryClient: QueryClient) =>
  async ({ params, request }: LoaderFunctionArgs) => {
    const queryWall = wallQueryOptions(params.wallId as string);
    const queryNotes = notesQueryOptions(params.wallId as string);

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('xApp');

    if (query) {
      useWhiteboardStore.setState((state) => ({
        ...state,
        isMobile: !!query,
      }));
    }

    const wall = await queryClient.ensureQueryData(queryWall);
    const notes = await queryClient.ensureQueryData(queryNotes);

    const userRights = await checkUserRight(wall.rights);
    const { setUserRights } = useRightsStore.getState();
    setUserRights(userRights);

    if (
      odeServices.http().isResponseError() &&
      odeServices.http().latestResponse.status === 401
    ) {
      throw new Response('', {
        status: 401,
        statusText: odeServices.http().latestResponse.statusText,
      });
    }

    return { wall, notes, query };
  };

export const Component = () => {
  const isMobile = useWhiteboardStore((state) => state.isMobile);

  const { wall } = useWall();

  useTrashedResource(wall?._id);

  return (
    <>
      <div className="position-fixed z-3 top-0 start-0 end-0">
        {!isMobile ? (
          <>
            <AppHeader />
            {wall?.description && <Description />}
          </>
        ) : null}
      </div>
      <Wall />
    </>
  );
};
