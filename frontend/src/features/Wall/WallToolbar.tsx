import {
  Center,
  Plus,
  PointerHand,
  Redo,
  Undo,
  ZoomIn,
  ZoomOut,
} from "@edifice-ui/icons";
import { Toolbar, ToolbarItem, useOdeClient } from "@edifice-ui/react";
import { useHotkeys } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useReactFlow, useViewport } from "reactflow";
import { useShallow } from "zustand/react/shallow";
import { resetViewport, transitionDuration } from "~/config";

import { useHistory } from "~/features/History/hooks/useHistory";
import { useRightsStore, useWhiteboardStore } from "~/store";

export const CollaborativeWallToolbar = ({
  isMobile,
}: {
  isMobile: boolean;
}) => {
  const navigate = useNavigate();
  const showIf = (truthy: boolean) => (truthy ? "show" : "hide");
  const handleCreateClick = () => navigate("note");
  const allRolesButRead = useRightsStore((state) => state.allRolesButRead);

  const { appCode } = useOdeClient();
  const { t } = useTranslation();

  const { canMoveNote, toggleCanMoveNote } = useWhiteboardStore(
    useShallow((state) => ({
      canMoveNote: state.canMoveNote,
      toggleCanMoveNote: state.toggleCanMoveNote,
    })),
  );
  const { canUndo, canRedo, handleUndo, handleRedo } = useHistory();

  const { zoomIn, zoomOut, zoomTo, setViewport } = useReactFlow();
  const { zoom } = useViewport();
  /**
   * feat/WB2-1584: hot keys for undo/redo
   * useHotkeys accepts [[]] with a key and a function
   */
  useHotkeys([
    ["mod+Z", () => canUndo && handleUndo()],
    ["mod+shift+Z", () => canRedo && handleRedo()],
  ]);

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
      name: "pointerHand",
      props: {
        icon: <PointerHand />,
        "aria-label": t("collaborativewall.toolbar.movewhiteboard"),
        color: "tertiary",
        className: `${!canMoveNote ? "is-selected" : ""} move`,
        onClick: () => toggleCanMoveNote(),
      },
      tooltip: t("collaborativewall.toolbar.movewhiteboard", { ns: appCode }),
      visibility: showIf(allRolesButRead),
    },
    {
      type: "divider",
      name: "div-2",
      visibility: showIf(allRolesButRead),
    },
    {
      type: "icon",
      name: "center",
      props: {
        icon: <Center />,
        "aria-label": t("collaborativewall.toolbar.center"),
        color: "tertiary",
        onClick: () => setViewport(resetViewport, transitionDuration),
      },
      tooltip: t("collaborativewall.toolbar.center", { ns: appCode }),
    },
    {
      type: "icon",
      name: "zoomIn",
      props: {
        icon: <ZoomIn />,
        "aria-label": t("collaborativewall.toolbar.zoomin"),
        color: "tertiary",
        onClick: () => zoomIn(),
      },
      tooltip: t("collaborativewall.toolbar.zoomin", { ns: appCode }),
    },
    {
      type: "button",
      name: "zoom",
      props: {
        children: (zoom * 100).toFixed(0) + "%",
        className: "p-0 bg-transparent",
        onClick: () => zoomTo(1, transitionDuration),
      },
    },
    {
      type: "icon",
      name: "zoomOut",
      props: {
        icon: <ZoomOut />,
        "aria-label": t("collaborativewall.toolbar.zoomout"),
        color: "tertiary",
        onClick: () => zoomOut(),
      },
      tooltip: t("collaborativewall.toolbar.zoomout", { ns: appCode }),
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
        onClick: handleCreateClick,
      },
      tooltip: t("collaborativewall.toolbar.create", { ns: appCode }),
      visibility: showIf(allRolesButRead),
    },
  ];

  return !isMobile ? <Toolbar items={WhiteboardItems} /> : null;
};
