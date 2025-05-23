import { Ref, forwardRef, useEffect } from 'react';

import { Switch, useEdificeClient } from '@edifice.io/react';
import { Editor, EditorRef } from '@edifice.io/react/editor';
import {
  IExternalLink,
  InternalLinkTabResult,
  MediaLibrary,
  MediaLibraryType,
} from '@edifice.io/react/multimedia';
import { WorkspaceElement } from '@edifice.io/client';
import { useTranslation } from 'react-i18next';

import clsx from 'clsx';
import { useLinkToolbar } from '~/hooks/useLinkToolbar';
import { useMediaLibrary } from '~/hooks/useMediaLibrary';
import { MediaProps } from '~/models/media';
import { NoteProps } from '~/models/notes';
import { EditionMode } from '../hooks/useNoteModal';
import { NoteColorSelect } from './NoteColorSelect';
import { NoteMedia } from './NoteMedia';
import { NoteToolbar } from './NoteToolbar';

export const NoteContent = forwardRef(
  (
    {
      media,
      editionMode,
      dataNote,
      isMediaVisible,
      setColorValue,
      setMedia,
      setIsMediaVisible,
    }: {
      media: MediaProps | null;
      editionMode: EditionMode;
      dataNote?: NoteProps;
      isMediaVisible: boolean;
      setColorValue: (value: string[]) => void;
      setMedia: (value: MediaProps | null) => void;
      setIsMediaVisible: (value: boolean) => void;
    },
    ref: Ref<EditorRef>,
  ) => {
    const { t } = useTranslation();
    const { appCode } = useEdificeClient();

    const {
      ref: mediaLibraryRef,
      libraryMedia,
      ...mediaLibraryModalHandlers
    } = useMediaLibrary();

    const { onEdit, onOpen } = useLinkToolbar(null, mediaLibraryRef);

    const isReadMode = editionMode === 'read';

    const handleClickMedia = (type: MediaLibraryType) => {
      setMedia({ ...(media as MediaProps), type });
      mediaLibraryRef.current?.show(type);
    };

    useEffect(() => {
      if (libraryMedia) {
        if (libraryMedia.url) {
          const medialIb = libraryMedia as IExternalLink;
          setMedia({
            type: (media as MediaProps).type,
            id: '',
            application: '',
            name: medialIb?.text || '',
            url: medialIb?.url,
            targetUrl: medialIb.target,
          });
        } else if (libraryMedia.resources) {
          const medialIb = libraryMedia as InternalLinkTabResult;
          setMedia({
            type: (media as MediaProps).type,
            id: medialIb?.resources?.[0]?.assetId ?? '',
            name: medialIb?.resources?.[0]?.name || '',
            application: medialIb?.resources?.[0]?.application || '',
            url:
              medialIb.resources?.[0]?.path ??
              `/${medialIb.resources?.[0]?.application}#/view/${medialIb.resources?.[0]?.assetId}`,
            targetUrl: medialIb.target,
          });
        } else {
          const medialIb = libraryMedia as WorkspaceElement;
          setMedia({
            type: (media as MediaProps).type,
            id: medialIb?._id || '',
            name: medialIb?.name || '',
            application: '',
            url: medialIb?._id
              ? `/workspace/document/${medialIb?._id}`
              : (libraryMedia as string),
          });
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [libraryMedia]);

    const renderEditStyle = { border: '1px solid #f2f2f2' };

    const renderEdit = !isReadMode && (
      <div className="multimedia-section my-24" style={renderEditStyle}>
        <div className="toolbar-media py-48 px-12">
          <NoteToolbar handleClickMedia={handleClickMedia} />
          {t('collaborativewall.add.media', { ns: appCode })}
        </div>
      </div>
    );

    const renderReadStyle = { border: isReadMode ? '' : '1px solid #f2f2f2' };
    const renderReadClass = clsx('multimedia-section', {
      'mb-24': isReadMode,
      'my-24': !isReadMode,
    });
    const renderRead = (media: MediaProps) => (
      <div className={renderReadClass} style={renderReadStyle}>
        <NoteMedia
          media={media}
          modalNote={true}
          setMedia={setMedia}
          readonly={isReadMode}
          onEdit={onEdit}
          onOpen={onOpen}
        />
      </div>
    );

    return (
      <>
        {!isReadMode && (
          <>
            <NoteColorSelect
              dataNote={dataNote}
              setColorValue={setColorValue}
            />
            <div className="d-flex mt-8">
              <Switch
                onChange={() => setIsMediaVisible(!isMediaVisible)}
                checked={isMediaVisible}
              />
              <div className="ms-12">
                {t('collaborativewall.show.media', { ns: appCode })}
              </div>
            </div>
          </>
        )}
        {isMediaVisible && (!media?.url ? renderEdit : renderRead(media))}
        <div className="mt-24">
          <Editor
            ref={ref}
            content={dataNote?.content || ''}
            mode={isReadMode ? 'read' : 'edit'}
            toolbar="full"
            variant={isReadMode ? 'ghost' : 'outline'}
            placeholder={t('collaborativewall.modal.note.content.placeholder', {
              ns: appCode,
            })}
            cantooParam="simplify"
          />
        </div>
        <MediaLibrary
          appCode={appCode}
          ref={mediaLibraryRef}
          multiple={false}
          visibility="protected"
          {...mediaLibraryModalHandlers}
        />
      </>
    );
  },
);
