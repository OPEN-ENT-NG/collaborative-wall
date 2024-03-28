import { Delete, Download, Edit, ExternalLink } from "@edifice-ui/icons";
import {
  AppIcon,
  Attachment,
  IconButton,
  Image,
  Toolbar,
  ToolbarItem,
  useOdeClient,
} from "@edifice-ui/react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { NoteMedia } from "~/models/noteMedia";
import { useWhiteboard } from "~/store";

export interface ShowMediaTypeProps {
  media: NoteMedia;
  modalNote?: boolean;
  setMedia?: (value: NoteMedia | null) => void;
  readonly?: boolean;
  onEdit?: (attrs: any) => void;
  onOpen?: (attrs: any) => void;
}

export const ShowMediaType = ({
  media,
  modalNote = false,
  setMedia,
  readonly = true,
  onEdit,
  onOpen,
}: ShowMediaTypeProps) => {
  const { t } = useTranslation();

  const { appCode } = useOdeClient();
  const { canMoveNote } = useWhiteboard(
    useShallow((state) => ({
      canMoveNote: state.canMoveNote,
    })),
  );

  const mediaClasses = clsx({
    "media-center": !modalNote,
    "d-block": !modalNote,
    "px-64": modalNote,
    "py-32": modalNote,
  });

  const LinkItems: ToolbarItem[] = [
    {
      type: "icon",
      name: "modify",
      props: {
        icon: <Edit />,
        "aria-label": t("collaborativewall.toolbar.edit"),
        color: "tertiary",
        onClick: () =>
          onEdit?.({
            href: media.url,
            target: "_blank",
            name: media.name,
          }),
      },
      tooltip: t("collaborativewall.toolbar.edit", { ns: appCode }),
    },
    {
      type: "icon",
      name: "open",
      props: {
        icon: <ExternalLink />,
        "aria-label": t("collaborativewall.toolbar.open"),
        color: "tertiary",
        onClick: () =>
          onOpen?.({
            href: media.url,
            target: "_blank",
          }),
      },
      tooltip: t("collaborativewall.toolbar.open", { ns: appCode }),
    },
    {
      type: "icon",
      name: "delete",
      props: {
        icon: <Delete />,
        "aria-label": t("collaborativewall.toolbar.delete"),
        color: "danger",
        onClick: () => setMedia?.(null),
      },
      tooltip: t("collaborativewall.toolbar.delete", { ns: appCode }),
    },
  ];

  switch (media.type) {
    case "image":
      return (
        <div style={{ position: "relative", width: "100%" }}>
          {!readonly && (
            <IconButton
              className="delete-button mt-8 me-8"
              icon={<Delete />}
              variant="outline"
              color="danger"
              style={{ zIndex: "1" }}
              onClick={() => setMedia?.(null)}
            />
          )}
          <Image
            src={media.url}
            alt={media.type}
            width="100%"
            objectFit={modalNote ? "contain" : "cover"}
            ratio="16"
            style={{
              borderRadius: "8px",
              maxHeight: "350px",
            }}
          />
        </div>
      );
    case "audio":
      return (
        <div
          className={`${mediaClasses} ${modalNote ? "" : "my-16"} media-center`}
        >
          <audio
            src={media.url}
            className="media-audio"
            controls
            data-document-id={media.id}
            muted
            style={{ zIndex: canMoveNote ? "1" : "0", marginBottom: "-8px" }}
          >
            <track default kind="captions" srcLang="fr" src=""></track>
          </audio>
          {!readonly && (
            <IconButton
              className="ms-8"
              icon={<Delete />}
              variant="outline"
              color="danger"
              onClick={() => setMedia?.(null)}
            />
          )}
        </div>
      );
    case "attachment":
      return (
        <div className={`${mediaClasses} ${modalNote ? "" : "my-16"}`}>
          <Attachment
            name={media.name}
            options={
              modalNote ? (
                <>
                  <a href={media.url} download>
                    <IconButton
                      icon={<Download />}
                      color="tertiary"
                      type="button"
                      variant="ghost"
                      aria-label={t("download")}
                    />
                  </a>
                  {!readonly && (
                    <IconButton
                      icon={<Delete />}
                      variant="ghost"
                      color="danger"
                      aria-label={t("remove")}
                      onClick={() => setMedia?.(null)}
                    />
                  )}
                </>
              ) : undefined
            }
          ></Attachment>
        </div>
      );
    case "video":
      return (
        <div style={{ position: "relative" }}>
          {!readonly && (
            <IconButton
              className="delete-button mt-8 me-8"
              icon={<Delete />}
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
              style={{
                height: modalNote ? "350px" : "",
                zIndex: canMoveNote ? "1" : "0",
              }}
            />
          ) : (
            <video
              src={media.url}
              data-document-id={media.id}
              controls
              className="media-video"
              style={{
                marginBottom: "-8px",
                zIndex: canMoveNote ? "1" : "0",
              }}
            >
              <track default kind="captions" srcLang="fr" src=""></track>
            </video>
          )}
        </div>
      );
    case "hyperlink":
      return (
        <div
          style={{
            backgroundColor: "#D9D9D9",
            width: "100%",
            height: readonly ? "120px" : "200px",
            borderRadius: "16px",
            position: "relative",
          }}
        >
          {!readonly && (
            <Toolbar className="delete-button mt-8 me-8" items={LinkItems} />
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              justifyContent: "center",
            }}
          >
            <AppIcon app={media.name} size="48" />
          </div>
          <div
            style={{
              bottom: "0",
              position: "absolute",
              backgroundColor: "rgba(0, 0, 0, 0.70)",
              borderRadius: "0px 16px",
              padding: "4px 8px",
              width: "100%",
              maxWidth: "250px",
            }}
          >
            <a
              href={media.url}
              target="_blank"
              style={{ color: "white", display: "block" }}
              className="text-truncate"
            >
              {media.name ?? media.url}
            </a>
          </div>
        </div>
      );
    default:
      break;
  }
};
