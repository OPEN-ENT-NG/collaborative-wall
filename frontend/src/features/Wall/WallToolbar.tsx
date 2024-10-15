import { Center, Plus, PointerHand, Redo, Undo } from '@edifice-ui/icons';
import { Toolbar, ToolbarItem, useOdeClient } from '@edifice-ui/react';
import { useHotkeys } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useReactFlow } from 'reactflow';
import { useShallow } from 'zustand/react/shallow';
import { resetViewport, transitionDuration } from '~/config';

import { useHistory } from '~/features/History/hooks/useHistory';
import { useAccessStore } from '~/hooks/useAccessStore';
import { useWhiteboardStore } from '~/store';

export const CollaborativeWallToolbar = () => {
  const navigate = useNavigate();
  const showIf = (truthy: boolean) => (truthy ? 'show' : 'hide');
  const handleCreateClick = () => navigate('note');

  const { setViewport } = useReactFlow();
  const { userRights } = useAccessStore();
  const { appCode } = useOdeClient();
  const { t } = useTranslation();

  const { isMobile, canMoveNote, toggleCanMoveNote } = useWhiteboardStore(
    useShallow((state) => ({
      canMoveNote: state.canMoveNote,
      isMobile: state.isMobile,
      toggleCanMoveNote: state.toggleCanMoveNote,
    })),
  );
  const { canUndo, canRedo, handleUndo, handleRedo } = useHistory();

  /**
   * feat/WB2-1584: hot keys for undo/redo
   * useHotkeys accepts [[]] with a key and a function
   */
  useHotkeys([
    ['mod+Z', () => canUndo && handleUndo()],
    ['mod+shift+Z', () => canRedo && handleRedo()],
  ]);

  const visibility =
    userRights.contrib || userRights.manager || userRights.creator;

  const WhiteboardItems: ToolbarItem[] = [
    {
      type: 'icon',
      name: 'undo',
      props: {
        'icon': <Undo />,
        'aria-label': t('collaborativewall.toolbar.undo'),
        'color': 'tertiary',
        'disabled': !canUndo,
        'onClick': handleUndo,
      },
      tooltip: t('collaborativewall.toolbar.undo', { ns: appCode }),
      visibility: showIf(visibility),
    },
    {
      type: 'icon',
      name: 'redo',
      props: {
        'icon': <Redo />,
        'aria-label': t('collaborativewall.toolbar.redo'),
        'color': 'tertiary',
        'disabled': !canRedo,
        'onClick': handleRedo,
      },
      tooltip: t('collaborativewall.toolbar.redo', { ns: appCode }),
      visibility: showIf(visibility),
    },
    {
      type: 'divider',
      name: 'div-1',
      visibility: showIf(visibility),
    },
    {
      type: 'icon',
      name: 'pointerHand',
      props: {
        'icon': <PointerHand />,
        'aria-label': t('collaborativewall.toolbar.movewhiteboard'),
        'color': 'tertiary',
        'className': `${!canMoveNote ? 'is-selected' : ''} move`,
        'onClick': () => toggleCanMoveNote(),
      },
      tooltip: t('collaborativewall.toolbar.movewhiteboard', { ns: appCode }),
      visibility: showIf(visibility),
    },
    {
      type: 'divider',
      name: 'div-2',
      visibility: showIf(visibility),
    },
    {
      type: 'icon',
      name: 'center',
      props: {
        'icon': <Center />,
        'aria-label': t('collaborativewall.toolbar.center'),
        'color': 'tertiary',
        'onClick': () => setViewport(resetViewport, transitionDuration),
      },
      tooltip: t('collaborativewall.toolbar.center', { ns: appCode }),
    },
    {
      type: 'divider',
      name: 'div-3',
      visibility: showIf(visibility),
    },
    {
      type: 'icon',
      name: 'create',
      props: {
        'aria-label': t('collaborativewall.toolbar.create'),
        'icon': <Plus />,
        'variant': 'filled',
        'color': 'secondary',
        'onClick': handleCreateClick,
      },
      tooltip: t('collaborativewall.toolbar.create', { ns: appCode }),
      visibility: showIf(visibility),
    },
  ];

  return !isMobile ? <Toolbar items={WhiteboardItems} /> : null;
};
