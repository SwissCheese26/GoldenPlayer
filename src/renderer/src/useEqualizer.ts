import { useEffect, useRef, useState } from 'react'

export const EQ_BANDS_HZ = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000]

interface EqualizerGraph {
  audioContext: AudioContext
  filters: BiquadFilterNode[]
  preamp: GainNode
}

export function useEqualizer(audioRef: React.RefObject<HTMLAudioElement | null>) {
  const [enabled, setEnabled] = useState(true)
  const [bandGainsDb, setBandGainsDb] = useState<number[]>(() => EQ_BANDS_HZ.map(() => 0))
  const [preampDb, setPreampDb] = useState(0)
  const [graphReady, setGraphReady] = useState(false)
  const graphRef = useRef<EqualizerGraph | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || graphRef.current) return

    const audioContext = new AudioContext()
    const source = audioContext.createMediaElementSource(audio)
    const preamp = audioContext.createGain()

    const filters = EQ_BANDS_HZ.map((frequency) => {
      const filter = audioContext.createBiquadFilter()
      filter.type = 'peaking'
      filter.frequency.value = frequency
      filter.Q.value = 1
      filter.gain.value = 0
      return filter
    })

    source.connect(preamp)
    filters.reduce((node, filter) => {
      node.connect(filter)
      return filter
    }, preamp as AudioNode)
    filters[filters.length - 1].connect(audioContext.destination)

    graphRef.current = { audioContext, filters, preamp }
    setGraphReady(true)
  }, [audioRef])

  function setBandGain(index: number, db: number): void {
    setBandGainsDb((prev) => {
      const next = [...prev]
      next[index] = db
      return next
    })
    const filter = graphRef.current?.filters[index]
    if (filter) filter.gain.value = enabled ? db : 0
  }

  function setPreamp(db: number): void {
    setPreampDb(db)
    if (graphRef.current) graphRef.current.preamp.gain.value = dbToGain(enabled ? db : 0)
  }

  function toggleEnabled(): void {
    const next = !enabled
    setEnabled(next)
    const graph = graphRef.current
    if (!graph) return
    graph.filters.forEach((filter, index) => {
      filter.gain.value = next ? bandGainsDb[index] : 0
    })
    graph.preamp.gain.value = dbToGain(next ? preampDb : 0)
  }

  return {
    enabled,
    bandGainsDb,
    preampDb,
    setBandGain,
    setPreamp,
    toggleEnabled,
    audioContext: graphReady ? graphRef.current!.audioContext : null,
    tapNode: graphReady ? (graphRef.current!.preamp as AudioNode) : null
  }
}

function dbToGain(db: number): number {
  return 10 ** (db / 20)
}
