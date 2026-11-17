import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils";
import { Icon, type IconName } from "./Icon";

/* ---------- Text ---------- */
export type TextVariant = "large" | "title1" | "title2" | "title3" | "headline" | "body" | "callout" | "caption" | "eyebrow";

const defaultTag: Record<TextVariant, keyof JSX.IntrinsicElements> = {
  large: "h1", title1: "h1", title2: "h2", title3: "h3", headline: "h3",
  body: "p", callout: "p", caption: "span", eyebrow: "span",
};

export interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  as?: keyof JSX.IntrinsicElements;
  muted?: boolean;
}

/** Semantische Schriftskala nach HIG (Large Title … Caption). */
export function Text({ variant = "body", as, muted, className, ...rest }: TextProps) {
  const Tag = (as ?? defaultTag[variant]) as "p";
  return <Tag className={cx(`cui-text-${variant}`, muted && "cui-text-muted", className)} {...rest} />;
}

/* ---------- Chip ---------- */
export type Tone = "ok" | "warn" | "err" | "ai" | "neutral" | "accent";

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  /** Status-Punkt anzeigen (Standard: ja). */
  dot?: boolean;
}

/** Status immer mit Text, nie nur über Farbe. */
export function Chip({ tone = "neutral", dot = true, className, ...rest }: ChipProps) {
  return <span className={cx("cui-chip", `cui-chip--${tone}`, dot && "cui-chip--dot", className)} {...rest} />;
}

/* ---------- Kbd ---------- */
export function Kbd({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <kbd className={cx("cui-kbd", className)} {...rest} />;
}

/* ---------- Avatar ---------- */
export function Avatar({ initials, className, ...rest }: HTMLAttributes<HTMLSpanElement> & { initials: string }) {
  return <span className={cx("cui-avatar", className)} aria-hidden {...rest}>{initials}</span>;
}

/* ---------- Meter ---------- */
export interface MeterProps {
  value: number;
  max?: number;
  label?: string;
  /** Ab diesem Anteil (0–1) gelb, ab errorAt rot. */
  warnAt?: number;
  errorAt?: number;
}

export function Meter({ value, max = 100, label, warnAt = 0.75, errorAt = 0.9 }: MeterProps) {
  const ratio = Math.max(0, Math.min(1, value / max));
  const tone = ratio >= errorAt ? "err" : ratio >= warnAt ? "warn" : undefined;
  return (
    <div
      className={cx("cui-meter", tone && `cui-meter--${tone}`)}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
    >
      <span className="cui-meter__bar" style={{ width: `${ratio * 100}%` }} />
    </div>
  );
}

/* ---------- KeyValue ---------- */
export function KeyValue({ items }: { items: Array<[ReactNode, ReactNode]> }) {
  return (
    <dl className="cui-kv">
      {items.map(([k, v], i) => (
        <div key={i} style={{ display: "contents" }}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- Panel ---------- */
export function Panel({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("cui-panel", className)} {...rest} />;
}

/* ---------- Banner ---------- */
export type BannerTone = "info" | "ok" | "warn" | "err";
const bannerIcon: Record<BannerTone, IconName> = { info: "info", ok: "check", warn: "warning", err: "error" };

export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  tone?: BannerTone;
  title?: ReactNode;
  action?: ReactNode;
}

export function Banner({ tone = "info", title, action, children, className, ...rest }: BannerProps) {
  return (
    <div className={cx("cui-banner", `cui-banner--${tone}`, className)} role={tone === "err" ? "alert" : "status"} {...rest}>
      <Icon name={bannerIcon[tone]} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <strong style={{ display: "block" }}>{title}</strong>}
        {children}
      </div>
      {action}
    </div>
  );
}

/* ---------- EmptyState ---------- */
export interface EmptyStateProps {
  icon?: IconName;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ icon = "inbox", title, description, action }: EmptyStateProps) {
  return (
    <div className="cui-empty">
      <Icon name={icon} />
      <strong>{title}</strong>
      {description && <span className="cui-text-caption">{description}</span>}
      {action}
    </div>
  );
}
