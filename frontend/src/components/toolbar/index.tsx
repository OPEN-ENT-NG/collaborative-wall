import { useMemo } from "react";

import {
  Plus,
  PointerDefault,
  PointerHand,
  Redo,
  Undo,
  ZoomIn,
  ZoomOut,
} from "@edifice-ui/icons";
import { Toolbar, ToolbarItem } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { useWhiteboard } from "../../hooks/useWhiteBoard";
import { zoomConfig } from "~/config/init-config";

export const ToolbarWrapper = ({
  zoomIn,
  zoomOut,
  resetTransform,
  newZoom,
}: {
  zoomIn: any;
  zoomOut: any;
  resetTransform: any;
  newZoom: any;
}) => {
  const {
    canMoveBoard,
    canMoveNote,
    createNote,
    setCanMoveBoard,
    setCanMoveNote,
    toggleCanMoveBoard,
    toggleCanMoveNote,
  } = useWhiteboard(
    useShallow((state: any) => ({
      canMoveBoard: state.canMoveBoard,
      canMoveNote: state.canMoveNote,
      createNote: state.createNote,
      setCanMoveBoard: state.setCanMoveBoard,
      setCanMoveNote: state.setCanMoveNote,
      toggleCanMoveBoard: state.toggleCanMoveBoard,
      toggleCanMoveNote: state.toggleCanMoveNote,
    })),
  );

  const { t } = useTranslation();

  const WhiteboardItems: ToolbarItem[] = useMemo(() => {
    return [
      {
        type: "icon",
        name: "undo",
        props: {
          icon: <Undo />,
          "aria-label": t("undo"),
          color: "tertiary",
          onClick: () => console.log("undo"),
        },
        tooltip: {
          message: t("undo"),
          position: "top",
        },
      },
      {
        type: "icon",
        name: "redo",
        props: {
          icon: <Redo />,
          "aria-label": t("undo"),
          color: "tertiary",
          onClick: () => console.log("redo"),
        },
        tooltip: {
          message: t("redo"),
          position: "top",
        },
      },
      {
        type: "divider",
        name: "div-1",
      },
      {
        type: "icon",
        name: "pointerDefault",
        props: {
          icon: <PointerDefault />,
          "aria-label": t("move note"),
          color: "tertiary",
          className: canMoveNote ? "is-selected" : "",
          onClick: () => {
            toggleCanMoveNote();
            setCanMoveBoard(false);
          },
        },
        tooltip: {
          message: t("move note"),
          position: "top",
        },
      },
      {
        type: "icon",
        name: "pointerHand",
        props: {
          icon: <PointerHand />,
          "aria-label": t("move whiteboard"),
          color: "tertiary",
          className: canMoveBoard ? "is-selected" : "",
          onClick: () => {
            toggleCanMoveBoard();
            setCanMoveNote(false);
          },
        },
        tooltip: {
          message: t("move whiteboard"),
          position: "top",
        },
      },
      {
        type: "divider",
        name: "div-2",
      },
      {
        type: "icon",
        name: "zoomOut",
        props: {
          icon: <ZoomOut />,
          "aria-label": t("zoom out"),
          color: "tertiary",
          onClick: () => zoomOut(zoomConfig.SCALE_ZOOM),
        },
        tooltip: {
          message: t("zoom out"),
          position: "top",
        },
      },
      {
        type: "button",
        name: "center",
        props: {
          "aria-label": t("center"),
          color: "tertiary",
          children: (newZoom * 100).toFixed(0) + "%",
          onClick: () => resetTransform(zoomConfig.DEFAULT_ZOOM),
        },
        tooltip: {
          message: t("center"),
          position: "top",
        },
      },
      {
        type: "icon",
        name: "zoomIn",
        props: {
          icon: <ZoomIn />,
          "aria-label": t("zoom in"),
          color: "tertiary",
          onClick: () => zoomIn(zoomConfig.SCALE_ZOOM),
        },
        tooltip: {
          message: t("zoom in"),
          position: "top",
        },
      },
      {
        type: "divider",
        name: "div-3",
      },
      {
        type: "icon",
        name: "create",
        props: {
          "aria-label": t("create"),
          leftIcon: <Plus />,
          variant: "filled",
          color: "secondary",
          onClick: createNote,
        },
        tooltip: {
          message: t("create"),
          position: "top",
        },
      },
    ];
  }, [t, canMoveBoard, canMoveNote, newZoom]);

  return <Toolbar className="p-8" items={WhiteboardItems} />;
};
