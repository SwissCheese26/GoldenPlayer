import { readdir } from 'fs/promises'
import { join, extname } from 'path'

// music-metadata ist ein reines ESM-Paket; dynamischer Import, weil der
// Electron-Main-Prozess hier als CommonJS gebaut wird.
async function parseFile(filePath: string, options: { duration: boolean }) {
  const { parseFile: parse } = await import('music-metadata')
  return parse(filePath, options)
}

export interface Track {
  filePath: string
  title: string
  artist: string
  album: string
  durationSec: number
  pictureDataUrl: string | null
}

const AUDIO_EXTENSIONS = new Set(['.mp3', '.flac', '.wav', '.m4a', '.ogg', '.aac'])

async function collectAudioFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectAudioFiles(fullPath)))
    } else if (AUDIO_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      files.push(fullPath)
    }
  }

  return files
}

async function readTrack(filePath: string): Promise<Track> {
  try {
    const metadata = await parseFile(filePath, { duration: true })
    const picture = metadata.common.picture?.[0]

    return {
      filePath,
      title: metadata.common.title ?? filePath,
      artist: metadata.common.artist ?? 'Unbekannt',
      album: metadata.common.album ?? 'Unbekannt',
      durationSec: metadata.format.duration ?? 0,
      pictureDataUrl: picture
        ? `data:${picture.format};base64,${Buffer.from(picture.data).toString('base64')}`
        : null
    }
  } catch {
    return {
      filePath,
      title: filePath,
      artist: 'Unbekannt',
      album: 'Unbekannt',
      durationSec: 0,
      pictureDataUrl: null
    }
  }
}

export async function scanLibrary(folderPath: string): Promise<Track[]> {
  const files = await collectAudioFiles(folderPath)
  return Promise.all(files.map(readTrack))
}
