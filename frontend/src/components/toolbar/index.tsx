import { Plus } from "@edifice-ui/icons";
import { useShallow } from "zustand/react/shallow";

import { useWhiteboard } from "../../hooks/useWhiteBoard";

export const Toolbar = () => {
  const {
    canMoveBoard,
    canMoveNote,
    createNote,
    resetOffset,
    resetZoom,
    setCanMoveBoard,
    setCanMoveNote,
    toggleCanMoveBoard,
    toggleCanMoveNote,
    zoom,
    zoomIn,
    zoomOut,
  } = useWhiteboard(
    useShallow((state: any) => ({
      canMoveBoard: state.canMoveBoard,
      canMoveNote: state.canMoveNote,
      createNote: state.createNote,
      resetOffset: state.resetOffset,
      resetZoom: state.resetZoom,
      setCanMoveBoard: state.setCanMoveBoard,
      setCanMoveNote: state.setCanMoveNote,
      toggleCanMoveBoard: state.toggleCanMoveBoard,
      toggleCanMoveNote: state.toggleCanMoveNote,
      toggleCanZoom: state.toggleCanZoom,
      zoom: state.zoom,
      zoomIn: state.zoomIn,
      zoomOut: state.zoomOut,
    })),
  );

  return (
    <div className="toolbar">
      <button onClick={resetOffset}>Centrer</button>
      <button>
        <Plus />
      </button>
      <button
        style={{ backgroundColor: canMoveNote && "#E5F5FF" }}
        onClick={() => {
          toggleCanMoveNote();
          setCanMoveBoard(false);
        }}
      >
        <Plus />
      </button>
      <button
        style={{ backgroundColor: canMoveBoard && "#E5F5FF" }}
        onClick={() => {
          toggleCanMoveBoard();
          setCanMoveNote(false);
        }}
      >
        <Plus />
      </button>
      <button onClick={zoomOut}>
        <Plus />
      </button>
      <button onClick={resetZoom}>{(zoom * 100).toFixed(0) + "%"}</button>
      <button onClick={zoomIn}>
        <Plus />
      </button>
      <button onClick={createNote}>
        <Plus />
      </button>
    </div>
  );
};
