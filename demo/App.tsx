import { useState } from "react";
import {
  AppShell, Sidebar, NavSection, NavItem, Main, Toolbar, Inspector,
  Chip, Kbd, Avatar, Segmented, Field, Select, Slider, Switch, Meter, KeyValue, Button, IconButton,
  useTheme, type ThemeSetting,
} from "../src";
import { ChatView } from "./ChatView";
import { GalleryView } from "./GalleryView";

type View = "chat" | "gallery";

export function App() {
  const [view, setView] = useState<View>("chat");
  const [model, setModel] = useState("claude-sonnet-5-5");
  const [temp, setTemp] = useState(0.3);
  const [tools, setTools] = useState(true);
  const [cites, setCites] = useState(true);
  const { theme, setTheme } = useTheme();

  const sidebar = (
    <Sidebar
      title="Werkbank"
      headerAction={<IconButton icon="plus" label="Neuer Chat" />}
      footer={<><Avatar initials="CM" />Lokal · v0.1<span className="cui-spacer" /><Kbd>Strg K</Kbd></>}
    >
      <NavSection label="Projekte">
        <NavItem icon="list" badge={12} active={view === "chat"} onClick={() => setView("chat")}>Protokoll-Analyse</NavItem>
        <NavItem icon="search" badge={4}>Doku-Suche (RAG)</NavItem>
        <NavItem icon="chart" badge={7}>Messdaten-Agent</NavItem>
        <NavItem icon="chip">Smart-Home-Assistent</NavItem>
      </NavSection>
      <NavSection label="Werkzeuge">
        <NavItem icon="pen">Prompts</NavItem>
        <NavItem icon="key">Modelle &amp; Schlüssel</NavItem>
        <NavItem icon="settings" active={view === "gallery"} onClick={() => setView("gallery")}>Komponenten</NavItem>
      </NavSection>
      <div style={{ padding: "var(--cui-s3)" }}>
        <Segmented<ThemeSetting>
          aria-label="Erscheinungsbild"
          block
          value={theme}
          onChange={setTheme}
          options={[{ value: "system", label: "Auto" }, { value: "light", label: "Hell" }, { value: "dark", label: "Dunkel" }]}
        />
      </div>
    </Sidebar>
  );

  const inspector = view === "chat" ? (
    <Inspector title="Lauf">
      <Field label="Modell">
        <Select value={model} onChange={(e) => setModel(e.target.value)}>
          <option>claude-sonnet-5-5</option>
          <option>claude-opus-5-5</option>
          <option>claude-haiku-5-5</option>
          <option>lokal · llama</option>
        </Select>
      </Field>
      <Field label={`Temperatur · ${temp.toFixed(1).replace(".", ",")}`}>
        <Slider min={0} max={1} step={0.1} value={temp} onChange={setTemp} />
      </Field>
      <Switch label="Werkzeuge erlauben" checked={tools} onChange={setTools} />
      <Switch label="Quellen anzeigen" checked={cites} onChange={setCites} />
      <Field label="Kontext · 38 k von 200 k Token">
        <Meter value={38} max={200} label="Kontextauslastung" />
      </Field>
      <KeyValue items={[["Laufzeit", "4,2 s"], ["Eingabe", "38 214 Tok"], ["Ausgabe", "612 Tok"], ["Kosten", "0,12 €"]]} />
      <Button variant="secondary">Als Vorlage speichern</Button>
    </Inspector>
  ) : undefined;

  return (
    <div style={{ height: "100dvh" }}>
      <AppShell sidebar={sidebar} inspector={inspector}>
        <Main>
          {view === "chat" ? (
            <>
              <Toolbar
                title="CAN-Trace auswerten"
                status={<Chip tone="ok">Verbunden</Chip>}
                actions={<IconButton icon="share" label="Teilen" />}
              />
              <ChatView model={model} showCitations={cites} />
            </>
          ) : (
            <>
              <Toolbar title="Komponenten" status={<Chip tone="neutral">v0.1</Chip>} />
              <GalleryView />
            </>
          )}
        </Main>
      </AppShell>
    </div>
  );
}
