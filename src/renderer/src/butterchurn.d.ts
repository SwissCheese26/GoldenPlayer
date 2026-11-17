declare module 'butterchurn' {
  interface CreateVisualizerOptions {
    width: number
    height: number
  }
  interface ButterchurnVisualizer {
    connectAudio: (node: AudioNode) => void
    loadPreset: (preset: unknown, blendSeconds: number) => void
    render: () => void
    setRendererSize: (width: number, height: number) => void
  }
  function createVisualizer(
    audioContext: AudioContext,
    canvas: HTMLCanvasElement,
    options: CreateVisualizerOptions
  ): ButterchurnVisualizer
  const _default: { createVisualizer: typeof createVisualizer }
  export default _default
}

declare module 'butterchurn-presets' {
  function getPresets(): Record<string, unknown>
  const _default: { getPresets: typeof getPresets }
  export default _default
}
