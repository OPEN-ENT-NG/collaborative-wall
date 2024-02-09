import {
  Center,
  Plus,
  PointerDefault,
  PointerHand,
  Redo,
  Undo,
  ZoomIn,
  ZoomOut,
} from "@edifice-ui/icons";
import { Toolbar, ToolbarItem } from "@edifice-ui/react";
import { ID } from "edifice-ts-client";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { zoomConfig } from "~/config/init-config";
import { useCreateNote } from "~/services/queries";
import { useWhiteboard } from "~/store";

export const ToolbarWrapper = ({
  wallId,
  zoomIn,
  zoomOut,
  setTransform,
}: {
  wallId: ID;
  zoomIn: (value: number) => void;
  zoomOut: (value: number) => void;
  setTransform: any;
}) => {
  const {
    canMoveBoard,
    canMoveNote,
    zoom,
    resetZoom,
    setCanMoveBoard,
    setCanMoveNote,
    toggleCanMoveBoard,
    toggleCanMoveNote,
  } = useWhiteboard(
    useShallow((state) => ({
      canMoveBoard: state.canMoveBoard,
      canMoveNote: state.canMoveNote,
      zoom: state.zoom,
      resetZoom: state.resetZoom,
      setCanMoveBoard: state.setCanMoveBoard,
      setCanMoveNote: state.setCanMoveNote,
      toggleCanMoveBoard: state.toggleCanMoveBoard,
      toggleCanMoveNote: state.toggleCanMoveNote,
      toggleCanZoom: state.toggleCanZoom,
    })),
  );

  const { t } = useTranslation();

  const createNote = useCreateNote(wallId);

  const result = Math.random().toString(36).substring(2, 7);

  const WhiteboardItems: ToolbarItem[] = [
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
      {
        type: "icon",
        name: "pointerDefault",
        props: {
          icon: <PointerDefault />,
          "aria-label": t("collaborativewall.toolbar.movenote"),
          color: "tertiary",
          className: canMoveNote ? "is-selected" : "",
          disabled: !canUpdate,
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
      {
        type: "icon",
        name: "center",
        props: {
          icon: <Center />,
          "aria-label": t("collaborativewall.toolbar.center"),
          color: "tertiary",
          onClick: () => setTransform(0, 0, zoomConfig.DEFAULT_ZOOM),
        },
        tooltip: {
          message: t("collaborativewall.toolbar.center"),
          position: "top",
        },
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
      {
        type: "button",
        name: "zoom",
        props: {
          "aria-label": t("collaborativewall.toolbar.zoom"),
          color: "tertiary",
          children: (zoom * 100).toFixed(0) + "%",
          onClick: () => setTransform(0, 0, zoomConfig.DEFAULT_ZOOM),
        },
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
    {
      type: "icon",
      name: "create",
      props: {
        "aria-label": t("collaborativewall.toolbar.create"),
        icon: <Plus />,
        variant: "filled",
        color: "secondary",
        onClick: () =>
          createNote.mutate({
            color: ["#F5F6CE", "#F2F5A9"],
            content: result,
            idwall: wallId,
            x: 10,
            y: 10,
          } as any),
      },
      tooltip: {
        message: t("collaborativewall.toolbar.create"),
        position: "top",
      },
    },
  ];

  return <Toolbar className="p-8" items={WhiteboardItems} />;
};
