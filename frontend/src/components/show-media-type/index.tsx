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

import { NoteMedia } from "~/models/noteMedia";

export interface ShowMediaTypeProps {
  media: NoteMedia;
  setMedia?: (value: NoteMedia | null) => void;
  readonly?: boolean;
  onEdit?: (attrs: any) => void;
  onOpen?: (attrs: any) => void;
}

export const ShowMediaType = ({
  media,
  setMedia,
  readonly = true,
  onEdit,
  onOpen,
}: ShowMediaTypeProps) => {
  const { t } = useTranslation();

  const { appCode } = useOdeClient();

  const mediaClasses = clsx({
    "media-center": readonly,
    "d-block": readonly,
    "px-64": !readonly,
    "py-32": !readonly,
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
            objectFit={readonly ? "cover" : "contain"}
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
        <div className={`${mediaClasses} media-center`}>
          <audio
            src={media.url}
            controls
            data-document-id={media.id}
            muted
            style={{
              width: "100%",
              zIndex: "1",
              position: "relative",
              maxWidth: "206px",
            }}
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
        <div className={mediaClasses}>
          <Attachment
            name={media.name}
            options={
              !readonly ? (
                <>
                  <a href={media.url} style={{ zIndex: "1" }} download>
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
              style={{ zIndex: "2" }}
            />
          )}
          {!media.id ? (
            <iframe
              src={media.url}
              title={media.name}
              style={{
                borderRadius: "8px",
                maxHeight: "350px",
                position: "relative",
                zIndex: "1",
                width: "100%",
                height: readonly ? "" : "350px",
              }}
            ></iframe>
          ) : (
            <video
              src={media.url}
              data-document-id={media.id}
              controls
              style={{
                borderRadius: "8px",
                maxHeight: "350px",
                position: "relative",
                zIndex: "1",
                width: "100%",
                marginBottom: "-8px",
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
