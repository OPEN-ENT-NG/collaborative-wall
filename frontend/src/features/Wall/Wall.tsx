import { LoadingScreen } from '@edifice.io/react';
import { Outlet } from 'react-router-dom';
import 'reactflow/dist/base.css';
import { useShallow } from 'zustand/react/shallow';
import { EmptyScreenError } from '~/components/EmptyScreenError/EmptyScreenError';
import { useNotes, useWall } from '~/services/queries';
import { useWebsocketStore } from '~/store';
import { Mode, Status } from '~/store/websocket/types';
import { checkQueryResult } from '~/utils/checkQueryResult';
import { WebsocketRenderedCursors } from '../Websocket/components/WebsocketRenderedCursor';
import { useEvents } from '../Websocket/hooks/useEvents';
import { useProviderConnection } from '../Websocket/hooks/useProviderConnection';
import { CollaborativeWallContainer } from './WallContainer';
import { WallReactFlow } from './WallReactFlow';

/* Lazy Loaded Modal */
export const Wall = () => {
  /* Get fresh data from react query */
  const { wall, query } = useWall();
  const { notes, query: queryNotes } = useNotes();
  /* Websocket Store */
  const { status, readyState, showCursors } = useWebsocketStore(
    useShallow((state) => ({
      status: state.status,
      readyState: state.readyState,
      showCursors: state.showCursors,
    })),
  );

  const isIDLE = status === Status.IDLE;
  const isPending = query.isPending;

  /* Hook to check HTTP or Websocket connection */
  useProviderConnection();

  /* Websocket Events */
  useEvents();

  const mode = useWebsocketStore((state) => state.mode);
  const isWebsocketMode = mode === Mode.WS;
  // check whether query succeed else throw error
  checkQueryResult(query);
  checkQueryResult(queryNotes);

  if (isPending || !readyState || isIDLE)
    return <LoadingScreen position={false} />;

  if (!wall || !notes || query.isError) return <EmptyScreenError />;

  return (
    <CollaborativeWallContainer>
      {isWebsocketMode && showCursors && <WebsocketRenderedCursors />}
      <WallReactFlow />
      <Outlet />
    </CollaborativeWallContainer>
  );
};
