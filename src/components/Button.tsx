import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils";
import { Icon, type IconName } from "./Icon";

export type ButtonVariant = "primary" | "secondary" | "plain" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Pro Ansicht genau ein "primary". */
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  loading?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", icon, loading, disabled, className, children, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx("cui-btn", `cui-btn--${variant}`, size !== "md" && `cui-btn--${size}`, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="cui-btn__spinner" aria-hidden /> : icon && <Icon name={icon} />}
      {children}
    </button>
  );
});

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  /** Pflicht: wird Screenreadern und als Tooltip angezeigt. */
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, className, type = "button", ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={cx("cui-icon-btn", className)} aria-label={label} title={label} {...rest}>
      <Icon name={icon} />
    </button>
  );
});
