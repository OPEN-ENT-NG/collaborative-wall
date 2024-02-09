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

import { wallConfig, zoomConfig } from "~/config/init-config";
import { useCreateNote } from "~/services/queries";
import { useWhiteboard } from "~/store";

export const ToolbarWrapper = ({
  wallId,
  zoomIn,
  zoomOut,
  setTransform,
  canUpdate,
}: {
  wallId: ID;
  zoomIn: (value: number) => void;
  zoomOut: (value: number) => void;
  setTransform: any;
  canUpdate: boolean | undefined;
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
    useShallow((state) => ({
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

  const createNote = useCreateNote(wallId);

  const result = Math.random().toString(36).substring(2, 7);

  const offsetX = (window.innerWidth - wallConfig.WIDTH_WALL) / 2;
  const offsetY = (window.innerHeight - wallConfig.HEIGHT_WALL) / 2;

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
        onClick: () => setTransform(offsetX, offsetY, zoomConfig.DEFAULT_ZOOM),
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
        className: "zoom-out",
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
        onClick: () => setTransform(offsetX, offsetY, zoomConfig.DEFAULT_ZOOM),
      },
    },
    {
      type: "icon",
      name: "zoomIn",
      props: {
        icon: <ZoomIn />,
        className: "zoom-in",
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

  return <Toolbar items={WhiteboardItems} />;
};
