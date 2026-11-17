import { useState } from "react";
import {
  AppShell, TitleBar, Sidebar, NavSection, NavItem, Main, Toolbar, StatusBar, StatusItem,
  ThemeToggle, EmptyState, type IconName,
} from "@ki/common-ui";
import { ControlView } from "./views/ControlView";

// Ansichten des Projekts. Neue Ansicht: hier eintragen, in der Sidebar verlinken, unten rendern.
type View = "control" | "settings";

const views: Record<View, { label: string; icon: IconName }> = {
  control: { label: "Steuerung", icon: "chip" },
  settings: { label: "Einstellungen", icon: "settings" },
};

export function App() {
  const [view, setView] = useState<View>("control");

  return (
    <div style={{ height: "100dvh" }}>
      <AppShell
        titleBar={<TitleBar appName="Mein Tool" context={views[view].label} actions={<ThemeToggle />} />}
        sidebar={
          <Sidebar footer="v0.1.0">
            <NavSection label="Arbeitsbereich">
              {(Object.keys(views) as View[]).map((v) => (
                <NavItem key={v} icon={views[v].icon} active={view === v} onClick={() => setView(v)}>
                  {views[v].label}
                </NavItem>
              ))}
            </NavSection>
          </Sidebar>
        }
        statusBar={
          <StatusBar trailing="v0.1.0">
            <StatusItem tone="ok">Verbunden</StatusItem>
          </StatusBar>
        }
      >
        <Main>
          {view === "control" && <ControlView />}
          {view === "settings" && (
            <>
              <Toolbar title="Einstellungen" />
              <div className="cui-content">
                <EmptyState icon="settings" title="Noch keine Einstellungen" description="Hier kommen die Einstellungen des Projekts hin." />
              </div>
            </>
          )}
        </Main>
      </AppShell>
    </div>
  );
}
