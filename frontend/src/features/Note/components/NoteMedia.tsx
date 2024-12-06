import {
  AppIcon,
  Attachment,
  IconButton,
  Image,
  Toolbar,
  ToolbarItem,
  useEdificeClient,
  useEdificeIcons,
} from '@edifice.io/react';
import {
  IconDelete,
  IconDownload,
  IconEdit,
  IconExternalLink,
  IconGlobe,
} from '@edifice.io/react/icons';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';

import { MediaProps } from '~/models/media';
import { useWhiteboardStore } from '~/store';

export interface NoteMediaProps {
  media: MediaProps;
  modalNote?: boolean;
  setMedia?: (value: MediaProps | null) => void;
  readonly?: boolean;
  onEdit?: (attrs: any) => void;
  onOpen?: (attrs: any) => void;
}

export const NoteMedia = ({
  media,
  modalNote = false,
  setMedia,
  readonly = true,
  onEdit,
  onOpen,
}: NoteMediaProps) => {
  const { t } = useTranslation();
  const { appCode } = useEdificeClient();
  const { canMoveNote } = useWhiteboardStore(
    useShallow((state) => ({
      canMoveNote: state.canMoveNote,
    })),
  );

  const mediaClasses = clsx({
    'media-center': !modalNote,
    'd-block': !modalNote,
    'px-64': modalNote,
    'py-32': modalNote,
  });

  const { getIconCode } = useEdificeIcons();

  const hyperlinkCode = getIconCode(media.application) ?? '';

  const LinkItems: ToolbarItem[] = [
    {
      type: 'icon',
      name: 'modify',
      props: {
        'icon': <IconEdit />,
        'aria-label': t('edit'),
        'color': 'tertiary',
        'onClick': () => {
          if (media.application) {
            onEdit?.({
              'target': media.targetUrl,
              'data-id': media.id,
              'data-app-prefix': media.application,
            });
          } else {
            onEdit?.({
              href: media.url,
              target: media.targetUrl,
              name: media.name,
            });
          }
        },
      },
      tooltip: t('edit'),
    },
    {
      type: 'icon',
      name: 'open',
      props: {
        'icon': <IconExternalLink />,
        'aria-label': t('collaborativewall.toolbar.open'),
        'color': 'tertiary',
        'onClick': () =>
          onOpen?.({
            href: media.url,
            target: '_blank',
          }),
      },
      tooltip: t('collaborativewall.toolbar.open', { ns: appCode }),
    },
    {
      type: 'icon',
      name: 'delete',
      props: {
        'icon': <IconDelete />,
        'aria-label': t('collaborativewall.toolbar.delete'),
        'color': 'danger',
        'onClick': () => setMedia?.(null),
      },
      tooltip: t('collaborativewall.toolbar.delete', { ns: appCode }),
    },
  ];

  const noteMediaStyle = {
    position: 'relative',
    width: '100%',
  } as React.CSSProperties;

  const noteMediaIconStyle = { zIndex: '1' };
  const imageMediaStyle = {
    borderRadius: '8px',
    maxHeight: '350px',
  };

  const audioClassname = clsx(`media-center ${mediaClasses}`, {
    'my-16': !modalNote,
  });

  const audioStyle = { zIndex: canMoveNote ? '1' : '0', marginBottom: '-8px' };
  const videoStyle = {
    marginBottom: '-8px',
    zIndex: canMoveNote ? '1' : '0',
  };
  const iframeStyle = {
    height: modalNote ? '350px' : '',
    zIndex: canMoveNote ? '1' : '0',
  };
  const hyperlinkStyle = {
    height: modalNote ? '200px' : '120px',
    border: !modalNote ? 'solid 1px #E4E4E4' : '',
    borderRadius: !modalNote ? '8px' : '16px',
  };
  const urlStyle = {
    maxWidth: modalNote ? '219px' : '113px',
    borderRadius: modalNote ? '0px 16px' : '0px 8px',
  };
  const urlTextStyle = { color: 'white', display: 'block' };
  const iconGlobeStyle = {
    width: modalNote ? '80' : '40',
    height: modalNote ? '80' : '40',
  };

  switch (media.type) {
    case 'image':
      return (
        <div style={noteMediaStyle}>
          {!readonly && (
            <IconButton
              className="delete-button mt-8 me-8"
              icon={<IconDelete />}
              variant="outline"
              color="danger"
              style={noteMediaIconStyle}
              onClick={() => setMedia?.(null)}
            />
          )}
          <Image
            src={media.url}
            alt={media.type}
            width="100%"
            objectFit={modalNote ? 'contain' : 'cover'}
            ratio="16"
            style={imageMediaStyle}
          />
        </div>
      );
    case 'audio':
      return (
        <div className={audioClassname}>
          <audio
            src={media.url}
            className="media-audio"
            controls
            data-document-id={media.id}
            style={audioStyle}
          >
            <track default kind="captions" srcLang="fr" src=""></track>
          </audio>
          {!readonly && (
            <IconButton
              className="ms-8"
              icon={<IconDelete />}
              variant="outline"
              color="danger"
              onClick={() => setMedia?.(null)}
            />
          )}
        </div>
      );
    case 'attachment':
      return (
        <div className={`${mediaClasses} ${modalNote ? '' : 'my-16'}`}>
          <Attachment
            name={media.name}
            options={
              modalNote ? (
                <>
                  <a href={media.url} download>
                    <IconButton
                      icon={<IconDownload />}
                      color="tertiary"
                      type="button"
                      variant="ghost"
                      aria-label={t('download')}
                    />
                  </a>
                  {!readonly && (
                    <IconButton
                      icon={<IconDelete />}
                      variant="ghost"
                      color="danger"
                      aria-label={t('remove')}
                      onClick={() => setMedia?.(null)}
                    />
                  )}
                </>
              ) : undefined
            }
          ></Attachment>
        </div>
      );
    case 'video':
      return (
        <div style={{ position: 'relative' }}>
          {!readonly && (
            <IconButton
              className="delete-button mt-8 me-8"
              icon={<IconDelete />}
              variant="outline"
              color="danger"
              onClick={() => setMedia?.(null)}
            />
          )}
          {!media.id ? (
            <iframe
              src={media.url}
              title={media.name}
              className="media-video"
              style={iframeStyle}
            />
          ) : (
            <video
              src={media.url}
              data-document-id={media.id}
              controls
              className="media-video"
              style={videoStyle}
            >
              <track default kind="captions" srcLang="fr" src=""></track>
            </video>
          )}
        </div>
      );
    case 'hyperlink':
      return (
        <div
          className={`media-hyperlink ${media.application ? `bg-light-${hyperlinkCode}` : 'bg-blue-200'}`}
          style={hyperlinkStyle}
        >
          {!readonly && (
            <Toolbar className="delete-button mt-8 me-8" items={LinkItems} />
          )}
          <a
            href={media.url}
            target={media.targetUrl}
            style={{ width: '100%' }}
          >
            <div className="application-background">
              {media.application ? (
                <AppIcon
                  app={media.application}
                  size={modalNote ? '80' : '40'}
                />
              ) : (
                <IconGlobe className="text-blue" style={iconGlobeStyle} />
              )}
            </div>
            <div className="url-placement" style={urlStyle}>
              <div style={urlTextStyle} className="text-truncate small">
                {media.name ?? media.url}
              </div>
            </div>
          </a>
        </div>
      );
    default:
      break;
  }
};
