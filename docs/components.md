# Komponenten-Referenz `@ki/common-ui` v0.2.0

Alle Exporte aus `@ki/common-ui`. Props mit `?` sind optional. Regeln zur Verwendung: [`AGENTS.md`](../AGENTS.md).
Live ansehen: https://moechr.github.io/CommonUI/ (Seitenmenü → „Komponenten“).

```tsx
import "@ki/common-ui/style.css";
import { … } from "@ki/common-ui";
```

---

## Grundgerüst

### `ThemeProvider` / `useTheme()`
| Prop | Typ | |
|---|---|---|
| `defaultTheme?` | `"light" \| "dark" \| "system"` | Startwert, falls nichts gespeichert. Projekte: `"light"`. |
| `persist?` | `boolean` | Auswahl in `localStorage` merken (Standard `true`). |

`useTheme()` → `{ theme, resolved, setTheme }`. `resolved` ist immer `"light"` oder `"dark"`.

### `ThemeToggle`
Umschalter Hell | Dunkel mit Sonne/Mond. `variant?: "segmented" | "icon"` (Standard `segmented`; Text wird unter 900 px ausgeblendet).

### `ToastProvider` / `useToast()`
```tsx
const toast = useToast();
toast({ message: "Alle Kanäle ausgeschaltet", icon: "check", actionLabel: "Rückgängig", onAction: undo, duration: 6000 });
```

### `AppShell`
| Prop | Typ | |
|---|---|---|
| `titleBar?` | `ReactNode` | `<TitleBar/>` |
| `sidebar` | `ReactNode` | `<Sidebar/>` |
| `children` | `ReactNode` | `<Main/>` |
| `inspector?` | `ReactNode` | `<Inspector/>`; ohne Inspector wird die Spalte entfernt |
| `statusBar?` | `ReactNode` | `<StatusBar/>` |
| `defaultCollapsed?` | `boolean` | Seitenmenü eingeklappt starten (falls nichts gespeichert) |
| `framed?` | `boolean` | Rahmen + Schatten (eingebettete Vorschau) |

Elternelement braucht eine Höhe (`height: 100dvh`). Strg/⌘+B klappt das Menü ein/aus, Esc schließt das Overlay (Handy).
`useShell()` → `{ collapsed, setCollapsed, sidebarOpen, setSidebarOpen, toggleSidebar }`.

### `TitleBar`
`appName`, `logo?` (Standard: Initiale), `context?` (z. B. „Prüfstand A › Messung 0914“), `center?` (z. B. `SearchField`, nur bei Bedarf), `actions?`.
Enthält den Schalter fürs Seitenmenü.

### `Sidebar`, `NavSection`, `NavItem`
- `Sidebar`: `children`, `footer?` (eingeklappt ausgeblendet), `collapseToggle?` (Standard `true`).
- `NavSection`: `label` (eingeklappt als Trennlinie).
- `NavItem`: `icon: IconName`, `children: string`, `active?`, `badge?` (eingeklappt als Punkt), `onClick`.

### `Main`, `Toolbar`, `Inspector`, `StatusBar`, `StatusItem`
- `Main`: Hauptbereich (`<main>`), Inhalt meist `Toolbar` + `<div className="cui-content">`.
- `Toolbar`: `title?`, `status?`, `leading?` (z. B. `Tabs`), `actions?`.
- `Inspector`: `title?`, `actions?`, `children`. Unter 1060 px ausgeblendet.
- `StatusBar`: `children`, `trailing?`. `StatusItem`: `tone?: "ok" | "warn" | "err"` (Punkt), `children`.

### `Tabs`
`items: { id, label, icon?, dirty? }[]`, `activeId`, `onSelect(id)`, `onClose?(id)`, `onAdd?()`.

---

## Seiteninhalt & Kacheln

### `PageHeader`
`title`, `description?`, `meta?` (z. B. `<LiveBadge/>`), `actions?`.

### `LiveBadge`
`paused?: boolean`, `interval?: string` (Standard „1 s“). Zeigt „Live · 1 s“ (pulsierend) oder „Angehalten“.

