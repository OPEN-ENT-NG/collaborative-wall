import { MediaLibraryType } from "@edifice-ui/react";

export interface NoteMedia {
  id: string;
  name: string;
  type: MediaLibraryType;
  url: string;
}
