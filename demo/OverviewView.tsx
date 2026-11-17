import { Toolbar, Panel, Chip, Meter, Button, Text, KeyValue } from "../src";
import { signals, signalState } from "./data";

export function OverviewView({ onOpen }: { onOpen: () => void }) {
  const issues = signals.filter((s) => signalState(s) !== "ok").length;
  const stat = (label: string, value: string, sub: string) => (
    <Panel style={{ gap: "var(--cui-s1)", padding: "var(--cui-s4)" }}>
      <span className="cui-section-title">{label}</span>
      <span style={{ font: "600 28px var(--cui-font-display)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
      <span className="cui-text-caption">{sub}</span>
    </Panel>
  );
  return (
    <>
      <Toolbar title="Übersicht" status={<Chip tone="neutral" dot={false}>Prüfstand A</Chip>} />
      <div className="cui-content">
        <div className="cui-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 200px), 1fr))" }}>
          {stat("Messungen heute", "3", "zuletzt 09:14")}
          {stat("Botschaften", "18 422", "trace_0914.blf")}
          {stat("Auffällig", String(issues), `von ${signals.length} Signalen`)}
          {stat("Bus-Last", "41 %", "CAN1 · 500 kBit/s")}
        </div>
        <div className="cui-grid">
          <Panel>
            <Text variant="headline">Letzte Messung</Text>
            <KeyValue items={[["Datei", "trace_0914.blf"], ["Dauer", "60,0 s"], ["Kanal", "CAN1"], ["Start", "09:14:00"]]} />
            <Button variant="primary" icon="wave" onClick={onOpen}>Messung öffnen</Button>
          </Panel>
          <Panel>
            <Text variant="headline">Geräte</Text>
            <div className="cui-stack" style={{ gap: "var(--cui-s3)" }}>
              <div className="cui-cluster" style={{ justifyContent: "space-between" }}><span>CAN-Interface 1</span><Chip tone="ok">Verbunden</Chip></div>
              <div className="cui-cluster" style={{ justifyContent: "space-between" }}><span>CAN-Interface 2</span><Chip tone="neutral">Getrennt</Chip></div>
              <div className="cui-cluster" style={{ justifyContent: "space-between" }}><span>Datenlogger</span><Chip tone="warn">Speicher fast voll</Chip></div>
            </div>
            <Meter value={86} max={100} label="Speicher Datenlogger" />
            <span className="cui-text-caption">Datenlogger 86 % belegt</span>
          </Panel>
        </div>
      </div>
    </>
  );
}
