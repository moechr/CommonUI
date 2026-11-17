// Einfaches SVG-Liniendiagramm für die Demo (Zykluszeit über Zeit mit Sollwert-Linie)

interface Props {
  values: number[];
  target: number;
  unit?: string;
  height?: number;
  /** Farbe der Kurve nach Status. */
  tone?: "ok" | "warn" | "err";
}

export function LineChart({ values, target, unit = "ms", height = 220, tone = "ok" }: Props) {
  const stroke = tone === "ok" ? "var(--cui-accent)" : `var(--cui-${tone})`;
  const fill = tone === "ok" ? "var(--cui-accent-soft)" : `var(--cui-${tone}-soft)`;
  const W = 640, H = height, padL = 44, padR = 12, padT = 12, padB = 26;
  const max = Math.max(...values, target) * 1.15;
  const min = 0;
  const x = (i: number) => padL + (i / (values.length - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);
  const ticks = niceTicks(max);
  const line = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const area = `${line}L${x(values.length - 1)},${y(0)}L${x(0)},${y(0)}Z`;
  const last = values[values.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label={`Zykluszeit, zuletzt ${last} ${unit}, Soll ${target} ${unit}`} style={{ display: "block" }}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--cui-line)" strokeWidth={1} />
          <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize={11} fill="var(--cui-fg-3)" style={{ fontVariantNumeric: "tabular-nums" }}>{t}</text>
        </g>
      ))}
      {[0, 15, 30, 45, 60].map((s) => (
        <text key={s} x={x((s / 60) * (values.length - 1))} y={H - 6} textAnchor="middle" fontSize={11} fill="var(--cui-fg-3)">{s} s</text>
      ))}
      <line x1={padL} x2={W - padR} y1={y(target)} y2={y(target)} stroke="var(--cui-ok)" strokeWidth={1.5} strokeDasharray="5 4" />
      <text x={W - padR} y={y(target) - 6} textAnchor="end" fontSize={11} fill="var(--cui-ok)">Soll {target} {unit}</text>
      <path d={area} fill={fill} opacity={0.7} />
      <path d={line} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
      <circle cx={x(values.length - 1)} cy={y(last)} r={4} fill={stroke} stroke="var(--cui-surface)" strokeWidth={2} />
    </svg>
  );
}

function niceTicks(max: number): number[] {
  const step = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500].find((s) => max / s <= 5) ?? 1000;
  const out: number[] = [];
  for (let v = 0; v <= max; v += step) out.push(v);
  return out;
}
