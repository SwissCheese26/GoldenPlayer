import { useEffect, useRef, useState } from 'react'
import type { Track } from './types'
import { EQ_BANDS_HZ, useEqualizer } from './useEqualizer'
import Visualizer from './Visualizer'

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
  const eq = useEqualizer(audioRef)

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
      return [...prev, ...found.filter((t) => !existingPaths.has(t.filePath))]
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
    <div className="chassis">
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        src={currentTrack ? window.api.toMediaUrl(currentTrack.filePath) : undefined}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onEnded={playNext}
      />

      <header className="titlebar">
        <span className="titlebar-logo">GOLDENPLAYER</span>
        <div className="titlebar-buttons">
          <button className="chrome-btn" onClick={() => window.api.windowMinimize()}>
            _
          </button>
          <button className="chrome-btn" onClick={() => window.api.windowClose()}>
            x
          </button>
        </div>
      </header>

      <div className="panels">
        <section className="panel panel-main">
          <h2 className="panel-title">MAIN</h2>

          <div className="lcd now-playing">
            {currentTrack ? (
              <>
                {currentTrack.pictureDataUrl && (
                  <img src={currentTrack.pictureDataUrl} alt="" className="cover" />
                )}
                <div className="lcd-text">
                  <div className="ticker">{currentTrack.title}</div>
                  <div className="ticker ticker-sub">{currentTrack.artist}</div>
                </div>
              </>
            ) : (
              <span className="ticker">KEIN TITEL AUSGEWAEHLT</span>
            )}
          </div>

          <div className="transport">
            <button className="chrome-btn" onClick={playPrevious}>
              ⏮
            </button>
            <button className="chrome-btn" onClick={togglePlay}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button className="chrome-btn" onClick={playNext}>
              ⏭
            </button>
          </div>

          <div className="seek-row">
            <span className="lcd-mini">{formatTime(currentTime)}</span>
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
            <span className="lcd-mini">{formatTime(currentTrack?.durationSec ?? 0)}</span>
          </div>

          <div className="volume-row">
            <span className="control-label">VOL</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
            />
          </div>

          <button className="choose-folder-btn" onClick={handleChooseFolders}>
            Ordner wählen
          </button>

          <Visualizer audioContext={eq.audioContext} tapNode={eq.tapNode} />
        </section>

        <section className="panel panel-eq">
          <h2 className="panel-title">
            EQ
            <button className="chrome-btn eq-toggle" onClick={eq.toggleEnabled}>
              {eq.enabled ? 'ON' : 'OFF'}
            </button>
          </h2>

          <div className="eq-bands">
            <div className="eq-band">
              <input
                type="range"
                className="eq-slider"
                min={-12}
                max={12}
                step={0.5}
                value={eq.preampDb}
                onChange={(e) => eq.setPreamp(Number(e.target.value))}
              />
              <span className="control-label">PRE</span>
            </div>
            {EQ_BANDS_HZ.map((hz, index) => (
              <div className="eq-band" key={hz}>
                <input
                  type="range"
                  className="eq-slider"
                  min={-12}
                  max={12}
                  step={0.5}
                  value={eq.bandGainsDb[index]}
                  onChange={(e) => eq.setBandGain(index, Number(e.target.value))}
                />
                <span className="control-label">{hz >= 1000 ? `${hz / 1000}K` : hz}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel panel-playlist">
          <h2 className="panel-title">PLAYLIST</h2>
          {tracks.length === 0 && (
            <p className="control-label">Noch keine Titel — "Ordner wählen" klicken.</p>
          )}
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
        </section>
      </div>
    </div>
  )
}

export default App
