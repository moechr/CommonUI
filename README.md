# @ki/common-ui

Gemeinsame React-Oberfläche für Software-Anwendungen mit KI-Funktionen im Browser.
Aufbau wie eine Desktop-Anwendung (Titelleiste, einklappbares Seitenmenü, Arbeitsbereich mit Tabs, Inspector, Statusleiste),
Farbschema und Regeln angelehnt an Apples Human Interface Guidelines, hell und dunkel.

```
┌──────────────────────── TitleBar ────────────────────────┐
│ Sidebar │  Toolbar / Tabs                     │ Inspector │
│ (ein-/  │  Arbeitsbereich                     │ (Eigen-   │
│ klappbar│                                     │ schaften) │
└──────────────────────── StatusBar ───────────────────────┘
```

Seitenmenü: Schalter in der Titelleiste, „Einklappen“ unten im Menü oder **Strg/⌘+B**. Der Zustand wird gespeichert.
Unter 1060 px Breite verschwindet der Inspector, unter 720 px wird das Menü zum Overlay.

**Live-Demo:** https://moechr.github.io/CommonUI/

## Starten

```bash
npm install
npm run dev        # Demo auf http://localhost:5180
npm run build      # Bibliothek nach dist/ (JS, CSS, Typen)
```

## In einem Projekt verwenden

Variante A, lokal verlinkt (für den Anfang am einfachsten):

```bash
npm install ../common-ui
```

Variante B, über Git:

```bash
npm install github:moechr/CommonUI#v0.1.0
```

Dann:

```tsx
import "@ki/common-ui/style.css";
import {
  ThemeProvider, ToastProvider, AppShell, TitleBar, Sidebar, NavSection, NavItem,
  Main, Toolbar, Inspector, StatusBar, StatusItem, Chip,
} from "@ki/common-ui";

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <div style={{ height: "100dvh" }}>
          <AppShell
            titleBar={<TitleBar appName="Mein Tool" context="Projekt A" />}
            sidebar={
              <Sidebar footer="v0.1">
                <NavSection label="Arbeitsbereich">
                  <NavItem icon="home" active>Übersicht</NavItem>
                  <NavItem icon="folder" badge={3}>Messungen</NavItem>
                </NavSection>
              </Sidebar>
            }
            inspector={<Inspector title="Eigenschaften">…</Inspector>}
            statusBar={<StatusBar><StatusItem tone="ok">Verbunden</StatusItem></StatusBar>}
          >
            <Main>
              <Toolbar title="Übersicht" status={<Chip tone="ok">Bereit</Chip>} />
              <div className="cui-content">…</div>
            </Main>
          </AppShell>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
```

## Aufbau

| Ordner | Inhalt |
|---|---|
| `src/styles/tokens.css` | Alle Farben, Schriftgrößen, Abstände, Radien. Hier die Marke ändern. |
| `src/styles/components.css` | Styles aller Komponenten, nur über Tokens. |
| `src/components/` | Button, IconButton, Icon, Text, Chip, Meter, KeyValue, Panel, Banner, EmptyState, Field, Input, Select, Textarea, SearchField, Switch, Slider, Segmented, Tabs, DataTable, Toast |
| `src/components/Control.tsx` | Steuerung: Toggle (Schalter ohne Zeile, z. B. in Tabellen), SwitchTile (Schaltfeld-Kachel mit Ein/Aus/Störung), Led (Pegel/Zustand), NumberField (Sollwert mit −/+ und Einheit) |
| `src/components/Tiles.tsx` | PageHeader, LiveBadge, TileGrid (12-Spalten-Raster, bricht nach Containerbreite um), Tile (span 3/4/6/8/9/12), ValueTile (große Werteanzeige mit Verlauf) |
| `src/components/TimeChart.tsx` | Technisches Zeitdiagramm: Achsentitel nach DIN 461, Haupt-/Nebenraster (1-2-5-Teilung), Grenzlinien, Toleranzbänder, Fadenkreuz, Min/Max/Mittel/Aktuell |
| `src/components/ThemeToggle.tsx` | Umschalter Hell/Dunkel für die Titelleiste |
| `src/components/Sparkline.tsx` | Kleiner Verlauf ohne Achsen (nur Tendenz, nicht zum Ablesen) |
| `src/shell/` | AppShell, TitleBar, Sidebar (einklappbar), NavSection, NavItem, Main, Toolbar, Inspector, StatusBar, StatusItem, useShell |
| `src/chat/` | Thread, Message, ToolCall, Citation, TypingIndicator, Composer (für eine Assistent-Ansicht) |
| `src/theme.tsx` | ThemeProvider + useTheme (System / Hell / Dunkel) |
| `demo/` | Beispiel-Anwendung „Werkbank“: Hardware-Test (Live-Werte, Schaltfeld, Kanal-Tabelle, Überstrom-Abschaltung), Übersicht, Messungen (Tabs, Diagramm, Tabelle, Inspector), Assistent, Komponenten-Galerie |
| `docs/mockup.html` | Ursprünglicher HTML-Entwurf (ohne Build im Browser öffnen) |

