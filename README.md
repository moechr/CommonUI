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
| `src/shell/` | AppShell, TitleBar, Sidebar (einklappbar), NavSection, NavItem, Main, Toolbar, Inspector, StatusBar, StatusItem, useShell |
| `src/chat/` | Thread, Message, ToolCall, Citation, TypingIndicator, Composer (für eine Assistent-Ansicht) |
| `src/theme.tsx` | ThemeProvider + useTheme (System / Hell / Dunkel) |
| `demo/` | Beispiel-Anwendung „Werkbank“: Übersicht, Messungen (Tabs, Diagramm, Tabelle, Inspector), Assistent, Komponenten-Galerie |
| `docs/mockup.html` | Ursprünglicher HTML-Entwurf (ohne Build im Browser öffnen) |

## Regeln

1. Komponenten verwenden nur `--cui-*`-Tokens, keine festen Farben.
2. Pro Ansicht genau ein `primary`-Button.
3. Status immer mit Text, nie nur über Farbe.
4. KI-Inhalte (Werkzeugaufrufe, generierte Elemente) sind violett markiert (`tone="ai"`).
5. Klickziele mindestens 44 px auf Touch, sichtbarer Fokus, `prefers-reduced-motion` respektieren.
6. Ansichten bestehen aus `Toolbar` + `.cui-content`; Auswahl-Details gehören in den `Inspector`, nicht in Dialoge.
7. Neue Bausteine zuerst in `demo/GalleryView.tsx` zeigen, dann in Projekten nutzen.

## Versionierung

Semantische Versionen mit Git-Tags (`v0.1.0`, `v0.2.0` …). Projekte pinnen eine Version, damit Änderungen an der Common UI sie nicht unbemerkt verändern.
