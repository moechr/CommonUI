---
name: common-ui
description: Browser-Oberflächen mit der eigenen Common UI (@ki/common-ui, github:moechr/CommonUI) bauen oder erweitern – neue Projekte einrichten, App-Gerüst mit Titelleiste/Seitenmenü/Inspector/Statusleiste, Mess-, Prüf- und Steueransichten mit Kacheln, Schaltfeldern, Live-Werten, Tabellen und technischen Diagrammen. Verwenden bei "Oberfläche/UI/Frontend/Dashboard/Testoberfläche bauen", "Common UI", "@ki/common-ui", "Hardware-Test-Seite", "Schaltfeld", "Messwerte anzeigen".
---

# Common UI verwenden

Die Bibliothek `@ki/common-ui` ist die gemeinsame Oberfläche für alle eigenen KI- und Technikprojekte.
Nicht selbst gestalten und keine anderen UI-Bibliotheken (MUI, Tailwind, Bootstrap …) einbinden.

## 1. Regeln laden

Ist das Paket schon installiert, zuerst lesen:
- `node_modules/@ki/common-ui/AGENTS.md` – Seitenaufbau, verbindliche Regeln, Aufgabe → Baustein
- `node_modules/@ki/common-ui/docs/components.md` – alle Props

Sonst dieselben Dateien von GitHub holen:
- https://raw.githubusercontent.com/moechr/CommonUI/main/AGENTS.md
- https://raw.githubusercontent.com/moechr/CommonUI/main/docs/components.md

Diese Regeln haben Vorrang vor eigenen Gestaltungsideen.

## 2. Neues Projekt

1. Startvorlage holen (Vite + React + TypeScript, App-Gerüst, eine Steueransicht):
   ```bash
   npx degit moechr/CommonUI/templates/app <ordner>
   cd <ordner> && npm install && npm run dev
   ```
   Ohne `degit`: Repo klonen und `templates/app/` kopieren.
2. In `package.json` steht die Version fest (`github:moechr/CommonUI#v0.2.0`). Neuere Version nur nach
   Blick in `CHANGELOG.md` übernehmen.
3. App-Namen in `src/App.tsx` (`TitleBar appName`) und `index.html` anpassen, Navigation auf die Ansichten
   des Projekts umbauen, Beispielansicht ersetzen.

## 3. Bestehendes Projekt

```bash
npm install github:moechr/CommonUI#v0.2.0
```
Im Einstiegspunkt einmal `import "@ki/common-ui/style.css";` und die App in
`<ThemeProvider defaultTheme="light"><ToastProvider>…</ToastProvider></ThemeProvider>` einpacken.
Gerüst nach dem Schema in `AGENTS.md` (AppShell → TitleBar, Sidebar, Main, Inspector, StatusBar).

## 4. Ansichten bauen – Kurzfassung der Regeln

- Inhalt: `<Main><Toolbar/>?<div className="cui-content"><PageHeader/><TileGrid>…</TileGrid></div></Main>`.
- Werte oben als `ValueTile` (span 3), Diagramm + Schaltfeld als `Tile span={8}` + `Tile span={4}`, Tabellen `Tile span={12} flush`.
- Schalten wirkt sofort; Massenaktionen per Toast mit „Rückgängig“; Live-Werte mit `LiveBadge`, anhaltbar.
- Tabellen mit Live-Werten: allen Spalten außer der Namensspalte `width` geben, Zahlen `numeric: true`, viele Zeilen `dense`.
- Zahlen: deutsches Komma, echtes Minus `−`, Einheit mit Leerzeichen (`11,58 V`).
- Diagramme nur mit `TimeChart`: `yAxis={{ label: "Strom I", unit: "A" }}` (DIN 461), Grenzwerte als `limits`,
  Toleranzen als `bands`, `includeZero` nur wenn physikalisch sinnvoll. `Sparkline` nur als Tendenz.
- Status immer mit Text (`Chip`, `Led label`), ein Primär-Button pro Ansicht, `ThemeToggle` in die Titelleiste,
  Suche (`SearchField`) nur wenn nötig.

## 5. Prüfen vor dem Abschluss

- `npm run build` bzw. `tsc --noEmit` fehlerfrei.
- Ansicht im Browser hell **und** dunkel ansehen, außerdem bei ca. 375 px Breite (kein seitliches Scrollen).
- Bei Live-Werten: einige Sekunden beobachten, ob Tabellenspalten oder Kacheln springen.

## 6. Fehlt ein Baustein?

Nicht im Projekt nachbauen. Im Repo `moechr/CommonUI` ergänzen (Ablauf in `AGENTS.md`, Abschnitt
„Bibliothek erweitern“), neue Version taggen, dann im Projekt die Version erhöhen. Ist das gerade nicht
möglich, die Lösung im Projekt nur aus vorhandenen Bausteinen und Tokens zusammensetzen und dem Nutzer
vorschlagen, sie in die Bibliothek zu übernehmen.
