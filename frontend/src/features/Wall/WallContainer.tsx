import { LoadingScreen } from "@edifice-ui/react";
import { ReactNode, Suspense, lazy } from "react";
import { useShallow } from "zustand/react/shallow";
import { useWebsocketStore } from "~/store/websocket/store";

const WebsocketModal = lazy(
  async () => await import("~/features/Websocket/components/WebsocketModal"),
);

export const CollaborativeWallContainer = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { openSocketModal, setOpenSocketModal } = useWebsocketStore(
    useShallow((state) => ({
      openSocketModal: state.openSocketModal,
      setOpenSocketModal: state.setOpenSocketModal,
    })),
  );

  return (
    <>
      <div className="collaborativewall-container vh-100">{children}</div>

      <Suspense fallback={<LoadingScreen position={false} />}>
        {openSocketModal ? (
          <WebsocketModal
            isOpen={openSocketModal}
            onClose={() => setOpenSocketModal(false)}
          />
        ) : null}
      </Suspense>
    </>
  );
};
