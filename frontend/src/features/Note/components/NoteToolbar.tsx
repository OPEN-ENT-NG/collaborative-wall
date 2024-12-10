import { RefAttributes, useMemo } from 'react';

import {
  IconLandscape,
  IconLink,
  IconMic,
  IconPaperclip,
  IconRecordVideo,
} from '@edifice.io/react/icons';
import { useCantooEditor } from '@edifice-ui/editor';
import { IconButtonProps, Toolbar } from '@edifice-ui/react';
import { useTranslation } from 'react-i18next';
import { NoteCantoo } from './NoteCantoo.tsx';

export const NoteToolbar = ({
  handleClickMedia,
  toggleNoteCantooModal,
}: {
  handleClickMedia: (type: any) => void;
  toggleNoteCantooModal: () => void;
}) => {
  const { t } = useTranslation();
  const { isAvailable: canUseCantoo } = useCantooEditor(null);

  const toolbarItems: any[] = useMemo(() => {
    return [
      //--------------- IMAGE ---------------//
      {
        type: 'icon',
        props: {
          'icon': <IconLandscape />,
          'className': 'bg-green-200',
          'aria-label': t('tiptap.toolbar.picture'),
          'onClick': () => handleClickMedia('image'),
        },
        name: 'image',
        tooltip: t('tiptap.toolbar.picture'),
      },
      //--------------- VIDEO ---------------//
      {
        type: 'icon',
        props: {
          'icon': <IconRecordVideo />,
          'className': 'bg-purple-200',
          'aria-label': t('tiptap.toolbar.video'),
          'onClick': () => handleClickMedia('video'),
        },
        name: 'video',
        tooltip: t('tiptap.toolbar.video'),
      },
      //--------------- AUDIO ---------------//
      {
        type: 'icon',
        props: {
          'icon': <IconMic />,
          'className': 'bg-red-200',
          'aria-label': t('tiptap.toolbar.audio'),
          'onClick': () => handleClickMedia('audio'),
        },
        name: 'audio',
        tooltip: t('tiptap.toolbar.audio'),
      },
      //--------------- ATTACHMENT ---------------//
      {
        type: 'icon',
        props: {
          'icon': <IconPaperclip />,
          'className': 'bg-yellow-200',
          'aria-label': t('tiptap.toolbar.attachment'),
          'onClick': () => handleClickMedia('attachment'),
        },
        name: 'attachment',
        tooltip: t('tiptap.toolbar.attachment'),
      },
      //--------------- LINKER ---------------//
      {
        type: 'icon',
        props: {
          'icon': <IconLink />,
          'aria-label': t('tiptap.toolbar.linker'),
          'className': 'bg-blue-200',
          'onClick': () => handleClickMedia('hyperlink'),
        },
        name: 'linker',
        tooltip: t('tiptap.toolbar.linker'),
      },
      //--------------- CANTOO ---------------//
      {
        type: 'dropdown',
        props: {
          children: (
            triggerProps: JSX.IntrinsicAttributes &
              Omit<IconButtonProps, 'ref'> &
              RefAttributes<HTMLButtonElement>,
          ) => (
            <NoteCantoo
              triggerProps={triggerProps}
              openModal={toggleNoteCantooModal}
            />
          ),
        },
        name: 'cantoo',
        visibility: canUseCantoo ? 'show' : 'hide',
        tooltip: t('tiptap.toolbar.cantoo.choice'),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUseCantoo]);

  return (
    <Toolbar
      items={toolbarItems}
      variant="no-shadow"
      className="rounded-top px-16"
      ariaControls="editorContent"
    />
  );
};
