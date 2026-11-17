import { useEffect, useRef, useState } from 'react'
import butterchurn from 'butterchurn'
import butterchurnPresets from 'butterchurn-presets'

type VisualizerInstance = ReturnType<typeof butterchurn.createVisualizer>

interface Props {
  audioContext: AudioContext | null
  tapNode: AudioNode | null
}

const presets = butterchurnPresets.getPresets() as Record<string, unknown>
const presetNames = Object.keys(presets)

function Visualizer({ audioContext, tapNode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const visualizerRef = useRef<VisualizerInstance | null>(null)
  const [presetIndex, setPresetIndex] = useState(() =>
    Math.floor(Math.random() * presetNames.length)
  )

  useEffect(() => {
    if (!audioContext || !tapNode || !canvasRef.current || visualizerRef.current) return

    const canvas = canvasRef.current
    const visualizer = butterchurn.createVisualizer(audioContext, canvas, {
      width: canvas.clientWidth || 300,
      height: canvas.clientHeight || 200
    })
    visualizer.connectAudio(tapNode)
    visualizerRef.current = visualizer

    let frame: number
    const renderLoop = (): void => {
      visualizer.render()
      frame = requestAnimationFrame(renderLoop)
    }
    renderLoop()

    return () => cancelAnimationFrame(frame)
  }, [audioContext, tapNode])

  useEffect(() => {
    if (visualizerRef.current) {
      visualizerRef.current.loadPreset(presets[presetNames[presetIndex]], 1.0)
    }
  }, [presetIndex])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const observer = new ResizeObserver(() => {
      const { clientWidth, clientHeight } = container
      canvas.width = clientWidth
      canvas.height = clientHeight
      visualizerRef.current?.setRendererSize(clientWidth, clientHeight)
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  function nextPreset(): void {
    setPresetIndex((i) => (i + 1) % presetNames.length)
  }

  return (
    <div className="visualizer" ref={containerRef} onClick={nextPreset}>
      <canvas ref={canvasRef} />
      <span className="visualizer-preset-name">{presetNames[presetIndex]}</span>
    </div>
  )
}

export default Visualizer
