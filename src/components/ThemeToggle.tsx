import { useTheme } from "../theme";
import { cx } from "../utils";
import { Icon } from "./Icon";

export interface ThemeToggleProps {
  /** "segmented": Hell | Dunkel mit Icons (Text wird auf Handy-Breite ausgeblendet).
      "icon": ein Knopf, der umschaltet. */
  variant?: "segmented" | "icon";
}

/** Umschalter Hell/Dunkel. Wählt der Nutzer hier, gilt das statt der Systemeinstellung. */
export function ThemeToggle({ variant = "segmented" }: ThemeToggleProps) {
  const { resolved, setTheme } = useTheme();

  if (variant === "icon") {
    const next = resolved === "dark" ? "light" : "dark";
    const label = next === "dark" ? "Dunkles Erscheinungsbild" : "Helles Erscheinungsbild";
    return (
      <button type="button" className="cui-icon-btn" aria-label={label} title={label} onClick={() => setTheme(next)}>
        <Icon name={resolved === "dark" ? "sun" : "moon"} />
      </button>
    );
  }

  return (
    <div className="cui-seg cui-theme-toggle" role="group" aria-label="Erscheinungsbild">
      {(["light", "dark"] as const).map((t) => (
        <button
          key={t}
          type="button"
          className={cx("cui-seg__item")}
          aria-pressed={resolved === t}
          title={t === "light" ? "Hell" : "Dunkel"}
          onClick={() => setTheme(t)}
        >
          <Icon name={t === "light" ? "sun" : "moon"} />
          <span className="cui-theme-toggle__label">{t === "light" ? "Hell" : "Dunkel"}</span>
        </button>
      ))}
    </div>
  );
}
