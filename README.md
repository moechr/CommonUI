# @ki/common-ui

Gemeinsame React-Oberfläche für alle KI-Projekte im Browser.
Tokens, App-Shell, Chat- und Formular-Komponenten, hell und dunkel, angelehnt an Apples Human Interface Guidelines.

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
  ThemeProvider, ToastProvider, AppShell, Sidebar, NavSection, NavItem,
  Main, Toolbar, Thread, Message, Composer, Chip,
} from "@ki/common-ui";

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <div style={{ height: "100dvh" }}>
          <AppShell sidebar={<Sidebar title="Mein Tool"><NavSection label="Projekte"><NavItem icon="list" active>Start</NavItem></NavSection></Sidebar>}>
            <Main>
              <Toolbar title="Neuer Chat" status={<Chip tone="ok">Verbunden</Chip>} />
              <Thread><Message role="assistant"><p>Hallo!</p></Message></Thread>
              <Composer onSubmit={(t) => console.log(t)} />
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
| `src/components/` | Button, IconButton, Icon, Text, Chip, Meter, KeyValue, Panel, Banner, EmptyState, Field, Input, Select, Textarea, Switch, Slider, Segmented, DataTable, Toast |
| `src/shell/` | AppShell, Sidebar, NavSection, NavItem, Main, Toolbar, Inspector |
| `src/chat/` | Thread, Message, ToolCall, Citation, TypingIndicator, Composer |
| `src/theme.tsx` | ThemeProvider + useTheme (System / Hell / Dunkel) |
| `demo/` | Beispiel-App: Chat-Ansicht und Komponenten-Galerie |
| `docs/mockup.html` | Ursprünglicher HTML-Entwurf (ohne Build im Browser öffnen) |

## Regeln

1. Komponenten verwenden nur `--cui-*`-Tokens, keine festen Farben.
2. Pro Ansicht genau ein `primary`-Button.
3. Status immer mit Text, nie nur über Farbe.
4. KI-Inhalte (Werkzeugaufrufe, generierte Elemente) sind violett markiert (`tone="ai"`).
5. Klickziele mindestens 44 px auf Touch, sichtbarer Fokus, `prefers-reduced-motion` respektieren.
6. Neue Bausteine zuerst in `demo/GalleryView.tsx` zeigen, dann in Projekten nutzen.

## Versionierung

Semantische Versionen mit Git-Tags (`v0.1.0`, `v0.2.0` …). Projekte pinnen eine Version, damit Änderungen an der Common UI sie nicht unbemerkt verändern.
