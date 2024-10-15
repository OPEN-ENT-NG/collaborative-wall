import { MediaLibraryType } from '@edifice-ui/react';

export interface MediaProps {
  id: string;
  name: string;
  application: string;
  type: MediaLibraryType;
  url: string;
  targetUrl?: string;
}
