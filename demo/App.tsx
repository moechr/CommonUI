import { useState } from "react";
import {
  AppShell, TitleBar, Sidebar, NavSection, NavItem, Main, Toolbar, Inspector, StatusBar, StatusItem,
  Chip, Avatar, Segmented, KeyValue, Button, IconButton, EmptyState, Switch,
  ThemeToggle, useTheme, type ThemeSetting, type IconName,
} from "../src";
import { ChatView } from "./ChatView";
import { GalleryView } from "./GalleryView";
import { MeasurementView } from "./MeasurementView";
import { OverviewView } from "./OverviewView";
import { HardwareView } from "./HardwareView";
import { signals, signalState, stateText, fmt, type Signal } from "./data";

type View = "hardware" | "overview" | "measurements" | "signals" | "reports" | "assistant" | "automation" | "devices" | "settings" | "components";

const placeholders: Partial<Record<View, { title: string; icon: IconName }>> = {
  signals: { title: "Signale", icon: "wave" },
  reports: { title: "Berichte", icon: "doc" },
  automation: { title: "Automationen", icon: "bolt" },
  devices: { title: "Geräte", icon: "device" },
};

export function App() {
  const [view, setView] = useState<View>("hardware");
  const [selected, setSelected] = useState<Signal>(signals[2]);
  const [alarm, setAlarm] = useState(true);
  const { theme, setTheme } = useTheme();

  const nav = (v: View, icon: IconName, label: string, badge?: number) => (
    <NavItem icon={icon} active={view === v} badge={badge} onClick={() => setView(v)}>{label}</NavItem>
  );

  const titleBar = (
    <TitleBar
      appName="Werkbank"
      context={view === "hardware" ? "Testboard A › Hardware-Test" : "Prüfstand A › trace_0914.blf"}
      actions={
        <>
          <ThemeToggle />
          <Button variant="primary" icon="record">Aufnahme</Button>
          <IconButton icon="sparkle" label="Assistent" className="cui-hide-sm" onClick={() => setView("assistant")} />
          <IconButton icon="bell" label="Mitteilungen" className="cui-hide-sm" />
          <Avatar initials="CM" className="cui-hide-sm" />
        </>
      }
    />
  );

  const sidebar = (
    <Sidebar footer={<>Lokal · v0.1</>}>
      <NavSection label="Arbeitsbereich">
        {nav("overview", "home", "Übersicht")}
        {nav("hardware", "chip", "Hardware-Test")}
        {nav("measurements", "folder", "Messungen", 3)}
        {nav("signals", "wave", "Signale")}
        {nav("reports", "doc", "Berichte")}
      </NavSection>
      <NavSection label="KI">
        {nav("assistant", "sparkle", "Assistent")}
        {nav("automation", "bolt", "Automationen")}
      </NavSection>
      <NavSection label="System">
        {nav("devices", "device", "Geräte")}
        {nav("settings", "settings", "Einstellungen")}
        {nav("components", "grid", "Komponenten")}
      </NavSection>
    </Sidebar>
  );

  const st = signalState(selected);
  const inspector = view === "measurements" ? (
    <Inspector title="Eigenschaften" actions={<Chip tone={st}>{stateText[st]}</Chip>}>
      <div className="cui-stack" style={{ gap: "var(--cui-s2)" }}>
        <span className="cui-section-title">Botschaft</span>
        <KeyValue items={[
          ["ID", <code key="id" style={{ fontFamily: "var(--cui-mono)" }}>{selected.id}</code>],
          ["Name", selected.name],
          ["Sender", selected.node],
          ["DLC", selected.dlc],
        ]} />
      </div>
      <div className="cui-stack" style={{ gap: "var(--cui-s2)" }}>
        <span className="cui-section-title">Timing</span>
        <KeyValue items={[
          ["Soll", `${fmt(selected.target, 0)} ms`],
          ["Ist (Mittel)", `${fmt(selected.actual)} ms`],
          ["Abweichung", `${selected.actual >= selected.target ? "+" : ""}${fmt(((selected.actual - selected.target) / selected.target) * 100)} %`],
          ["Anzahl", selected.count.toLocaleString("de-DE")],
        ]} />
      </div>
      <Switch label="Alarm bei Abweichung" checked={alarm} onChange={setAlarm} />
      <Button icon="sparkle" onClick={() => setView("assistant")}>Mit Assistent analysieren</Button>
    </Inspector>
  ) : undefined;

  const statusBar = (
    <StatusBar trailing={<span className="cui-hide-sm">v0.1</span>}>
      <StatusItem tone="ok">CAN1 · 500 kBit/s</StatusItem>
      <StatusItem>18 422 Botschaften</StatusItem>
      <span className="cui-hide-sm"><StatusItem>Auswahl: {selected.id}</StatusItem></span>
      <span className="cui-hide-sm"><StatusItem tone="warn">Logger 86 %</StatusItem></span>
    </StatusBar>
  );

  const ph = placeholders[view];

  return (
    <div style={{ height: "100dvh" }}>
      <AppShell titleBar={titleBar} sidebar={sidebar} inspector={inspector} statusBar={statusBar}>
        <Main>
          {view === "hardware" && <HardwareView />}
          {view === "overview" && <OverviewView onOpen={() => setView("measurements")} />}
          {view === "measurements" && (
            <MeasurementView selected={selected} onSelect={setSelected} onAskAssistant={() => setView("assistant")} />
          )}
          {view === "assistant" && (
            <>
              <Toolbar title="Assistent" status={<Chip tone="ai">claude-sonnet-5-5</Chip>} />
              <ChatView model="claude-sonnet-5-5" showCitations />
            </>
          )}
          {view === "components" && (
            <>
              <Toolbar title="Komponenten" status={<Chip tone="neutral" dot={false}>v0.1</Chip>} />
              <GalleryView />
            </>
          )}
          {view === "settings" && (
            <>
              <Toolbar title="Einstellungen" />
              <div className="cui-content" style={{ maxWidth: 560 }}>
                <span className="cui-section-title">Erscheinungsbild</span>
                <Segmented<ThemeSetting>
                  aria-label="Erscheinungsbild"
                  value={theme}
                  onChange={setTheme}
                  options={[{ value: "system", label: "Automatisch" }, { value: "light", label: "Hell" }, { value: "dark", label: "Dunkel" }]}
                />
                <span className="cui-text-caption">Seitenmenü ein- und ausklappen: Strg+B oder Schalter unten im Menü.</span>
              </div>
            </>
          )}
          {ph && (
            <>
              <Toolbar title={ph.title} />
              <div className="cui-content">
                <EmptyState icon={ph.icon} title={`${ph.title} – noch leer`} description="Diese Ansicht ist in der Demo nur ein Platzhalter." />
              </div>
            </>
          )}
        </Main>
      </AppShell>
    </div>
  );
}
