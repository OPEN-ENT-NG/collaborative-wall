import { useCallback, useEffect } from "react";

import useWebSocket, { ReadyState } from "react-use-websocket";

import { useShallow } from "zustand/react/shallow";
import { useWall } from "~/services/queries";
import { useWebsocketStore } from "~/store";
import {
  ActionPayload,
  Mode,
  Status,
  WSProvider,
} from "../../../store/websocket/types";

export const useWSMode = (): WSProvider => {
  const { wall } = useWall();
  const { mode, status, subscribers, disconnect, onReady } = useWebsocketStore(
    useShallow((state) => ({
      mode: state.mode,
      status: state.status,
      subscribers: state.subscribers,
      disconnect: state.disconnect,
      onReady: state.onReady,
    })),
  );
  const isWebsocketMode = mode === Mode.WS;

  const isLocalhost = window.location.hostname === "localhost";

  const getSocketURL = useCallback(() => {
    return isLocalhost
      ? `ws://${window.location.hostname}:9091/collaborativewall/${wall?._id}`
      : `wss://${window.location.host}/collaborativewall/realtime/${wall?._id}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocalhost]);

  const { sendJsonMessage, getWebSocket, lastJsonMessage, readyState } =
    useWebSocket(
      getSocketURL,
      {
        share: true,
        reconnectAttempts: 5,
        reconnectInterval: 100,
        retryOnError: true,
        shouldReconnect: () => isWebsocketMode,
        onOpen() {
          onReady(Mode.WS);
        },
        onClose() {
          if (isWebsocketMode && status === Status.STARTED) {
            disconnect();
          }
        },
        onMessage(event) {
          if (isWebsocketMode) {
            const data = JSON.parse(event.data);
            subscribers.forEach((sub) => sub(data));
          }
        },
        onReconnectStop(attempt) {
          console.error(
            "[collaborativewall][realtime] Reconnect max attempt:",
            attempt,
          );
          onReady(Mode.HTTP);
        },
        onError(event) {
          console.error(
            "[collaborativewall][realtime] Server has sent error:",
            event,
          );
        },
      },
      isWebsocketMode && wall?._id !== undefined,
    );

  // Run when the connection state (readyState) changes
  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      useWebsocketStore.setState((state) => ({
        ...state,
        readyState: true,
      }));
    }
  }, [readyState]);

  // Run when a new WebSocket message is received (lastJsonMessage)
  useEffect(() => {
    // @ts-ignore
    console.log(`Got a new message: ${JSON.stringify(lastJsonMessage?.type)}`);
  }, [lastJsonMessage]);

  const send = (action: ActionPayload) => {
    sendJsonMessage(action);
    return Promise.resolve();
  };

  const close = () => {
    getWebSocket()?.close();
  };

  return { send, close };
};
