import { useEffect, useRef, useState } from 'react'
import type { Track } from './types'

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function App() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const audioRef = useRef<HTMLAudioElement>(null)

  const currentTrack = currentIndex !== null ? tracks[currentIndex] : null

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  async function handleChooseFolders(): Promise<void> {
    const folders = await window.api.selectMusicFolders()
    if (folders.length === 0) return
    const scanned = await Promise.all(folders.map((folder) => window.api.scanLibrary(folder)))
    const found = scanned.flat()

    setTracks((prev) => {
      const existingPaths = new Set(prev.map((t) => t.filePath))
      const merged = [...prev, ...found.filter((t) => !existingPaths.has(t.filePath))]
      return merged
    })
  }

  function playTrack(index: number): void {
    setCurrentIndex(index)
    setIsPlaying(true)
  }

  function togglePlay(): void {
    if (currentIndex === null && tracks.length > 0) {
      playTrack(0)
      return
    }
    setIsPlaying((prev) => !prev)
  }

  function playNext(): void {
    if (currentIndex === null || tracks.length === 0) return
    playTrack((currentIndex + 1) % tracks.length)
  }

  function playPrevious(): void {
    if (currentIndex === null || tracks.length === 0) return
    playTrack((currentIndex - 1 + tracks.length) % tracks.length)
  }

  function handleSeek(seconds: number): void {
    if (!audioRef.current) return
    audioRef.current.currentTime = seconds
    setCurrentTime(seconds)
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) audio.play().catch(() => setIsPlaying(false))
    else audio.pause()
  }, [isPlaying, currentIndex])

  return (
    <div className="shell">
      <audio
        ref={audioRef}
        src={currentTrack ? window.api.toMediaUrl(currentTrack.filePath) : undefined}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={playNext}
      />

      <h1>GoldenPlayer</h1>

      <button onClick={handleChooseFolders}>Ordner wählen</button>

      <div className="now-playing">
        {currentTrack ? (
          <>
            {currentTrack.pictureDataUrl && (
              <img src={currentTrack.pictureDataUrl} alt="" className="cover" />
            )}
            <div>
              <div>{currentTrack.title}</div>
              <div className="muted">{currentTrack.artist}</div>
            </div>
          </>
        ) : (
          <span className="muted">Kein Titel ausgewaehlt</span>
        )}
      </div>

      <div className="transport">
        <button onClick={playPrevious}>⏮</button>
        <button onClick={togglePlay}>{isPlaying ? '⏸' : '▶'}</button>
        <button onClick={playNext}>⏭</button>
        <span className="muted">{formatTime(currentTime)}</span>
        <input
          className="seek-bar"
          type="range"
          min={0}
          max={currentTrack?.durationSec ?? 0}
          step={0.1}
          value={currentTime}
          disabled={!currentTrack}
          onChange={(e) => handleSeek(Number(e.target.value))}
        />
        <span className="muted">{formatTime(currentTrack?.durationSec ?? 0)}</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
        />
      </div>

      <ul className="track-list">
        {tracks.map((track, index) => (
          <li
            key={track.filePath}
            className={index === currentIndex ? 'active' : ''}
            onDoubleClick={() => playTrack(index)}
          >
            {track.title} — {track.artist}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
