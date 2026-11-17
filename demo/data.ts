// Beispieldaten für die Demo (CAN-Messung)

export interface Signal {
  id: string;          // CAN-ID
  name: string;
  node: string;        // Sender
  dlc: number;
  target: number;      // Soll-Zykluszeit ms
  actual: number;      // gemessene Zykluszeit ms
  count: number;       // Anzahl Botschaften
}

export const signals: Signal[] = [
  { id: "0x0C8", name: "WheelSpeed", node: "ESP", dlc: 8, target: 20, actual: 20.1, count: 4812 },
  { id: "0x120", name: "SteeringAngle", node: "EPS", dlc: 6, target: 10, actual: 10.0, count: 9644 },
  { id: "0x1A0", name: "EngineStatus", node: "ECM", dlc: 8, target: 100, actual: 142.3, count: 678 },
  { id: "0x2F4", name: "BrakeInfo", node: "ESP", dlc: 8, target: 100, actual: 118.4, count: 812 },
  { id: "0x330", name: "Diag", node: "Gateway", dlc: 8, target: 100, actual: 104.0, count: 925 },
  { id: "0x3E8", name: "BatteryMgmt", node: "BMS", dlc: 7, target: 100, actual: 100.2, count: 961 },
  { id: "0x410", name: "Climate", node: "HVAC", dlc: 4, target: 500, actual: 501.7, count: 190 },
];

export type SignalState = "ok" | "warn" | "err";

export function signalState(s: Signal): SignalState {
  const r = s.actual / s.target;
  if (r > 1.3) return "err";
  if (r > 1.1) return "warn";
  return "ok";
}

export const stateText: Record<SignalState, string> = { ok: "Im Soll", warn: "Abweichung", err: "Kritisch" };

/** Deterministische Zeitreihe der Zykluszeit, 60 Punkte über 60 s. */
export function series(s: Signal): number[] {
  let seed = parseInt(s.id, 16);
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const jumpAt = s.actual / s.target > 1.1 ? 32 : 999;
  return Array.from({ length: 60 }, (_, i) => {
    const base = i < jumpAt ? s.target : s.actual + (s.actual - s.target) * 0.15;
    return +(base * (0.97 + rnd() * 0.06)).toFixed(1);
  });
}

/** Zahl mit deutschem Komma und echtem Minuszeichen (U+2212). */
export const fmt = (n: number, d = 1) =>
  n.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d }).replace("-", "−");