## Kachel-Layout für Steuer- und Messansichten

```tsx
<div className="cui-content">
  <PageHeader title="Hardware-Test" meta={<LiveBadge paused={paused} />}
    actions={<Button variant="danger">Alle ausschalten</Button>} />
  <TileGrid>
    <ValueTile label="Eingangsspannung" value="11,58" unit="V" history={verlauf} />   {/* span 3 */}
    …
    <Tile span={8} title="Verlauf">…Diagramm…</Tile>
    <Tile span={4} title="Schaltfeld">
      <div className="cui-switch-grid">
        <SwitchTile title="CH0" on={an} onChange={setAn} value="0,42 A" />
      </div>
    </Tile>
    <Tile span={12} flush title="Leistungskanäle"><DataTable dense … /></Tile>
  </TileGrid>
</div>
```

Unter 960 px Containerbreite werden 3er/4er-Kacheln halb und 8er/9er ganz breit, unter 600 px stehen Werte-Kacheln zu zweit, alles andere untereinander.

## Diagramme

Diagramme sind zum Ablesen da, nicht zur Dekoration:

```tsx
<TimeChart
  series={[{ name: "I gesamt", values: verlauf }, { name: "I CH8", values: ch8 }]}
  yAxis={{ label: "Strom I", unit: "A" }}          // → "Strom I in A"
  xAxis={{ label: "Zeit t", unit: "s" }}           // Standard
  sampleInterval={1} window={60}                   // Achse fest −60 … 0 s
  includeZero                                      // bei Strom/Leistung sinnvoll
  limits={[{ value: 2, label: "I max", tone: "err" }]}
  bands={[{ from: 90, to: 110, tone: "ok" }]}      // Toleranzband
/>
```

- Achsentitel immer als „Größe Formelzeichen in Einheit“ (DIN 461), Zahlen mit Komma und echtem Minus (−).
- Y-Achse skaliert auf den Datenbereich; `includeZero` nur, wenn der Nullpunkt physikalisch relevant ist.
- Teilung 1-2-5, Nebenraster 4- bzw. 5-fach; Tooltip/Statistik zwei Stellen genauer als die Teilung.
- Farben der Kurven aus `--cui-chart-1 … 4`, Grenzwerte in Statusfarben.
- `Sparkline` nur für Tendenzen in Werte-Kacheln, nie als Ersatz für ein Diagramm.

## Regeln

1. Komponenten verwenden nur `--cui-*`-Tokens, keine festen Farben.
2. Pro Ansicht genau ein `primary`-Button.
3. Status immer mit Text, nie nur über Farbe.
4. KI-Inhalte (Werkzeugaufrufe, generierte Elemente) sind violett markiert (`tone="ai"`).
5. Klickziele mindestens 44 px auf Touch, sichtbarer Fokus, `prefers-reduced-motion` respektieren.
6. Ansichten bestehen aus `Toolbar` + `.cui-content`; Auswahl-Details gehören in den `Inspector`, nicht in Dialoge.
7. Schalten wirkt sofort; bei Massenaktionen („Alle ausschalten“) Rückgängig per Toast anbieten statt Bestätigungsdialog.
8. Laufend aktualisierte Werte mit `LiveBadge` kennzeichnen und anhaltbar machen.
9. Neue Bausteine zuerst in `demo/GalleryView.tsx` zeigen, dann in Projekten nutzen.

## Versionierung

Semantische Versionen mit Git-Tags (`v0.1.0`, `v0.2.0` …). Projekte pinnen eine Version, damit Änderungen an der Common UI sie nicht unbemerkt verändern.
