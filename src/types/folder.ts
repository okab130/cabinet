export interface FolderNode {
  id: string;
  name: string;
  children?: FolderNode[];
  isFolder: boolean;
  size?: number;
  mimeType?: string;
  updatedAt?: string;
}
