# AGENTS.md — GoldenPlayer

Projektkontext fuer Claude Code in `C:\Scripts\GoldenPlayer`. Separates Projekt,
unabhaengig vom `AGENTS.md` eine Ebene hoeher (das gilt fuer Startup Hub V2).

## Projekt

Musik-Player im 90er/2000er-Stil (Winamp-Ara-Optik). Features:

- Streaming: Apple Music, Spotify, Deezer
- Lokale Dateien (Audio)
- Video-Wiedergabe, Aufloesung gedeckelt auf ca. 1200×XXX (kein 4K)
- Responsive: 34" curved Ultrawide bis kleine Monitore

Phase 1: Windows-EXE. Phase 2 (offen): Mobile (iOS/Android), Mac/Linux Desktop,
evtl. Web — Architektur soll das nicht blockieren.

## Tech-Stack (entschieden)

**Electron + React.** Grund: Spotify/Apple Music/Deezer SDKs sind alle
JS/Web-basiert, laufen direkt im Chromium-Kontext. Volle CSS-Kontrolle fuers
Retro-Skin. Code-Basis laesst sich Richtung Web/Mobile (Capacitor o.ae.)
weiterverwenden. Windows-Build via `electron-builder`.

Verworfen: Tauri (jueneres Tooling, kein Vorteil hier), .NET WPF/WinUI
(passt zwar zum StartupHub-Muster, aber Streaming-SDKs muessten eh per
WebView2 eingebettet werden — kein Gewinn, Cross-Platform schwerer).

## Bekanntes Risiko (fuer spaetere Planung pruefen)

- Spotify Web Playback SDK: braucht Premium-Account, laeuft als Embedded-Player.
- Apple MusicKit JS: braucht Apple Developer Account + aktives Abo des Nutzers.
- Deezer SDK: volle Wiedergabe fuer Drittanbieter-Apps stark eingeschraenkt,
  oft nur 30-Sek-Previews ohne Deezer-Partnerstatus. Muss vor Implementierung
  verifiziert werden, sonst Fallback/Teilumfang einplanen.

## Claude Code Skills — Auswahl & Grund

| Skill | Grund |
|---|---|
| `frontend-design:frontend-design` | Eigenstaendige Retro-Optik (90er/2000er), kein Template-Look |
| `ui-ux-pro-max` | Responsive Layout-Logik, Breakpoints, Accessibility, React-Stack |
| `modern-web-design` | Perf/Accessibility-Basis trotz Retro-Visuals |
| `ui-styling` | Tailwind/shadcn-Grundlayout unter dem Retro-Skin |
| `fixing-accessibility` | Tastatur-Navigation, ARIA, Kontrast fuer Player-Controls |
| `fixing-motion-performance` | Visualizer/Animationen ruckelfrei |
| `pixijs-2d` | Audio-Visualizer (Winamp-Style) performant rendern |
| `baseline-ui` | Polish-Pass vor Release |
| `code-review` | QM-Durchlauf vor Merges |

Nicht genutzt: Vercel-Skills (Next.js/Deploy-fokussiert, hier Electron-Desktop,
keine Vercel-Infrastruktur betroffen).

## Agenten-Rollen (ueber Agent-Tool, nicht Skills)

Ich (Teamleiter) koordiniere bei der Umsetzung:

- **Frontend-Agent**: React-Komponenten, Retro-UI, Player-Controls
- **Web-Dev/Responsive-Agent**: Breakpoints 34" Ultrawide bis klein, Layout-QA
- **Windows-Dev-Agent**: Electron-Builder-Packaging, Windows-Integration
  (Dateizuordnungen lokale Audio/Video, Autostart falls gewuenscht)
- **Tester-Agent**: Funktionstests, Aufloesungs-/Monitor-Checks
- **QM-Agent**: Code-Review (`code-review` Skill), Konsistenz, Accessibility-Audit

## Status

Skills + Rollen festgelegt. Naechster Schritt: Projekt im Detail planen
(Features, Datenmodell, Ordnerstruktur, Scope pro Streaming-Dienst).
