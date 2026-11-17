import { contextBridge, ipcRenderer } from 'electron'
import type { Track } from '../main/library'

const api = {
  selectMusicFolders: (): Promise<string[]> => ipcRenderer.invoke('library:selectFolders'),
  scanLibrary: (folderPath: string): Promise<Track[]> =>
    ipcRenderer.invoke('library:scan', folderPath),
  toMediaUrl: (filePath: string): string =>
    `gp-media://local/${encodeURIComponent(filePath)}`
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.api = api
}
