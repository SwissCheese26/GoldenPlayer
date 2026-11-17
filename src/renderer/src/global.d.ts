import type { Track } from './types'

export interface GoldenPlayerApi {
  selectMusicFolders: () => Promise<string[]>
  scanLibrary: (folderPath: string) => Promise<Track[]>
  toMediaUrl: (filePath: string) => string
}

declare global {
  interface Window {
    api: GoldenPlayerApi
  }
}
