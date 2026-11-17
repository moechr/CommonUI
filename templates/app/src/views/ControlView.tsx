import { useEffect, useRef, useState } from "react";
import {
  PageHeader, LiveBadge, TileGrid, Tile, ValueTile, SwitchTile, Toggle, TimeChart, DataTable, Chip, Button,
  useToast, type Column,
} from "@ki/common-ui";

/* Beispiel-Steueransicht. Die Werte sind simuliert:
   readDevice() durch den echten Datenzugriff ersetzen (REST, WebSocket, Web Serial …). */

interface Output { name: string; on: boolean; current: number }

const fmt = (n: number, d: number) =>
  n.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d }).replace("-", "−");

function readDevice(outputs: Output[]): Output[] {
  return outputs.map((o, i) => ({ ...o, current: o.on ? 0.3 + i * 0.25 + (Math.random() - 0.5) * 0.04 : 0 }));
}

export function ControlView() {
  const toast = useToast();
  const [paused, setPaused] = useState(false);
  const [outputs, setOutputs] = useState<Output[]>(
    ["OUT0", "OUT1", "OUT2", "OUT3"].map((name, i) => ({ name, on: i < 2, current: 0 })),
  );
  const [history, setHistory] = useState<number[]>([]);
  const outputsRef = useRef(outputs);
  outputsRef.current = outputs;

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      const next = readDevice(outputsRef.current);
      setOutputs(next);
      setHistory((h) => [...h.slice(-59), next.reduce((a, x) => a + x.current, 0)]);
    }, 1000);
    return () => window.clearInterval(id);
  }, [paused]);

  const set = (i: number, on: boolean) => setOutputs((o) => o.map((x, k) => (k === i ? { ...x, on } : x)));
  const allOff = () => {
    const before = outputs;
    setOutputs((o) => o.map((x) => ({ ...x, on: false })));
    toast({ message: "Alle Ausgänge ausgeschaltet", icon: "check", actionLabel: "Rückgängig", onAction: () => setOutputs(before) });
  };

  const total = outputs.reduce((a, x) => a + x.current, 0);
  const columns: Column<Output & { i: number }>[] = [
    { key: "n", header: "Ausgang", render: (o) => <b>{o.name}</b> },
    { key: "s", header: "Schalter", width: 104, render: (o) => <Toggle size="sm" checked={o.on} onChange={(v) => set(o.i, v)} label={`${o.name} schalten`} /> },
    { key: "i", header: "Strom", numeric: true, width: 100, render: (o) => `${fmt(o.current, 3)} A` },
    { key: "z", header: "Zustand", width: 100, render: (o) => (o.on ? <Chip tone="ok">Ein</Chip> : <Chip tone="neutral">Aus</Chip>) },
  ];

  return (
    <div className="cui-content">
      <PageHeader
        title="Steuerung"
        description="Beispielansicht aus der Startvorlage – durch die eigene Ansicht ersetzen."
        meta={<LiveBadge paused={paused} />}
        actions={
          <>
            <Button icon={paused ? "refresh" : "stop"} onClick={() => setPaused((p) => !p)}>
              {paused ? "Aktualisierung fortsetzen" : "Aktualisierung anhalten"}
            </Button>
            <Button variant="danger" icon="close" onClick={allOff}>Alle ausschalten</Button>
          </>
        }
      />
      <TileGrid>
        <ValueTile label="Gesamtstrom" value={fmt(total, 2)} unit="A" history={history} />
        <ValueTile label="Aktive Ausgänge" value={String(outputs.filter((o) => o.on).length)} sub={`von ${outputs.length}`} />
        <Tile span={6} title="Schaltfeld">
          <div className="cui-switch-grid">
            {outputs.map((o, i) => (
              <SwitchTile key={o.name} title={o.name} on={o.on} onChange={(v) => set(i, v)} value={o.on ? `${fmt(o.current, 2)} A` : "–"} />
            ))}
          </div>
        </Tile>
        <Tile span={12} title="Verlauf Gesamtstrom" subtitle="Abtastung 1 s, Fenster 60 s">
          <TimeChart series={[{ name: "I gesamt", values: history }]} yAxis={{ label: "Strom I", unit: "A" }} includeZero
            limits={[{ value: 2, label: "I max", tone: "err" }]} />
        </Tile>
        <Tile span={12} flush title="Ausgänge">
          <DataTable dense columns={columns} rows={outputs.map((o, i) => ({ ...o, i }))} rowKey={(o) => o.name} isRowDimmed={(o) => !o.on} />
        </Tile>
      </TileGrid>
    </div>
  );
}
