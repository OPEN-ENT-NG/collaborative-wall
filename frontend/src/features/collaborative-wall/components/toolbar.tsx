import { Center, Plus, PointerHand, Redo, Undo } from "@edifice-ui/icons";
import { Toolbar, ToolbarItem, useOdeClient } from "@edifice-ui/react";
import { useHotkeys } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useReactFlow } from "reactflow";
import { useShallow } from "zustand/react/shallow";

import { useHistory } from "~/features/history/hooks/use-history";
import { useWhiteboard } from "~/store";
import { useRightsStore } from "~/store/rights/store";

export const ToolbarWrapper = ({ isMobile }: { isMobile: boolean }) => {
  const navigate = useNavigate();
  const showIf = (truthy: boolean) => (truthy ? "show" : "hide");
  const reactFlow = useReactFlow();
  const handleCreateClick = () => navigate("note");

  const { appCode } = useOdeClient();

  const { canMoveNote, toggleCanMoveNote } = useWhiteboard(
    useShallow((state) => ({
      canMoveNote: state.canMoveNote,
      toggleCanMoveNote: state.toggleCanMoveNote,
    })),
  );

  const allRolesButRead = useRightsStore((state) => state.allRolesButRead);

  const { t } = useTranslation();

  const { canUndo, canRedo, handleUndo, handleRedo } = useHistory();

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
        onClick: () =>
          reactFlow.setViewport({
            x: 0,
            y: 0,
            zoom: 1,
          }),
      },
      tooltip: t("collaborativewall.toolbar.center", { ns: appCode }),
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
