import { Select, useOdeClient } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";
import { LoaderFunctionArgs } from "react-router-dom";
import { noteColors } from "~/config";

import { NoteProps } from "~/models/notes";
import { getNote } from "~/services/api";
import { Circle } from "~/utils/circle";

export async function noteLoader({ params }: LoaderFunctionArgs) {
  const { wallId, noteId } = params;

  if (!wallId || !noteId) {
    throw new Response("", {
      status: 404,
      statusText: "Wall id or Note id is null",
    });
  }

  const note = await getNote(wallId, noteId);

  if (!note) {
    throw new Response("", {
      status: 404,
      statusText: "Not Found",
    });
  }

  return note;
}

export const ColorSelect = ({
  setColorValue,
  dataNote,
}: {
  setColorValue: (value: string[]) => void;
  dataNote?: NoteProps;
}) => {
  const { t } = useTranslation();
  const { appCode } = useOdeClient();

  const colorsList = [
    {
      label: t("collaborativewall.color.white", { ns: appCode }),
      value: noteColors.white.background,
      icon: <Circle borderColor={noteColors.white.border} />,
    },
    {
      label: t("collaborativewall.color.yellow", { ns: appCode }),
      value: noteColors.yellow.background,
      icon: (
        <Circle
          className="bg-yellow-200"
          borderColor={noteColors.yellow.border}
        />
      ),
    },
    {
      label: t("collaborativewall.color.orange", { ns: appCode }),
      value: noteColors.orange.background,
      icon: (
        <Circle
          className="bg-orange-200"
          borderColor={noteColors.orange.border}
        />
      ),
    },
    {
      label: t("collaborativewall.color.red", { ns: appCode }),
      value: noteColors.red.background,
      icon: (
        <Circle className="bg-red-200" borderColor={noteColors.red.border} />
      ),
    },
    {
      label: t("collaborativewall.color.purple", { ns: appCode }),
      value: noteColors.purple.background,
      icon: (
        <Circle
          className="bg-purple-200"
          borderColor={noteColors.purple.border}
        />
      ),
    },
    {
      label: t("collaborativewall.color.blue", { ns: appCode }),
      value: noteColors.blue.background,
      icon: (
        <Circle className="bg-blue-200" borderColor={noteColors.blue.border} />
      ),
    },
    {
      label: t("collaborativewall.color.green", { ns: appCode }),
      value: noteColors.green.background,
      icon: (
        <Circle
          className="bg-green-200"
          borderColor={noteColors.green.border}
        />
      ),
    },
  ];

  const placeholderValue = () => {
    const color = colorsList.find(
      (value) => value.value === dataNote?.color?.[0],
    );

    if (!color) return undefined;
    return color;
  };

  return (
    <Select
      size="sm"
      icon={
        placeholderValue()?.icon ?? (
          <Circle
            className="bg-yellow-200"
            borderColor={noteColors.yellow.border}
          />
        )
      }
      options={colorsList}
      placeholderOption={
        placeholderValue()?.label ??
        t("collaborativewall.color.yellow", { ns: appCode })
      }
      onValueChange={(value) => setColorValue([value as string])}
    />
  );
};
