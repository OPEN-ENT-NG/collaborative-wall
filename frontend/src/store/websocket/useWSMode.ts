import { useCallback } from "react";

import useWebSocket from "react-use-websocket";

import { ActionPayload, EventPayload, WSProvider } from "./types";

export const useWSMode = ({
  enabled,
  wallId,
  reconnectAttempts,
  onOpen,
  onClose,
  onReconnectStop,
  onMessage,
}: {
  wallId: string | undefined;
  reconnectAttempts: number;
  enabled: boolean;
  onOpen: () => void;
  onClose: () => void;
  onReconnectStop: () => void;
  onMessage: (event: EventPayload) => void;
}): WSProvider => {
  const isLocalhost = window.location.hostname === "localhost";
  const getSocketURL = useCallback(() => {
    return isLocalhost
      ? `ws://${window.location.hostname}:9091/collaborativewall/${wallId}`
      : `wss://${window.location.host}/collaborativewall/realtime/${wallId}`;
  }, [isLocalhost, wallId]);
  const { sendJsonMessage, getWebSocket } = useWebSocket(
    getSocketURL,
    {
      share: true,
      reconnectAttempts,
      reconnectInterval: 100,
      retryOnError: true,
      shouldReconnect: () => enabled,
      onOpen,
      onClose,
      onReconnectStop(numAttemp) {
        console.error(
          "[collaborativewall][realtime] Reconnect max attempt:",
          numAttemp,
        );
        onReconnectStop();
      },
      onMessage: (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
      },
      onError(event) {
        console.error(
          "[collaborativewall][realtime] Server has sent error:",
          event,
        );
      },
    },
    enabled && wallId !== undefined,
  );
  const send = (action: ActionPayload) => {
    sendJsonMessage(action);
    return Promise.resolve();
  };
  const close = () => {
    getWebSocket()?.close();
  };
  return { send, close };
};
