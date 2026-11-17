export interface GoldenPlayerApi {}

declare global {
  interface Window {
    api: GoldenPlayerApi
  }
}
