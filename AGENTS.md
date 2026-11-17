# AGENTS.md – Common UI (`@ki/common-ui`)

Anleitung für KI-Assistenten (Claude Code, Copilot, Cursor …), die mit dieser Bibliothek
Oberflächen bauen oder sie weiterentwickeln. Gilt in diesem Repo **und** in jedem Projekt,
das `@ki/common-ui` einbindet (die Datei liegt dort unter `node_modules/@ki/common-ui/AGENTS.md`).

## Was ist das?

Eine React-Bibliothek für **technische Software-Anwendungen im Browser** (Mess-, Prüf- und
Steueroberflächen mit KI-Funktionen). Aufbau wie eine Desktop-Anwendung, Farbschema und
Regeln nach Apples Human Interface Guidelines, hell und dunkel. Zielgruppe sind Ingenieure,
nicht Präsentationen: Werte müssen ablesbar, Diagramme technisch korrekt sein.

- Live-Demo: https://moechr.github.io/CommonUI/
- Komponenten-Referenz: [`docs/components.md`](docs/components.md)
- Startvorlage für neue Projekte: [`templates/app/`](templates/app/)
- Änderungen je Version: [`CHANGELOG.md`](CHANGELOG.md)

## In einem Projekt einbinden

```bash
npm install github:moechr/CommonUI#v0.2.0 react react-dom
```

```tsx
import "@ki/common-ui/style.css";          // genau einmal, im Einstiegspunkt
import { ThemeProvider, ToastProvider } from "@ki/common-ui";

<ThemeProvider defaultTheme="light">        {/* Standard ist Hell */}
  <ToastProvider>
    <App />
  </ToastProvider>
</ThemeProvider>
```

Für ein neues Projekt **die Startvorlage `templates/app/` kopieren**, statt bei null anzufangen.

## Seitenaufbau (immer so)

```
AppShell
├─ titleBar   → <TitleBar appName context actions={<ThemeToggle/> …} />
├─ sidebar    → <Sidebar> <NavSection label> <NavItem icon …/> </NavSection> </Sidebar>
├─ children   → <Main>
│                 <Toolbar title | leading={<Tabs/>} actions />   (optional)
│                 <div className="cui-content">                  (scrollt, Innenabstand)
│                   <PageHeader title description meta={<LiveBadge/>} actions />
│                   <TileGrid> <ValueTile/> <Tile span={8}>…</Tile> … </TileGrid>
│                 </div>
│               </Main>
├─ inspector  → <Inspector title> Eigenschaften der Auswahl </Inspector>   (optional)
└─ statusBar  → <StatusBar> <StatusItem tone="ok">Verbunden</StatusItem> </StatusBar>
```

Der Wurzel-Container braucht eine feste Höhe: `<div style={{ height: "100dvh" }}><AppShell …/></div>`.

## Verbindliche Regeln

**Gestaltung**
1. Nur Bausteine und `--cui-*`-Tokens verwenden. Keine festen Farben, keine eigenen Schatten/Radien.
   Fehlt etwas, erst in der Bibliothek ergänzen (siehe „Bibliothek erweitern“).
2. Pro Ansicht höchstens **ein** `variant="primary"`-Button. Gefährliche Aktionen `variant="danger"`.
3. Status immer **mit Text**, nie nur über Farbe (`<Chip tone="err">Überstrom</Chip>`, `<Led label="High"/>`).
4. KI-Inhalte (Werkzeugaufrufe, generierte Werte) mit `tone="ai"` (violett) kennzeichnen.
5. Hell ist Standard; `ThemeToggle` gehört sichtbar in die Titelleiste.
6. Eine Suche ist **kein** fester Bestandteil. `TitleBar center={<SearchField/>}` nur, wenn das Projekt sie braucht.

**Bedienung**
7. Schalten wirkt sofort (kein „Übernehmen“-Knopf). Massenaktionen („Alle ausschalten“) per
   Toast mit **Rückgängig** absichern, nicht mit Bestätigungsdialog.
8. Laufend aktualisierte Werte mit `<LiveBadge paused={…}/>` kennzeichnen und anhaltbar machen.
9. Details zur Auswahl in den `Inspector`, nicht in modale Dialoge.

**Messwerte & Tabellen**
10. Zahlen deutsch formatieren (Komma) mit echtem Minuszeichen `−` (U+2212), Einheit mit Leerzeichen: `11,58 V`.
11. Tabellen mit Live-Werten: **jeder Spalte außer der Namensspalte eine `width` geben**, sonst
    springen die Spalten bei jeder Aktualisierung. Zahlenspalten `numeric: true`.
