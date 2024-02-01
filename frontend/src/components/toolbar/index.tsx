import { useMemo } from "react";

import {
  Center,
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

import { Action, State, useWhiteboard } from "../../hooks/useWhiteBoard";
import { zoomConfig } from "~/config/init-config";

export const ToolbarWrapper = ({
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
    zoom,
    setCanMoveBoard,
    setCanMoveNote,
    toggleCanMoveBoard,
    toggleCanMoveNote,
  } = useWhiteboard(
    useShallow((state: State & Action) => ({
      canMoveBoard: state.canMoveBoard,
      canMoveNote: state.canMoveNote,
      zoom: state.zoom,
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
          "aria-label": t("collaborativewall.toolbar.undo"),
          color: "tertiary",
          onClick: () => console.log("undo"),
        },
        tooltip: {
          message: t("collaborativewall.toolbar.undo"),
          position: "top",
        },
      },
      {
        type: "icon",
        name: "redo",
        props: {
          icon: <Redo />,
          "aria-label": t("collaborativewall.toolbar.redo"),
          color: "tertiary",
          onClick: () => console.log("redo"),
        },
        tooltip: {
          message: t("collaborativewall.toolbar.redo"),
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
          "aria-label": t("collaborativewall.toolbar.movenote"),
          color: "tertiary",
          className: canMoveNote ? "is-selected" : "",
          onClick: () => {
            toggleCanMoveNote();
            setCanMoveBoard(false);
          },
        },
        tooltip: {
          message: t("collaborativewall.toolbar.movenote"),
          position: "top",
        },
      },
      {
        type: "icon",
        name: "pointerHand",
        props: {
          icon: <PointerHand />,
          "aria-label": t("collaborativewall.toolbar.movewhiteboard"),
          color: "tertiary",
          className: canMoveBoard ? "is-selected" : "",
          onClick: () => {
            toggleCanMoveBoard();
            setCanMoveNote(false);
          },
        },
        tooltip: {
          message: t("collaborativewall.toolbar.movewhiteboard"),
          position: "top",
        },
      },
      {
        type: "divider",
        name: "div-2",
      },
      {
        type: "icon",
        name: "center",
        props: {
          icon: <Center />,
          "aria-label": t("collaborativewall.toolbar.center"),
          color: "tertiary",
          onClick: () => resetTransform(),
        },
        tooltip: {
          message: t("collaborativewall.toolbar.center"),
          position: "top",
        },
      },
      {
        type: "icon",
        name: "zoomOut",
        props: {
          icon: <ZoomOut />,
          "aria-label": t("collaborativewall.toolbar.zoomout"),
          color: "tertiary",
          onClick: () => zoomOut(zoomConfig.SCALE_ZOOM),
        },
        tooltip: {
          message: t("collaborativewall.toolbar.zoomout"),
          position: "top",
        },
      },
      {
        type: "button",
        name: "zoom",
        props: {
          "aria-label": t("collaborativewall.toolbar.zoom"),
          color: "tertiary",
          children: (zoom * 100).toFixed(0) + "%",
          onClick: () => resetTransform(),
        },
      },
      {
        type: "icon",
        name: "zoomIn",
        props: {
          icon: <ZoomIn />,
          "aria-label": t("collaborativewall.toolbar.zoomin"),
          color: "tertiary",
          onClick: () => zoomIn(zoomConfig.SCALE_ZOOM),
        },
        tooltip: {
          message: t("collaborativewall.toolbar.zoomin"),
          position: "top",
        },
      },
      {
        type: "divider",
        name: "div-3",
      },
      /* {
        type: "icon",
        name: "create",
        props: {
          "aria-label": t("collaborativewall.toolbar.create"),
          leftIcon: <Plus />,
          variant: "filled",
          color: "secondary",
          onClick: createNote,
        },
        tooltip: {
          message: t("collaborativewall.toolbar.create"),
          position: "top",
        },
      }, */
    ];
  }, [t, canMoveBoard, canMoveNote, zoom]);

  return <Toolbar className="p-8" items={WhiteboardItems} />;
};
