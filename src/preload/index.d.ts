import type { Track } from '../main/library'

export interface GoldenPlayerApi {
  selectMusicFolder: () => Promise<string | null>
  scanLibrary: (folderPath: string) => Promise<Track[]>
  toMediaUrl: (filePath: string) => string
}

declare global {
  interface Window {
    api: GoldenPlayerApi
  }
}
