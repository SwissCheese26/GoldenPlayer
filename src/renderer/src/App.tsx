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

  async function handleChooseFolder(): Promise<void> {
    const folder = await window.api.selectMusicFolder()
    if (!folder) return
    const found = await window.api.scanLibrary(folder)
    setTracks(found)
    setCurrentIndex(null)
    setIsPlaying(false)
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

      <button onClick={handleChooseFolder}>Ordner wählen</button>

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
        <span className="muted">
          {formatTime(currentTime)} / {formatTime(currentTrack?.durationSec ?? 0)}
        </span>
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
