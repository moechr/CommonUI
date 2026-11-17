import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { Sparkline } from "./Sparkline";

/* ---------- PageHeader ---------- */
export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Neben dem Titel, z. B. <LiveBadge />. */
  meta?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, description, meta, actions }: PageHeaderProps) {
  return (
    <div className="cui-page-header">
      <div className="cui-page-header__text">
        <div className="cui-cluster">
          <h1 className="cui-text-title2">{title}</h1>
          {meta}
        </div>
        {description && <p className="cui-text-callout cui-text-muted">{description}</p>}
      </div>
      {actions && <div className="cui-cluster">{actions}</div>}
    </div>
  );
}

/** Kennzeichnet laufend aktualisierte Werte. */
export function LiveBadge({ paused, interval = "1 s" }: { paused?: boolean; interval?: string }) {
  return (
    <span className={cx("cui-chip", "cui-chip--dot", paused ? "cui-chip--neutral" : "cui-chip--ok", !paused && "cui-chip--live")}>
      {paused ? "Angehalten" : `Live · ${interval}`}
    </span>
  );
}

/* ---------- TileGrid + Tile ---------- */
export type TileSpan = 3 | 4 | 6 | 8 | 9 | 12;

/** 12-Spalten-Raster. Bricht nach Breite des Containers um (nicht des Fensters):
    unter 960 px werden kleine Kacheln halb, große ganz breit; unter 600 px alles ganz breit. */
export function TileGrid({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("cui-tiles", className)} {...rest} />;
}

export interface TileProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  span?: TileSpan;
  /** Inhalt ohne Innenabstand, z. B. für Tabellen. */
  flush?: boolean;
}

export function Tile({ title, subtitle, actions, span = 6, flush, className, children, ...rest }: TileProps) {
  return (
    <section className={cx("cui-tile", `cui-tile--s${span}`, flush && "cui-tile--flush", className)} {...rest}>
      {(title || actions) && (
        <header className="cui-tile__head">
          <div style={{ minWidth: 0 }}>
            {title && <h2 className="cui-tile__title">{title}</h2>}
            {subtitle && <p className="cui-tile__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="cui-cluster" style={{ flexWrap: "nowrap" }}>{actions}</div>}
        </header>
      )}
      <div className="cui-tile__body">{children}</div>
    </section>
  );
}

/* ---------- ValueTile: große Werteanzeige ---------- */
export interface ValueTileProps {
  label: ReactNode;
  value: string;
  unit?: string;
  /** Zusatzzeile, z. B. "Grenze 13,0 V". */
  sub?: ReactNode;
  tone?: "ok" | "warn" | "err";
  /** Verlauf als kleine Linie unter dem Wert. */
  history?: number[];
  span?: TileSpan;
}

export function ValueTile({ label, value, unit, sub, tone, history, span = 3 }: ValueTileProps) {
  return (
    <section className={cx("cui-tile", `cui-tile--s${span}`, "cui-value-tile", tone && `cui-value-tile--${tone}`)}>
      <span className="cui-value-tile__label">{label}</span>
      <span className="cui-value-tile__value">
        {value}
        {unit && <span className="cui-value-tile__unit">{unit}</span>}
      </span>
      {sub && <span className="cui-value-tile__sub">{sub}</span>}
      {history && history.length > 1 && <Sparkline values={history} tone={tone} />}
    </section>
  );
}
