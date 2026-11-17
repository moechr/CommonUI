import { useEffect, useMemo, useRef, useState } from "react";
import {
  PageHeader, LiveBadge, TileGrid, Tile, ValueTile, SwitchTile, Toggle, Led, NumberField, Segmented,
  Button, Chip, DataTable, TimeChart, useToast, type Column, type ChartSeries, type ChartLimit,
} from "../src";
import { fmt } from "./data";

/* Simuliertes Testboard: 10 schaltbare Leistungskanäle, Versorgungen, digitale Eingänge.
   In einem echten Projekt kommen die Werte z. B. per WebSocket/REST vom Gerät. */

const N = 10;
const HISTORY = 60;
const baseCurrent = [0.42, 0.85, 1.2, 0.3, 0.66, 1.05, 0.18, 0.92, 1.4, 0.55];

interface Channel { on: boolean; fault: boolean }
interface Reading { v: number; i: number; p: number; t: number }

const noise = (a: number) => (Math.random() - 0.5) * 2 * a;

function measure(ch: Channel[], k: number): Reading[] {
  return ch.map((c, n) => {
    const on = c.on && !c.fault;
    const v = on ? 11.5 + noise(0.04) : Math.abs(noise(0.01));
    // Kanal 8 zieht langsam mehr Strom, um die Abschaltung zeigen zu können
    const drift = n === 8 ? Math.min(0.9, k * 0.012) : 0;
    const i = on ? baseCurrent[n] + drift + noise(0.03) : noise(0.005);
    return { v, i, p: Math.max(0, v * i), t: 24.4 + (on ? Math.abs(i) * 4.5 : 0) + noise(0.2) };
  });
}

const push = (arr: number[], v: number) => [...arr.slice(-(HISTORY - 1)), v];

