import { useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { cx } from "../utils";

/* Technisches Zeitdiagramm (SVG).
   - Achsentitel nach DIN 461: "Größe Formelzeichen in Einheit", z. B. "Leistung P in W"
   - Haupt- und Nebenraster, Teilung nach 1-2-5-Reihe, Nachkommastellen aus der Schrittweite
   - Y-Achse automatisch auf den Datenbereich (optional mit 0), Zeitachse fest (z. B. −60 … 0 s)
   - Grenzlinien und Toleranzbänder, Fadenkreuz mit Messwerten, Statistik
   Gezeichnet in echter Pixelbreite (ResizeObserver), dadurch keine verzerrte Schrift. */

export interface ChartSeries {
  name: string;
  /** Werte im festen Abtastabstand; der letzte Wert liegt bei t = 0. */
  values: number[];
  /** CSS-Farbe; Standard aus --cui-chart-1 … 4. */
  color?: string;
}

export interface ChartAxis {
  /** Größe und Formelzeichen, z. B. "Leistung P". */
  label: string;
  /** Einheit, z. B. "W". Leer lassen bei dimensionslosen Größen. */
  unit?: string;
}

export interface ChartLimit {
  value: number;
  label: string;
  tone?: "ok" | "warn" | "err";
}

export interface ChartBand {
  from: number;
  to: number;
  label?: string;
  tone?: "ok" | "warn" | "err";
}

export interface TimeChartProps {
  series: ChartSeries[];
  yAxis: ChartAxis;
  xAxis?: ChartAxis;
  /** Abtastabstand in Einheiten der X-Achse (Standard 1 s). */
  sampleInterval?: number;
  /** Sichtbares Zeitfenster (Standard 60). */
  window?: number;
  /** Feste Y-Grenzen statt Autoskalierung. */
  yDomain?: [number, number];
  /** 0 in den Y-Bereich aufnehmen (z. B. bei Strom/Leistung). */
  includeZero?: boolean;
  limits?: ChartLimit[];
  bands?: ChartBand[];
  height?: number;
  /** Min/Max/Mittel/Aktuell unter dem Diagramm (Standard: ja). */
  stats?: boolean;
  /** Nachkommastellen in Tooltip/Statistik (Standard: Y-Teilung + 2). */
  decimals?: number;
  className?: string;
}

/* ---------- Teilung ---------- */
interface Scale { min: number; max: number; step: number; minor: number; decimals: number }

function niceScale(lo: number, hi: number, targetTicks: number): Scale {
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) { lo = 0; hi = 1; }
  if (hi - lo < 1e-12) { const d = Math.abs(hi) * 0.05 || 1; lo -= d; hi += d; }
  const raw = (hi - lo) / Math.max(2, targetTicks);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / mag;
  const norm = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10;
  const step = norm * mag;
  const minorDiv = norm === 2 ? 4 : 5;
  const decimals = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
  return { min: Math.floor(lo / step + 1e-9) * step, max: Math.ceil(hi / step - 1e-9) * step, step, minor: step / minorDiv, decimals };
}

function ticks(min: number, max: number, step: number): number[] {
  const out: number[] = [];
  const n = Math.round((max - min) / step);
  for (let i = 0; i <= n; i++) out.push(+(min + i * step).toPrecision(12));
  return out;
}

const fmt = (v: number, d: number) =>
  v.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d }).replace("-", "−");

const axisTitle = (a: ChartAxis) => (a.unit ? `${a.label} in ${a.unit}` : a.label);

const palette = ["var(--cui-chart-1)", "var(--cui-chart-2)", "var(--cui-chart-3)", "var(--cui-chart-4)"];
const toneColor = (t?: "ok" | "warn" | "err") => (t ? `var(--cui-${t})` : "var(--cui-fg-2)");

