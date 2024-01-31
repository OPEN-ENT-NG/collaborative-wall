import {
  Plus,
  PointerDefault,
  PointerHand,
  Undo,
  ZoomIn,
  ZoomOut,
} from "@edifice-ui/icons";
import { useShallow } from "zustand/react/shallow";

import { useWhiteboard } from "../../hooks/useWhiteBoard";
import { zoomConfig } from "~/config/init-config";

export const Toolbar = ({
  zoomIn,
  zoomOut,
  resetTransform,
}: {
  zoomIn: any;
  zoomOut: any;
  resetTransform: any;
}) => {
  const {
    canMoveBoard,
    canMoveNote,
    createNote,
    resetZoom,
    setCanMoveBoard,
    setCanMoveNote,
    toggleCanMoveBoard,
    toggleCanMoveNote,
    zoom,
  } = useWhiteboard(
    useShallow((state: any) => ({
      canMoveBoard: state.canMoveBoard,
      canMoveNote: state.canMoveNote,
      createNote: state.createNote,
      resetZoom: state.resetZoom,
      setCanMoveBoard: state.setCanMoveBoard,
      setCanMoveNote: state.setCanMoveNote,
      toggleCanMoveBoard: state.toggleCanMoveBoard,
      toggleCanMoveNote: state.toggleCanMoveNote,
      toggleCanZoom: state.toggleCanZoom,
      zoom: state.zoom,
    })),
  );

  return (
    <div className="toolbar">
      <button onClick={() => resetTransform(zoomConfig.DEFAULT_ZOOM)}>
        Centrer
      </button>
      <button>
        <Undo />
      </button>
      <button
        style={{ backgroundColor: canMoveNote && "#E5F5FF" }}
        onClick={() => {
          toggleCanMoveNote();
          setCanMoveBoard(false);
        }}
      >
        <PointerDefault />
      </button>
      <button
        style={{ backgroundColor: canMoveBoard && "#E5F5FF" }}
        onClick={() => {
          toggleCanMoveBoard();
          setCanMoveNote(false);
        }}
      >
        <PointerHand />
      </button>
      <button onClick={() => zoomOut(zoomConfig.SCALE_ZOOM)}>
        <ZoomOut />
      </button>
      <button onClick={resetZoom}>{(zoom * 100).toFixed(0) + "%"}</button>
      <button onClick={() => zoomIn(zoomConfig.SCALE_ZOOM)}>
        <ZoomIn />
      </button>
      <button onClick={createNote}>
        <Plus />
      </button>
    </div>
  );
};
