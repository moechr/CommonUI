export interface SparklineProps {
  values: number[];
  height?: number;
  tone?: "ok" | "warn" | "err";
  /** Fläche unter der Linie füllen (Standard: ja). */
  area?: boolean;
  label?: string;
}

/** Kleiner Verlauf ohne Achsen, skaliert auf min/max der Werte. Breite = Container. */
export function Sparkline({ values, height = 32, tone, area = true, label }: SparklineProps) {
  const W = 200;
  const H = height;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 3;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * W,
    pad + (1 - (v - min) / range) * (H - pad * 2),
  ]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
  const color = tone ? `var(--cui-${tone})` : "var(--cui-accent)";
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg
      className="cui-sparkline"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      height={H}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {area && <path d={`${d}L${W},${H}L0,${H}Z`} fill={color} opacity={0.12} />}
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r={2.5} fill={color} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