export function TimeChart({
  series, yAxis, xAxis = { label: "Zeit t", unit: "s" }, sampleInterval = 1, window: win = 60,
  yDomain, includeZero, limits = [], bands = [], height = 240, stats = true, decimals, className,
}: TimeChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [hover, setHover] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setWidth(Math.max(240, Math.floor(el.clientWidth)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const narrow = width < 420;
  const m = { top: 14, right: 14, bottom: 44, left: narrow ? 58 : 66 };
  const pw = width - m.left - m.right;
  const ph = height - m.top - m.bottom;

  const y = useMemo(() => {
    if (yDomain) return niceScale(yDomain[0], yDomain[1], Math.round(ph / 30));
    const all = series.flatMap((s) => s.values).filter(Number.isFinite);
    const extra = [...limits.map((l) => l.value), ...bands.flatMap((b) => [b.from, b.to])];
    let lo = Math.min(...all, ...extra);
    let hi = Math.max(...all, ...extra);
    if (includeZero) {
      // kleines Rauschen um 0 (z. B. ausgeschaltete Kanäle) nicht als negativen Bereich werten
      if (lo < 0 && lo > -(hi - lo) * 0.03) lo = 0;
      lo = Math.min(lo, 0); hi = Math.max(hi, 0);
    }
    const pad = (hi - lo) * 0.06 || Math.abs(hi) * 0.05 || 1;
    return niceScale(includeZero && lo >= 0 ? lo : lo - pad, hi + pad, Math.round(ph / 30));
  }, [series, limits, bands, yDomain, includeZero, ph]);

  const x = useMemo(() => {
    const s = niceScale(-win, 0, Math.round(pw / 64));
    return { ...s, min: -win, max: 0 };
  }, [win, pw]);

  const sx = (t: number) => m.left + ((t - x.min) / (x.max - x.min)) * pw;
  const sy = (v: number) => m.top + (1 - (v - y.min) / (y.max - y.min)) * ph;
  const tOf = (i: number, n: number) => -(n - 1 - i) * sampleInterval;
  const dDigits = decimals ?? Math.min(6, y.decimals + 2);
  const xDigits = Math.max(0, -Math.floor(Math.log10(sampleInterval) + 1e-9));

  const paths = series.map((s) => {
    const n = s.values.length;
    let d = "";
    s.values.forEach((v, i) => {
      const t = tOf(i, n);
      if (t < x.min || !Number.isFinite(v)) return;
      d += `${d ? "L" : "M"}${sx(t).toFixed(1)},${sy(v).toFixed(1)}`;
    });
    return d;
  });

  const maxLen = Math.max(0, ...series.map((s) => s.values.length));
  const onMove = (e: PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const t = x.min + ((e.clientX - r.left) / r.width) * (x.max - x.min);
    const idx = Math.round(maxLen - 1 + t / sampleInterval);
    setHover(idx >= 0 && idx < maxLen ? idx : null);
  };

  const hoverT = hover != null ? tOf(hover, maxLen) : null;
  const clipId = useMemo(() => `cui-clip-${Math.random().toString(36).slice(2, 8)}`, []);

  const statsRows = series.map((s) => {
    const v = s.values.filter(Number.isFinite);
    if (!v.length) return null;
    return { min: Math.min(...v), max: Math.max(...v), mean: v.reduce((a, b) => a + b, 0) / v.length, last: v[v.length - 1] };
  });

  return (
    <div className={cx("cui-chart", className)}>
      {series.length > 1 && (
        <div className="cui-chart__legend">
          {series.map((s, i) => (
            <span key={s.name} className="cui-chart__key">
              <i style={{ background: s.color ?? palette[i % palette.length] }} />{s.name}
            </span>
          ))}
        </div>
      )}
      <div ref={wrapRef} className="cui-chart__plot" style={{ height }}>
        <svg width={width} height={height} role="img" aria-label={`${axisTitle(yAxis)} über ${axisTitle(xAxis)}`}>
          <defs>
            <clipPath id={clipId}><rect x={m.left} y={m.top} width={pw} height={ph} /></clipPath>
          </defs>

          {/* Bänder */}
          <g clipPath={`url(#${clipId})`}>
            {bands.map((b, i) => (
              <rect key={i} x={m.left} width={pw} y={sy(Math.max(b.from, b.to))} height={Math.abs(sy(b.from) - sy(b.to))}
                fill={toneColor(b.tone ?? "ok")} opacity={0.08} />
            ))}
          </g>

          {/* Nebenraster */}
          <g className="cui-chart__grid-minor">
            {ticks(y.min, y.max, y.minor).map((v) => <line key={`ym${v}`} x1={m.left} x2={m.left + pw} y1={sy(v)} y2={sy(v)} />)}
            {ticks(Math.ceil(x.min / x.minor - 1e-9) * x.minor, x.max, x.minor).map((t) => (
              <line key={`xm${t}`} y1={m.top} y2={m.top + ph} x1={sx(t)} x2={sx(t)} />
            ))}
          </g>
          {/* Hauptraster + Teilung */}
          <g className="cui-chart__grid-major">
            {ticks(y.min, y.max, y.step).map((v) => <line key={`y${v}`} x1={m.left} x2={m.left + pw} y1={sy(v)} y2={sy(v)} />)}
            {ticks(Math.ceil(x.min / x.step) * x.step, x.max, x.step).map((t) => (
              <line key={`x${t}`} y1={m.top} y2={m.top + ph} x1={sx(t)} x2={sx(t)} />
            ))}
          </g>
          <g className="cui-chart__ticklabels">
            {ticks(y.min, y.max, y.step).map((v) => (
              <text key={`yl${v}`} x={m.left - 6} y={sy(v)} dy="0.32em" textAnchor="end">{fmt(v, y.decimals)}</text>
            ))}
            {ticks(Math.ceil(x.min / x.step) * x.step, x.max, x.step).map((t) => (
              <text key={`xl${t}`} x={sx(t)} y={m.top + ph + 16} textAnchor="middle">{fmt(t, x.decimals)}</text>
            ))}
          </g>

          {/* Achsentitel */}
          <text className="cui-chart__title" x={m.left + pw / 2} y={height - 6} textAnchor="middle">{axisTitle(xAxis)}</text>
          <text className="cui-chart__title" transform={`translate(13 ${m.top + ph / 2}) rotate(-90)`} textAnchor="middle">{axisTitle(yAxis)}</text>

          {/* Grenzwerte */}
          {limits.map((l, i) => (
            l.value >= y.min && l.value <= y.max && (
              <g key={i}>
                <line x1={m.left} x2={m.left + pw} y1={sy(l.value)} y2={sy(l.value)} stroke={toneColor(l.tone)} strokeWidth={1.25} strokeDasharray="6 4" />
                <text className="cui-chart__limit" x={m.left + pw - 4} y={sy(l.value) - 4} textAnchor="end" fill={toneColor(l.tone)}>
                  {l.label} = {fmt(l.value, y.decimals + 1)}{yAxis.unit ? ` ${yAxis.unit}` : ""}
                </text>
              </g>
            )
          ))}

          {/* Kurven */}
          <g clipPath={`url(#${clipId})`}>
            {paths.map((d, i) => (
              <path key={i} d={d} fill="none" stroke={series[i].color ?? palette[i % palette.length]} strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" />
            ))}
          </g>

          {/* Rahmen */}
          <rect className="cui-chart__frame" x={m.left} y={m.top} width={pw} height={ph} />

          {/* Fadenkreuz */}
          {hoverT != null && (
            <g pointerEvents="none">
              <line className="cui-chart__cursor" x1={sx(hoverT)} x2={sx(hoverT)} y1={m.top} y2={m.top + ph} />
              {series.map((s, i) => {
                const v = s.values[hover! - (maxLen - s.values.length)];
                return Number.isFinite(v) ? (
                  <circle key={i} cx={sx(hoverT)} cy={sy(v)} r={3.5} fill={s.color ?? palette[i % palette.length]} stroke="var(--cui-surface)" strokeWidth={1.5} />
                ) : null;
              })}
            </g>
          )}
          <rect x={m.left} y={m.top} width={pw} height={ph} fill="transparent" style={{ cursor: "crosshair" }}
            onPointerMove={onMove} onPointerLeave={() => setHover(null)} />
        </svg>

        {hoverT != null && (
          <div
            className="cui-chart__tip"
            style={{ left: Math.min(sx(hoverT) + 10, width - 170), top: m.top + 6 }}
          >
            <div className="cui-chart__tip-t">{xAxis.label.split(" ").pop()} = {fmt(hoverT, xDigits)} {xAxis.unit}</div>
            {series.map((s, i) => {
              const v = s.values[hover! - (maxLen - s.values.length)];
              return (
                <div key={s.name} className="cui-chart__tip-row">
                  <i style={{ background: s.color ?? palette[i % palette.length] }} />
                  <span>{s.name}</span>
                  <b>{Number.isFinite(v) ? `${fmt(v, dDigits)} ${yAxis.unit ?? ""}` : "–"}</b>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {stats && (
        <table className="cui-chart__stats">
          <thead>
            <tr><th />{["Min", "Max", "Mittel", "Aktuell"].map((h) => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {series.map((s, i) => {
              const st = statsRows[i];
              return (
                <tr key={s.name}>
                  <td><i style={{ background: s.color ?? palette[i % palette.length] }} />{s.name}</td>
                  {st ? [st.min, st.max, st.mean, st.last].map((v, k) => <td key={k}>{fmt(v, dDigits)}{yAxis.unit ? ` ${yAxis.unit}` : ""}</td>)
                    : <td colSpan={4}>–</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
