# Änderungen

Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionen nach [SemVer](https://semver.org/lang/de/).
Projekte pinnen eine Version (`github:moechr/CommonUI#v0.2.0`). Vor dem Wechsel auf eine neue Version
den Abschnitt **Geändert** bzw. **Entfernt** lesen.

## [0.2.0] – 2026-11-17

Erste Version als Software-Anwendung (statt Chatbot) mit Steuer- und Messbausteinen.

### Neu
- App-Gerüst: `TitleBar`, einklappbare `Sidebar` (Strg/⌘+B, Zustand gespeichert, mobil als Overlay),
  `Inspector`, `StatusBar`/`StatusItem`, `useShell()`.
- Kacheln: `TileGrid`, `Tile`, `ValueTile`, `PageHeader`, `LiveBadge`.
- Steuerung: `Toggle`, `SwitchTile`, `Led`, `NumberField`.
- `TimeChart`: technisches Zeitdiagramm (DIN-461-Achsen, 1-2-5-Teilung mit Nebenraster, Grenzlinien,
  Toleranzbänder, Fadenkreuz, Statistik). `Sparkline` für Tendenzen.
- `Tabs`, `SearchField` (optional), `ThemeToggle`.
- `DataTable`: `width` je Spalte (festes Layout, keine springenden Spalten), `dense`, `isRowDimmed`.
- Tokens: `--cui-accent-text`, `--cui-fill-hover`, `--cui-err-text`, `--cui-chart-1…4`, `--cui-grid-major|minor`.
- KI-Unterstützung: `AGENTS.md`, `CLAUDE.md`, `docs/components.md`, `llms.txt`, Claude-Code-Plugin mit Skill
  `common-ui`, Startvorlage `templates/app/`. Doku wird im Paket mitgeliefert (`node_modules/@ki/common-ui/`).

### Geändert
- `AppShell`: Props `titleBar` und `statusBar` neu; das Logo sitzt in der `TitleBar`, nicht mehr in der `Sidebar`.
- `Sidebar`: Props `title`, `logo`, `headerAction` entfernt (gehören in die `TitleBar`), neu `collapseToggle`.
- `NavItem`: `icon` ist Pflicht, `children` muss Text sein (Tooltip im eingeklappten Zustand).
- `ThemeProvider`: `defaultTheme` wird jetzt auch bei `persist` beachtet.
- Dunkel-Modus: Akzentfarbe kräftiger, gefüllte Buttons mit weißer Schrift.

### Behoben
- Schalter in Tabellenzellen ohne Schiene.
- CSS wurde in Anwendungen verworfen (`sideEffects` in `package.json`).

## [0.1.0] – 2026-11-17

Erster Stand: Tokens, Chat-orientierte App-Shell, Formular- und Chat-Komponenten, Demo.