export function HardwareView() {
  const toast = useToast();
  const [paused, setPaused] = useState(false);
  const [channels, setChannels] = useState<Channel[]>(() => baseCurrent.map((_, n) => ({ on: n !== 2 && n !== 5, fault: false })));
  const [limit, setLimit] = useState(2.0);
  const [metric, setMetric] = useState<"p" | "i" | "v">("p");
  const tick = useRef(0);
  const [readings, setReadings] = useState<Reading[]>(() => measure(channels, 0));
  const [hist, setHist] = useState({ v: [] as number[], i: [] as number[], p: [] as number[], t: [] as number[], ch8: [] as number[] });
  const [inputs, setInputs] = useState({ estop: false, door: true, ready: true, ext: false });

  const chRef = useRef(channels);
  chRef.current = channels;
  const limitRef = useRef(limit);
  limitRef.current = limit;

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      tick.current += 1;
      const r = measure(chRef.current, tick.current);
      // Überstrom: Kanal abschalten und Störung melden
      const tripped = r.map((x, n) => chRef.current[n].on && !chRef.current[n].fault && x.i > limitRef.current);
      if (tripped.some(Boolean)) {
        setChannels((cs) => cs.map((c, n) => (tripped[n] ? { ...c, fault: true } : c)));
        tripped.forEach((t, n) => t && toast({ message: `CH${n} wegen Überstrom abgeschaltet`, icon: "warning" }));
      }
      setReadings(r);
      const iSum = r.reduce((a, x) => a + Math.max(0, x.i), 0) + 0.062;
      const vIn = 11.62 - iSum * 0.012 + noise(0.01);
      setHist((h) => ({
        v: push(h.v, vIn), i: push(h.i, iSum), p: push(h.p, vIn * iSum), t: push(h.t, Math.max(...r.map((x) => x.t))), ch8: push(h.ch8, r[8].i),
      }));
      if (tick.current % 7 === 0) setInputs((s) => ({ ...s, ext: !s.ext }));
    }, 1000);
    return () => window.clearInterval(id);
  }, [paused, toast]);

  const setOn = (n: number, on: boolean) =>
    setChannels((cs) => cs.map((c, k) => (k === n ? { on, fault: false } : c)));

  const allOff = () => {
    const before = channels;
    setChannels((cs) => cs.map(() => ({ on: false, fault: false })));
    toast({ message: "Alle Kanäle ausgeschaltet", icon: "check", actionLabel: "Rückgängig", onAction: () => setChannels(before), duration: 6000 });
  };

  const last = (a: number[], d = 0) => (a.length ? a[a.length - 1] : d);
  const vIn = last(hist.v, 11.6), iSum = last(hist.i), pSum = last(hist.p), tMax = last(hist.t, 25);
  const active = channels.filter((c) => c.on && !c.fault).length;
  const faults = channels.filter((c) => c.fault).length;

  type Row = { n: number; c: Channel; r: Reading };
  const rows: Row[] = useMemo(() => channels.map((c, n) => ({ n, c, r: readings[n] })), [channels, readings]);
  const columns: Column<Row>[] = [
    { key: "ch", header: "Kanal", width: 110, render: ({ n }) => <><b>CH{n}</b><span className="cui-sub">0x{(0x40 + n).toString(16)}</span></> },
    { key: "sw", header: "Schalter", width: 104, render: ({ n, c }) => <Toggle size="sm" checked={c.on && !c.fault} onChange={(v) => setOn(n, v)} label={`CH${n} schalten`} /> },
    { key: "v", header: "Spannung", numeric: true, width: 100, render: ({ r }) => `${fmt(r.v, 2)} V` },
    { key: "i", header: "Strom", numeric: true, width: 100, render: ({ r }) => `${fmt(r.i, 3)} A` },
    { key: "p", header: "Leistung", numeric: true, width: 100, render: ({ r }) => `${fmt(r.p, 2)} W` },
    { key: "t", header: "Temperatur", numeric: true, width: 110, render: ({ r }) => `${fmt(r.t)} °C` },
    {
      key: "s", header: "Messung", width: 120, render: ({ c }) =>
        c.fault ? <Chip tone="err">Überstrom</Chip> : c.on ? <Chip tone="ok">OK</Chip> : <Chip tone="neutral">Aus</Chip>,
    },
  ];

  const supplies = [
    { name: "VIN", desc: "Eingang", v: vIn, min: 10.5, max: 13.0 },
    { name: "5V0", desc: "Logik", v: 5.02 + noise(0.01), min: 4.85, max: 5.15 },
    { name: "3V3", desc: "Controller", v: 3.31 + noise(0.005), min: 3.2, max: 3.4 },
    { name: "AIN0", desc: "Temperaturfühler", v: 1.24 + noise(0.01), min: 0, max: 3.3 },
    { name: "AIN1", desc: "Drucksensor", v: 2.71 + noise(0.02), min: 0.5, max: 2.5 },
  ];

  const chart: { title: string; axis: { label: string; unit: string }; series: ChartSeries[]; limits?: ChartLimit[]; zero?: boolean } =
    metric === "p"
      ? { title: "Leistung", axis: { label: "Leistung P", unit: "W" }, series: [{ name: "P gesamt", values: hist.p }], zero: true }
      : metric === "i"
        ? {
            title: "Strom", axis: { label: "Strom I", unit: "A" }, zero: true,
            series: [{ name: "I gesamt", values: hist.i }, { name: "I CH8", values: hist.ch8 }],
            limits: [{ value: limit, label: "I max je Kanal", tone: "err" }],
          }
        : {
            title: "Eingangsspannung", axis: { label: "Spannung U", unit: "V" },
            series: [{ name: "U VIN", values: hist.v }],
            limits: [{ value: 10.5, label: "U min", tone: "warn" }, { value: 13.0, label: "U max", tone: "warn" }],
          };

  return (
    <div className="cui-content" style={{ gap: "var(--cui-s5)" }}>
      <PageHeader
        title="Hardware-Test"
        meta={<LiveBadge paused={paused} />}
        description="Testboard A · 10 schaltbare Leistungskanäle, Messung je Kanal über Strommess-IC an I²C"
        actions={
          <>
            <Button icon={paused ? "refresh" : "stop"} onClick={() => setPaused((p) => !p)}>
              {paused ? "Aktualisierung fortsetzen" : "Aktualisierung anhalten"}
            </Button>
            <Button variant="danger" icon="close" onClick={allOff} disabled={active === 0}>Alle ausschalten</Button>
          </>
        }
      />

      <TileGrid>
        <ValueTile label="Eingangsspannung" value={fmt(vIn, 2)} unit="V" sub="Bereich 10,5 – 13,0 V" history={hist.v} />
        <ValueTile label="Gesamtstrom" value={fmt(iSum, 2)} unit="A" sub={`${active} von ${N} Kanälen aktiv`} history={hist.i} />
        <ValueTile label="Leistung" value={fmt(pSum, 1)} unit="W" sub="Summe aller Kanäle" history={hist.p} />
        <ValueTile
          label="Max. Temperatur"
          value={fmt(tMax)}
          unit="°C"
          sub={tMax > 30 ? "Über 30 °C" : "Unauffällig"}
          tone={tMax > 30 ? "warn" : undefined}
          history={hist.t}
        />

        <Tile
          span={8}
          title={`Verlauf ${chart.title}`}
          subtitle="Abtastung 1 s, Fenster 60 s"
          actions={
            <Segmented aria-label="Messgröße" value={metric} onChange={setMetric}
              options={[{ value: "p", label: "Leistung" }, { value: "i", label: "Strom" }, { value: "v", label: "Spannung" }]} />
          }
        >
          <TimeChart series={chart.series} yAxis={chart.axis} limits={chart.limits} includeZero={chart.zero} height={230} />
        </Tile>

        <Tile
          span={4}
          title="Schaltfeld"
          subtitle={faults ? `${faults} Kanal mit Störung` : "Kanal antippen zum Schalten"}
          actions={faults ? <Chip tone="err">{faults} Störung</Chip> : undefined}
        >
          <div className="cui-switch-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))" }}>
            {channels.map((c, n) => (
              <SwitchTile
                key={n}
                title={`CH${n}`}
                on={c.on}
                fault={c.fault}
                onChange={(v) => setOn(n, v)}
                value={c.on && !c.fault ? `${fmt(readings[n].i, 2)} A` : "–"}
              />
            ))}
          </div>
          <div className="cui-cluster" style={{ justifyContent: "space-between" }}>
            <span className="cui-text-callout">Abschaltgrenze je Kanal</span>
            <NumberField label="Abschaltgrenze" value={limit} onChange={setLimit} min={0.5} max={5} step={0.1} decimals={1} unit="A" />
          </div>
        </Tile>

        <Tile span={12} flush title="Leistungskanäle" subtitle="EN_PWR_CH0 bis CH9, Strommessung je Kanal">
          <DataTable dense columns={columns} rows={rows} rowKey={(x) => String(x.n)} isRowDimmed={(x) => !x.c.on} minWidth={640} />
        </Tile>

        <Tile span={6} flush title="Versorgungen und Analogeingänge" subtitle="ADC über Spannungsteiler">
          <DataTable
            dense
            minWidth={360}
            rows={supplies}
            rowKey={(s) => s.name}
            columns={[
              { key: "n", header: "Eingang", render: (s) => <><b>{s.name}</b><span className="cui-sub">{s.desc}</span></> },
              { key: "v", header: "Spannung", numeric: true, width: 96, render: (s) => `${fmt(s.v, 2)} V` },
              {
                key: "s", header: "Bereich", width: 110, render: (s) =>
                  s.v < s.min || s.v > s.max ? <Chip tone="warn">Außerhalb</Chip> : <Chip tone="ok">OK</Chip>,
              },
            ]}
          />
        </Tile>

        <Tile span={6} flush title="Digitale Eingänge" subtitle="Pegel am Controller-Pin">
          <DataTable
            dense
            minWidth={360}
            rowKey={(s) => s.name}
            rows={[
              { name: "NOT_AUS", desc: "Not-Aus-Kreis", high: !inputs.estop, state: inputs.estop ? "Ausgelöst" : "Geschlossen", tone: inputs.estop ? "err" : "ok" },
              { name: "DOOR", desc: "Tür Prüfstand", high: inputs.door, state: inputs.door ? "Zu" : "Offen", tone: inputs.door ? "ok" : "warn" },
              { name: "READY", desc: "Netzteil bereit", high: inputs.ready, state: inputs.ready ? "Bereit" : "Nicht bereit", tone: "ok" },
              { name: "EXT_TRIG", desc: "Externer Trigger", high: inputs.ext, state: inputs.ext ? "Aktiv" : "Inaktiv", tone: "accent" },
            ] as const}
            columns={[
              { key: "n", header: "Signal", render: (s) => <><b>{s.name}</b><span className="cui-sub">{s.desc}</span></> },
              { key: "p", header: "Pegel", width: 90, render: (s) => <Led on={s.high} tone={s.tone === "err" ? "err" : s.tone === "accent" ? "accent" : "ok"} label={s.high ? "High" : "Low"} /> },
              { key: "z", header: "Zustand", width: 110, render: (s) => s.state },
            ]}
          />
        </Tile>
      </TileGrid>
    </div>
  );
}