### `TileGrid`, `Tile`
- `TileGrid`: 12-Spalten-Raster, Kacheln einer Zeile gleich hoch. Umbruch nach **Containerbreite**:
  < 960 px → span 3 halb, span 4/8/9 ganz; < 600 px → span 3 halb, alles andere ganz.
- `Tile`: `span?: 3 | 4 | 6 | 8 | 9 | 12` (Standard 6), `title?`, `subtitle?`, `actions?`, `flush?` (ohne Innenabstand, für Tabellen).

### `ValueTile`
`label`, `value: string` (bereits formatiert, z. B. `"11,58"`), `unit?`, `sub?`, `tone?: "ok" | "warn" | "err"` (färbt den Wert), `history?: number[]` (Sparkline), `span?` (Standard 3).

### `Panel`
Einfacher Kasten mit Rahmen (`div`-Props).

---

## Steuerung

### `Toggle`
Schalter ohne Zeile (Tabellen, Kacheln). `checked`, `onChange(checked)`, `label` (Pflicht, Screenreader), `disabled?`, `size?: "sm" | "md"`.

### `Switch`
Schalter-Zeile mit Text, ganze Zeile klickbar (44 px). `label`, `checked`, `onChange(checked)`.

### `SwitchTile`
Kachel im Schaltfeld. `title`, `on`, `onChange(on)`, `value?` (z. B. „0,42 A“), `fault?` (rot, „Störung“). In `<div className="cui-switch-grid">` setzen.

### `NumberField`
Sollwert mit − / +, Pfeiltasten, Komma-Eingabe. `value`, `onChange`, `label` (Pflicht), `min?`, `max?`, `step?`, `decimals?`, `unit?`, `disabled?`.

### `Led`
`on`, `tone?: "ok" | "warn" | "err" | "accent"`, `label?` (immer angeben, z. B. „High“), `pulse?`.

### `Slider`, `Segmented`
- `Slider`: `value: number`, `onChange(number)`, plus `min`/`max`/`step`.
- `Segmented<T>`: `options: { value, label }[]`, `value`, `onChange`, `aria-label` (Pflicht), `block?` (volle Breite).

---

## Daten

### `DataTable<T>`
| Prop | Typ | |
|---|---|---|
| `columns` | `Column<T>[]` | `{ key, header, render(row), numeric?, width? }` |
| `rows` | `T[]` | |
| `rowKey` | `(row) => string` | |
| `onRowClick?` | `(row) => void` | Zeile klickbar + Enter |
| `dense?` | `boolean` | kompakte Zeilen |
| `isRowDimmed?` | `(row) => boolean` | z. B. ausgeschaltete Kanäle |
| `minWidth?` | `number` | darunter horizontal scrollen (Standard 560) |
| `empty?` | `ReactNode` | statt Standard-Leerzustand |

**Live-Werte:** Sobald eine Spalte `width` hat, ist das Layout fest und springt nicht mehr. Allen Spalten außer der Namensspalte eine Breite geben.
Zusatzklassen in Zellen: `<span className="cui-sub">0x40</span>` (kleiner Zusatztext).

### `TimeChart`
| Prop | Typ | |
|---|---|---|
| `series` | `{ name, values: number[], color? }[]` | gleicher Abtastabstand, letzter Wert bei t = 0 |
| `yAxis` | `{ label, unit? }` | „Strom I“ + „A“ → „Strom I in A“ |
| `xAxis?` | `{ label, unit? }` | Standard „Zeit t“ in „s“ |
| `sampleInterval?` | `number` | Standard 1 |
| `window?` | `number` | sichtbares Fenster, Standard 60 (Achse −60 … 0) |
| `yDomain?` | `[min, max]` | feste Grenzen statt Autoskalierung |
| `includeZero?` | `boolean` | 0 einschließen (Strom, Leistung) |
| `limits?` | `{ value, label, tone? }[]` | gestrichelte Grenzlinien mit Beschriftung |
| `bands?` | `{ from, to, label?, tone? }[]` | Toleranzbänder |
| `height?` | `number` | Standard 240 |
| `stats?` | `boolean` | Min/Max/Mittel/Aktuell (Standard `true`) |
| `decimals?` | `number` | Stellen in Tooltip/Statistik (Standard: Teilung + 2) |