12. Viele Zeilen mit Messwerten: `dense`; ausgeschaltete Kanäle: `isRowDimmed`.

**Diagramme** (`TimeChart`)
13. Achsentitel nach DIN 461 als „Größe Formelzeichen“ + Einheit: `yAxis={{ label: "Strom I", unit: "A" }}`
    → „Strom I in A“. Zeitachse Standard „Zeit t in s“.
14. Y-Achse skaliert auf den Datenbereich. `includeZero` nur, wenn der Nullpunkt physikalisch
    relevant ist (Strom, Leistung), nicht bei Spannung um 12 V.
15. Grenzwerte als `limits` (beschriftet, Statusfarbe), Toleranzen als `bands`.
16. `Sparkline` nur als Tendenz in `ValueTile`, **nie** als Ersatz für ein Diagramm.

**Layout**
17. Kachel-Raster: 12 Spalten, `span` 3/4/6/8/9/12. Werte-Kacheln span 3, Diagramm + Schaltfeld
    als 8 + 4, Tabellen span 12 mit `flush`. Das Raster bricht nach Containerbreite um,
    keine eigenen Media-Queries schreiben.
18. Klickziele ≥ 44 px auf Touch, sichtbarer Fokus, `prefers-reduced-motion` wird von der Bibliothek beachtet.

## Typische Aufgaben → Bausteine

| Aufgabe | Bausteine |
|---|---|
| Kanal ein/aus in Tabelle | `DataTable` + Spalte mit `<Toggle size="sm" label="CH3 schalten" …/>` |
| Schaltfeld mit Kacheln | `<div className="cui-switch-grid">` + `SwitchTile` (on / fault / value) |
| Sollwert einstellen | `NumberField` (min, max, step, decimals, unit) |
| Große Messwerte oben | `ValueTile` (value als formatierter String, unit, history, tone) |
| Verlauf über Zeit | `TimeChart` (series, yAxis, limits, bands) |
| Digitaler Pegel | `Led on tone label` |
| Hinweis/Fehler auf Seite | `Banner tone title action` |
| Kurze Rückmeldung | `useToast()({ message, icon, actionLabel, onAction })` |
| Mehrere offene Dokumente | `Toolbar leading={<Tabs …/>}` |
| Assistent/Chat-Ansicht | `Thread`, `Message`, `ToolCall`, `Citation`, `Composer` |
| Leere Ansicht | `EmptyState icon title description action` |

Vollständige Props: [`docs/components.md`](docs/components.md) oder die `.d.ts`-Dateien
(`node_modules/@ki/common-ui/dist/types/`), jede Prop ist auf Deutsch kommentiert.

## In diesem Repo arbeiten

```bash
npm install
npm run dev          # Demo auf http://localhost:5180
npm run typecheck    # muss fehlerfrei sein
npm run build        # Bibliothek nach dist/ (läuft auch bei Git-Installation über "prepare")
```

- `src/styles/tokens.css` – alle Tokens, hell und dunkel (`:root`, `prefers-color-scheme`, `[data-theme]`).
- `src/styles/components.css` – Styles, Präfix `cui-`, nur Tokens.
- `src/components/`, `src/shell/`, `src/chat/` – Komponenten; Export über `src/index.ts`.
- `demo/` – Beispiel-Anwendung (GitHub Pages); `demo/GalleryView.tsx` zeigt alle Bausteine.

### Bibliothek erweitern

1. Komponente in `src/…` anlegen, Props mit deutschen JSDoc-Kommentaren, Klassen mit Präfix `cui-`.
2. Styles in `components.css`, nur Tokens; neue Farben als Token in **beiden** Themes ergänzen.
3. In `src/index.ts` exportieren (Komponente **und** Props-Typ).
4. In `demo/GalleryView.tsx` oder einer Demo-Ansicht zeigen, hell und dunkel prüfen, Handy-Breite prüfen.
5. `docs/components.md` und `CHANGELOG.md` ergänzen. Bei geänderten Props Version erhöhen (SemVer).

### Nicht tun

- Keine UI-Bibliotheken (MUI, Tailwind, Bootstrap …) zusätzlich einbinden.
- Kein Branding fremder Firmen (Logos, Markenfarben) übernehmen.
- Keine Breaking Changes ohne Eintrag in `CHANGELOG.md` und neue Minor-/Major-Version.
