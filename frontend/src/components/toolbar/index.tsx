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
import { Toolbar, ToolbarItem, useOdeClient } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { wallConfig, zoomConfig } from "~/config/init-config";
import { useHistory } from "~/features/history/hooks/useHistory";
import { useAccess } from "~/hooks/useAccess";
import { useWhiteboard } from "~/store";

export const ToolbarWrapper = ({
  zoomIn,
  zoomOut,
  setTransform,
}: {
  zoomIn: (value: number) => void;
  zoomOut: (value: number) => void;
  setTransform: any;
}) => {
  const {
    canMoveBoard,
    canMoveNote,
    zoom,
    setCanMoveBoard,
    setCanMoveNote,
    toggleCanMoveBoard,
    toggleCanMoveNote,
    setOpenCreateModal,
  } = useWhiteboard(
    useShallow((state) => ({
      canMoveBoard: state.canMoveBoard,
      canMoveNote: state.canMoveNote,
      zoom: state.zoom,
      setCanMoveBoard: state.setCanMoveBoard,
      setCanMoveNote: state.setCanMoveNote,
      toggleCanMoveBoard: state.toggleCanMoveBoard,
      toggleCanMoveNote: state.toggleCanMoveNote,
      setOpenCreateModal: state.setOpenCreateModal,
    })),
  );

  const { t } = useTranslation();
  const { appCode } = useOdeClient();

  const offsetX = (window.innerWidth - wallConfig.WIDTH_WALL) / 2;
  const offsetY = (window.innerHeight - wallConfig.HEIGHT_WALL) / 2;

  const { canUndo, canRedo, handleUndo, handleRedo } = useHistory();

  const { allRolesButRead } = useAccess();

  const showIf = (truthy: boolean) => (truthy ? "show" : "hide");

  const WhiteboardItems: ToolbarItem[] = [
    {
      type: "icon",
      name: "undo",
      props: {
        icon: <Undo />,
        "aria-label": t("collaborativewall.toolbar.undo"),
        color: "tertiary",
        disabled: !canUndo,
        onClick: handleUndo,
      },
      tooltip: t("collaborativewall.toolbar.undo", { ns: appCode }),
      visibility: showIf(allRolesButRead),
    },
    {
      type: "icon",
      name: "redo",
      props: {
        icon: <Redo />,
        "aria-label": t("collaborativewall.toolbar.redo"),
        color: "tertiary",
        disabled: !canRedo,
        onClick: handleRedo,
      },
      tooltip: t("collaborativewall.toolbar.redo", { ns: appCode }),
      visibility: showIf(allRolesButRead),
    },
    {
      type: "divider",
      name: "div-1",
      visibility: showIf(allRolesButRead),
    },
    {
      type: "icon",
      name: "pointerDefault",
      props: {
        icon: <PointerDefault />,
        "aria-label": t("collaborativewall.toolbar.movenote"),
        color: "tertiary",
        className: canMoveNote ? "is-selected" : "",
        // disabled: !canMoveNote,
        onClick: () => {
          toggleCanMoveNote();
          setCanMoveBoard(false);
        },
      },
      tooltip: t("collaborativewall.toolbar.movenote", { ns: appCode }),
      visibility: showIf(allRolesButRead),
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
      tooltip: t("collaborativewall.toolbar.movewhiteboard", { ns: appCode }),
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
      tooltip: t("collaborativewall.toolbar.center", { ns: appCode }),
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
      tooltip: t("collaborativewall.toolbar.zoomout", { ns: appCode }),
    },
    {
      type: "button",
      name: "zoom",
      props: {
        "aria-label": t("collaborativewall.toolbar.zoom"),
        color: "tertiary",
        className: "p-0 bg-transparent",
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
      tooltip: t("collaborativewall.toolbar.zoomin", { ns: appCode }),
    },
    {
      type: "divider",
      name: "div-3",
      visibility: showIf(allRolesButRead),
    },
    {
      type: "icon",
      name: "create",
      props: {
        "aria-label": t("collaborativewall.toolbar.create"),
        icon: <Plus />,
        variant: "filled",
        color: "secondary",
        onClick: () => setOpenCreateModal(true),
      },
      tooltip: t("collaborativewall.toolbar.create", { ns: appCode }),
      visibility: showIf(allRolesButRead),
    },
  ];

  return <Toolbar items={WhiteboardItems} />;
};