### `Sparkline`
`values`, `height?`, `tone?`, `area?`, `label?`. Nur Tendenz, keine Achsen.

### `KeyValue`, `Meter`
- `KeyValue`: `items: [ReactNode, ReactNode][]` (Bezeichnung, Wert rechtsbündig).
- `Meter`: `value`, `max?`, `label?`, `warnAt?` (0,75), `errorAt?` (0,9).

---

## Rückmeldung

- `Chip`: `tone?: "ok" | "warn" | "err" | "ai" | "neutral" | "accent"`, `dot?` (Standard `true`).
- `Banner`: `tone?: "info" | "ok" | "warn" | "err"`, `title?`, `action?`, `children`.
- `EmptyState`: `icon?`, `title`, `description?`, `action?`.
- `Kbd`, `Avatar` (`initials`).

## Formulare

- `Field`: `label`, `hint?`, `error?`, `children` (genau ein Eingabeelement; `id`/`aria-*` werden gesetzt).
- `Input`, `Select`, `Textarea`: normale HTML-Props.
- `SearchField`: `shortcut?` (Hinweis, z. B. „Strg K“), sonst Input-Props. Optional, kein fester Bestandteil.

## Buttons & Icons

- `Button`: `variant?: "primary" | "secondary" | "plain" | "danger"` (Standard `secondary`), `size?: "sm" | "md" | "lg"`, `icon?`, `loading?`.
- `IconButton`: `icon`, `label` (Pflicht, auch Tooltip).
- `Icon`: `name`, `size?`, `label?`. Namen (`iconNames`):
  `plus list search chart chip pen key bars share attach sparkle check info warning error close menu settings inbox send stop copy refresh sidebar chevronLeft chevronRight chevronDown home folder wave doc device bell filter download record bolt grid sun moon`

## Assistent / Chat

`Thread` (`autoScroll?`), `Message` (`role: "user" | "assistant" | "error"`, `author?`, `initials?`), `ToolCall` (`name`, `status?: "running" | "done" | "error"`, `meta?`, `detail?`), `Citation` (`n`, `title?`, `onClick?`), `TypingIndicator`, `Composer` (`onSubmit(text)`, `busy?`, `onStop?`, `onAttach?`, `attachments?`, `placeholder?`, `disabled?`).

## Text

`Text`: `variant?: "large" | "title1" | "title2" | "title3" | "headline" | "body" | "callout" | "caption" | "eyebrow"`, `as?`, `muted?`.

---

## CSS-Hilfsklassen

| Klasse | Zweck |
|---|---|
| `cui-content` | scrollender Inhaltsbereich in `Main` mit Innenabstand |
| `cui-stack` / `cui-cluster` / `cui-grid` | vertikal stapeln / waagerecht umbrechend / Kartenraster |
| `cui-switch-grid` | Raster für `SwitchTile` |
| `cui-section-title` | kleine Abschnittsüberschrift (Versalien) |
| `cui-sub` | kleiner Zusatztext in Tabellenzellen |
| `cui-hide-sm` | unter 720 px ausblenden |
| `cui-text-*` | Schriftskala ohne Komponente |

## Tokens (`src/styles/tokens.css`)

Farbe: `--cui-bg`, `--cui-surface`, `--cui-surface-2`, `--cui-fill`, `--cui-fill-hover`, `--cui-fg`, `--cui-fg-2`, `--cui-fg-3`, `--cui-line`,
`--cui-accent`, `--cui-accent-fg`, `--cui-accent-soft`, `--cui-accent-text`, `--cui-ok|warn|err|ai` (+ `-soft`), `--cui-err-text`,
`--cui-chart-1 … 4`, `--cui-grid-major`, `--cui-grid-minor`.
Schrift: `--cui-font`, `--cui-font-display`, `--cui-mono`, `--cui-t-large … --cui-t-caption`.
Abstand: `--cui-s1 … --cui-s7` (4, 8, 12, 16, 24, 32, 48 px). Radius: `--cui-r-s|m|l|pill`. Sonstiges: `--cui-shadow`, `--cui-hit` (44 px).
