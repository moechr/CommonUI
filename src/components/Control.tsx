import { useId, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils";
import { Icon } from "./Icon";

/* Bausteine für Schalt- und Steueranwendungen */

/* ---------- Toggle: Schalter ohne Zeile, z. B. in Tabellen ---------- */
export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Pflicht für Screenreader, z. B. "CH3 einschalten". */
  label: string;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function Toggle({ checked, onChange, label, disabled, size = "md" }: ToggleProps) {
  return (
    <span className={cx("cui-switch", size === "sm" && "cui-switch--sm")}>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="cui-switch__knob" />
    </span>
  );
}

/* ---------- Led: Zustandsanzeige (Pegel, Verbindung) ---------- */
export type LedTone = "ok" | "warn" | "err" | "accent" | "off";

export interface LedProps {
  on: boolean;
  /** Farbe im eingeschalteten Zustand (Standard: ok). */
  tone?: Exclude<LedTone, "off">;
  /** Text daneben; Zustand wird nie nur über Farbe vermittelt. */
  label?: ReactNode;
  pulse?: boolean;
}

export function Led({ on, tone = "ok", label, pulse }: LedProps) {
  return (
    <span className="cui-led-wrap">
      <span className={cx("cui-led", on ? `cui-led--${tone}` : "cui-led--off", on && pulse && "cui-led--pulse")} aria-hidden />
      {label != null && <span>{label}</span>}
    </span>
  );
}

/* ---------- NumberField: Sollwert mit − / + und Einheit ---------- */
export interface NumberFieldProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  /** Nachkommastellen in der Anzeige. */
  decimals?: number;
  label: string;
  disabled?: boolean;
}

export function NumberField({ value, onChange, min = -Infinity, max = Infinity, step = 1, unit, decimals = 0, label, disabled }: NumberFieldProps) {
  const id = useId();
  const clamp = (v: number) => Math.min(max, Math.max(min, +v.toFixed(Math.max(decimals, 4))));
  return (
    <div className="cui-number">
      <button type="button" className="cui-number__btn" aria-label={`${label} verringern`} disabled={disabled || value <= min} onClick={() => onChange(clamp(value - step))}>−</button>
      <input
        id={id}
        className="cui-number__input"
        inputMode="decimal"
        aria-label={label}
        disabled={disabled}
        value={value.toFixed(decimals).replace(".", ",")}
        onChange={(e) => {
          const v = parseFloat(e.target.value.replace(",", "."));
          if (!Number.isNaN(v)) onChange(clamp(v));
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") { e.preventDefault(); onChange(clamp(value + step)); }
          if (e.key === "ArrowDown") { e.preventDefault(); onChange(clamp(value - step)); }
        }}
      />
      {unit && <span className="cui-number__unit">{unit}</span>}
      <button type="button" className="cui-number__btn" aria-label={`${label} erhöhen`} disabled={disabled || value >= max} onClick={() => onChange(clamp(value + step))}>+</button>
    </div>
  );
}

/* ---------- SwitchTile: großer Schaltknopf für ein Schaltfeld ---------- */
export interface SwitchTileProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "value" | "title"> {
  on: boolean;
  onChange: (on: boolean) => void;
  title: string;
  /** Kleiner Wert unter dem Titel, z. B. aktueller Strom. */
  value?: ReactNode;
  /** Störung: roter Rahmen, Schalten bleibt möglich. */
  fault?: boolean;
}

export function SwitchTile({ on, onChange, title, value, fault, className, disabled, ...rest }: SwitchTileProps) {
  return (
    <button
      type="button"
      className={cx("cui-switch-tile", on && "cui-switch-tile--on", fault && "cui-switch-tile--fault", className)}
      aria-pressed={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      {...rest}
    >
      <span className="cui-switch-tile__head">
        <span className="cui-switch-tile__title">{title}</span>
        <Icon name={fault ? "warning" : "bolt"} />
      </span>
      <span className="cui-switch-tile__state">{fault ? "Störung" : on ? "Ein" : "Aus"}</span>
      {value != null && <span className="cui-switch-tile__value">{value}</span>}
    </button>
  );
}
