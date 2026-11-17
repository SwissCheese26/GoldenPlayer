# AGENTS.md — GoldenPlayer

Projektkontext fuer Claude Code in `C:\Scripts\GoldenPlayer`. Separates Projekt,
unabhaengig vom `AGENTS.md` eine Ebene hoeher (das gilt fuer Startup Hub V2).

## Projekt

Musik-Player im 90er/2000er-Stil (Winamp-Ara-Optik). Features:

- Streaming: Spotify, Apple Music (Deezer verworfen — nur 30-Sek-Previews ohne
  Partnerdeal, kein Mehrwert)
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

## Streaming-Dienste — Feasibility (recherchiert, Stand 2025/2026)

Ziel: nur Streaming-Wiedergabe, Name/Interpret/Bild, Steuerung ueber unser
eigenes Interface (kein Provider-Widget).

- **Spotify — am realistischsten.** Web Playback SDK gibt volle Kontrolle
  (play/pause/seek/skip/volume) ueber eigenes UI, kein Spotify-Widget noetig.
  Braucht: Premium-Account des Nutzers, Spotify-Dev-App-Registrierung, ab
  2025 strengere Freigabe fuer "Extended Access" (Web API jenseits Dev-Mode).
  SDK-Lizenz verlangt eigentlich Spotify-Freigabe fuer kommerzielle Projekte.
  Technischer Haken: volle Wiedergabe laeuft ueber Widevine/EME-DRM — Standard-
  Electron hat das nicht, braucht Widevine-faehigen Electron-Build (z.B.
  castlabs-Fork).
- **Apple Music — machbar, mehr Reibung.** MusicKit JS erlaubt ebenfalls
  volle eigene Playback-Kontrolle. Braucht: kostenpflichtigen Apple Developer
  Account, selbst signierten JWT-Token, aktives Apple-Music-Abo des Nutzers.
  Unklar/unverifiziert: ob Wiedergabe in Standard-Electron ueberhaupt startet
  (DRM/EME) — ein bekanntes Forum-Beispiel brauchte dafuer ebenfalls einen
  Widevine-Electron-Build. Vor Commitment per Spike pruefen.
- **Deezer, YouTube Music, Tidal — nicht im Scope.** Deezer nur 30-Sek-Preview
  ohne Partnerdeal, YT Music/Tidal nur inoffizielle ToS-riskante APIs.

**Empfohlene Reihenfolge:** zuerst Electron-Widevine-Grundlage bauen (Blocker
fuer Spotify + Apple Music gemeinsam) → Spotify Premium-Playback end-to-end
validieren (klarster Weg) → Apple Music als Stretch-Goal nach DRM-Proof-of-
Concept → Deezer von Anfang an nur als Preview-Snippet.

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

## Roadmap

**Scope final: Spotify + Apple Music + lokale Dateien.** Video-Wiedergabe
(lokal, gedeckelt ~1200×XXX) ist eigene Spur, nicht an Streaming gekoppelt.

0. **Projekt-Setup** — Electron + React + TypeScript Scaffold (electron-vite),
   Grundfenster, Ordnerstruktur, Lint/Build-Pipeline.
1. **Lokale Wiedergabe** — HTML5 Audio/Web Audio API, Dateiauswahl + Bibliothek-
   Scan, ID3-Metadaten (`music-metadata`), Basis-Transport-UI. Lauffaehiger
   Kern ohne Streaming-Abhaengigkeit.
2. **Retro-UI-Shell** — Skinned Chrome (Winamp-Anatomie: Hauptfenster/EQ/
   Playlist getrennt), Shade-Mode, Responsive-Breakpoints 34" Ultrawide bis
   klein.
3. **Visualizer** — Web Audio `AnalyserNode` → Canvas/WebGL; Butterchurn
   (MilkDrop-Port) fuer die "Alchemy"-Liga einbinden.
4. **Spotify-Spike** — Widevine-faehiger Electron-Build (castlabs-Fork) als
   gemeinsame DRM-Grundlage fuer Spotify + Apple Music testen, bevor Feature-
   Arbeit beginnt.
5. **Spotify-Integration** — OAuth-Login, Web Playback SDK, eigenes UI steuert
   Play/Pause/Seek/Skip, Metadaten + Cover.
6. **Apple Music-Integration** — Dev-Token-Signierung (JWT), MusicKit JS,
   Music-User-Token-Flow, eigenes UI.
7. **Skin-System** — Skin-Switcher, 2-3 Beispiel-Skins (u.a. Trance/Floral-
   Stil als Hommage an Winamp-Skin-Museum).
8. **Packaging & QM** — `electron-builder` Windows-EXE, Tester-Agent
   (Monitor-/Aufloesungs-Checks), QM-Agent (`code-review`, Accessibility).

Reihenfolge ist Risiko-first: DRM-Spike (Schritt 4) vor viel UI-Arbeit an
Spotify/Apple Music, damit ein Blocker frueh auffliegt.

## Status

Schritt 1 fertig: lokale Wiedergabe funktioniert (Ordner waehlen, rekursiver
Scan, ID3-Tags inkl. Cover, Play/Pause/Next/Prev, Seek-Anzeige, Volume).
Audio laeuft ueber eigenes `gp-media://`-Protokoll (kein kompletter Datei-
Load per IPC). `music-metadata` ist ESM-only -> dynamic import im Main-
Prozess. TypeScript auf 5.9 gepinnt (7.0 brach `declare global`-Merging in
der Renderer-Typecheck).

Manuell noch zu testen (Dialog/Dateisystem laesst sich hier nicht headless
automatisieren): Ordner-Picker + echte Wiedergabe im laufenden Fenster.

Seit Schritt 1 ergaenzt: Seek-Bar (im Lied springen), Mehrfach-Ordnerauswahl
(dedupe per Dateipfad, Bibliothek wird ergaenzt statt ersetzt). Vom Nutzer
getestet und bestaetigt funktionierend.

Schritt 2 fertig: Retro-UI-Shell (Winamp-Anatomie: Main/EQ/Playlist als
gedockte Panels, responsive Reihe<->Stapel bei 900px), echter 10-Band-EQ
+ Preamp per Web Audio, eigene Titelleiste (Minimize/Close), VT323/Rajdhani
lokal gebuendelt. Per Playwright-_electron-Screenshot bei 2200px und 640px
verifiziert.

Design-Skill genutzt: `frontend-design` fuer Farb-/Typo-/Layout-Entscheidung
(skeuomorph statt flat, LCD-Gruen als bewusste Anlehnung an WMP/Winamp,
keine generische SaaS-Card-Optik).

Offen/bewusst verschoben: Shade-Mode (Mini-Leiste) — nicht angefragt, kommt
nur bei Bedarf.

Schritt 3 fertig: Visualizer via Butterchurn (echter MilkDrop-Port) im
Main-Panel, haengt am bestehenden Web-Audio-Graph (Tap am Preamp, Haupt-
kette unberuehrt). Klick wechselt Preset. CORS/Tainted-Audio vorab mit
Testton verifiziert (gp-media:// liefert echte Analyser-Daten).

Ergaenzt: Vollbild-Modus fuer den Visualizer (Fullscreen API, Button auf der
Flaeche), getestet bei 3440x1440 — fuellt den kompletten Bildschirm.

Naechster Schritt: Schritt 4 (Spotify/Apple-Music-DRM-Spike, Widevine-
Electron-Build).
