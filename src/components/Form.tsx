import {
  cloneElement, forwardRef, isValidElement, useId,
  type InputHTMLAttributes, type ReactElement, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes,
} from "react";
import { cx } from "../utils";

/* ---------- Field ---------- */
export interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Genau ein Eingabeelement; id und aria-Attribute werden automatisch gesetzt. */
  children: ReactElement;
}

export function Field({ label, hint, error, children }: FieldProps) {
  const autoId = useId();
  const childId = (isValidElement(children) && (children.props as { id?: string }).id) || autoId;
  const hintId = `${childId}-hint`;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id: childId,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error || hint ? hintId : undefined,
      })
    : children;
  return (
    <div className="cui-field">
      <label className="cui-field__label" htmlFor={childId}>{label}</label>
      {control}
      {error ? (
        <span id={hintId} className="cui-field__error">{error}</span>
      ) : hint ? (
        <span id={hintId} className="cui-field__hint">{hint}</span>
      ) : null}
    </div>
  );
}

/* ---------- Input / Select / Textarea ---------- */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...rest }, ref) {
  return <input ref={ref} className={cx("cui-input", className)} {...rest} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, ...rest }, ref) {
  return <select ref={ref} className={cx("cui-input", className)} {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={cx("cui-input", className)} {...rest} />;
});

/* ---------- Switch ---------- */
export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** Ganze Zeile ist klickbar (44 px hoch), wie eine iOS-Einstellungszeile. */
export function Switch({ label, checked, onChange, id, ...rest }: SwitchProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label className="cui-switch-row" htmlFor={inputId}>
      <span>{label}</span>
      <span className="cui-switch">
        <input id={inputId} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} {...rest} />
        <span className="cui-switch__knob" />
      </span>
    </label>
  );
}

/* ---------- Slider ---------- */
export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value"> {
  value: number;
  onChange: (value: number) => void;
}

export function Slider({ value, onChange, className, ...rest }: SliderProps) {
  return (
    <input
      type="range"
      className={cx("cui-slider", className)}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      {...rest}
    />
  );
}

/* ---------- Segmented ---------- */
export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
}

export interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  "aria-label": string;
  /** Volle Breite, Segmente gleich breit. */
  block?: boolean;
}

export function Segmented<T extends string>({ options, value, onChange, block, ...aria }: SegmentedProps<T>) {
  return (
    <div className={cx("cui-seg", block && "cui-seg--block")} role="group" {...aria}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="cui-seg__item"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
