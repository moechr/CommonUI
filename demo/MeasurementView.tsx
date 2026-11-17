import { useMemo, useState } from "react";
import { Toolbar, Tabs, Segmented, Button, IconButton, Chip, DataTable, Panel, Banner, TimeChart, type Column, type TabItem, useToast } from "../src";
import { signals, signalState, stateText, series, fmt, type Signal } from "./data";

interface Props {
  selected: Signal;
  onSelect: (s: Signal) => void;
  onAskAssistant: () => void;
}

const initialTabs: TabItem[] = [
  { id: "t1", label: "trace_0914.blf", icon: "wave" },
  { id: "t2", label: "trace_0902.blf", icon: "wave" },
  { id: "t3", label: "Vergleich Prüfstand A", icon: "chart", dirty: true },
];

export function MeasurementView({ selected, onSelect, onAskAssistant }: Props) {
  const toast = useToast();
  const [tabs, setTabs] = useState(initialTabs);
  const [active, setActive] = useState("t1");
  const [filter, setFilter] = useState<"all" | "issues">("all");

  const rows = useMemo(
    () => (filter === "all" ? signals : signals.filter((s) => signalState(s) !== "ok")),
    [filter],
  );
  const issues = signals.filter((s) => signalState(s) !== "ok").length;

  const columns: Column<Signal>[] = [
    { key: "id", header: "ID", width: 80, render: (s) => <code style={{ fontFamily: "var(--cui-mono)", fontSize: 12 }}>{s.id}</code> },
    { key: "name", header: "Botschaft", render: (s) => <span style={{ fontWeight: s.id === selected.id ? 600 : 400 }}>{s.name}</span> },
    { key: "node", header: "Sender", width: 100, render: (s) => s.node },
    { key: "target", header: "Soll", numeric: true, width: 90, render: (s) => `${fmt(s.target, 0)} ms` },
    { key: "actual", header: "Ist", numeric: true, width: 90, render: (s) => `${fmt(s.actual)} ms` },
    { key: "state", header: "Status", width: 120, render: (s) => { const st = signalState(s); return <Chip tone={st}>{stateText[st]}</Chip>; } },
  ];

  const close = (id: string) => {
    const next = tabs.filter((t) => t.id !== id);
    setTabs(next);
    if (id === active && next[0]) setActive(next[0].id);
  };

  return (
    <>
      <Toolbar
        leading={
          <Tabs
            items={tabs}
            activeId={active}
            onSelect={setActive}
            onClose={close}
            onAdd={() => {
              const id = `t${Date.now()}`;
              setTabs((t) => [...t, { id, label: "Neue Messung", icon: "wave" }]);
              setActive(id);
            }}
          />
        }
        actions={
          <>
            <IconButton icon="refresh" label="Neu laden" />
            <IconButton icon="download" label="Exportieren" onClick={() => toast({ message: "Export als CSV gestartet", icon: "download" })} />
          </>
        }
      />
      <div className="cui-content">
        {issues > 0 && (
          <Banner
            tone="warn"
            title={`${issues} Botschaften weichen von der Soll-Zykluszeit ab`}
            action={<Button size="sm" icon="sparkle" onClick={onAskAssistant}>Analysieren</Button>}
          >
            Größte Abweichung bei 0x1A0 EngineStatus ab 09:14:32.
          </Banner>
        )}

        <Panel style={{ padding: "var(--cui-s4)" }}>
          <div className="cui-cluster" style={{ justifyContent: "space-between" }}>
            <div>
              <span className="cui-section-title">Zykluszeit</span>
              <div style={{ fontWeight: 600 }}>{selected.id} {selected.name}</div>
            </div>
            <div className="cui-cluster">
              <Chip tone={signalState(selected)}>{stateText[signalState(selected)]}</Chip>
              <span className="cui-text-caption">letzte 60 s</span>
            </div>
          </div>
          <TimeChart
            series={[{ name: `T ${selected.id}`, values: series(selected), color: `var(--cui-${signalState(selected) === "ok" ? "chart-1" : signalState(selected)})` }]}
            yAxis={{ label: "Zykluszeit T", unit: "ms" }}
            limits={[{ value: selected.target, label: "T soll", tone: "ok" }]}
            bands={[{ from: selected.target * 0.9, to: selected.target * 1.1, tone: "ok" }]}
            height={240}
          />
        </Panel>

        <div className="cui-cluster" style={{ justifyContent: "space-between" }}>
          <span className="cui-section-title">Botschaften · {rows.length}</span>
          <Segmented
            aria-label="Filter"
            value={filter}
            onChange={setFilter}
            options={[{ value: "all", label: "Alle" }, { value: "issues", label: `Auffällig (${issues})` }]}
          />
        </div>
        <DataTable columns={columns} rows={rows} rowKey={(s) => s.id} onRowClick={onSelect} />
      </div>
    </>
  );
}
