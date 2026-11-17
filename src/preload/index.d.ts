import type { Track } from '../main/library'

export interface GoldenPlayerApi {
  selectMusicFolders: () => Promise<string[]>
  scanLibrary: (folderPath: string) => Promise<Track[]>
  toMediaUrl: (filePath: string) => string
  windowMinimize: () => void
  windowClose: () => void
}

declare global {
  interface Window {
    api: GoldenPlayerApi
  }
}
