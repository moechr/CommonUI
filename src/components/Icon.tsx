import type { SVGProps } from "react";
import { cx } from "../utils";

/** Strich-Icons im 24er-Raster. Neue Icons hier ergänzen, damit alle Projekte dieselben nutzen. */
const paths = {
  plus: "M12 5v14M5 12h14",
  list: "M4 6h16M4 12h16M4 18h10",
  search: "M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM20 20l-4-4",
  chart: "M4 17l6-6 4 4 6-8",
  chip: "M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3zM9 9h6v6H9z",
  pen: "M14 4l6 6-10 10H4v-6z",
  key: "M14 10a4 4 0 1 0-1.2 2.8L20 20M17 17l2-2",
  bars: "M5 20V10M12 20V4M19 20v-7",
  share: "M12 15V3M7 8l5-5 5 5M5 13v6h14v-6",
  attach: "M20 11l-8 8a5 5 0 0 1-7-7l8-8a3.5 3.5 0 0 1 5 5l-8 8a2 2 0 0 1-3-3l7-7",
  sparkle: "M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z",
  check: "M5 12l5 5 9-10",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01",
  warning: "M12 4l9 16H3zM12 10v4M12 17h.01",
  error: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15 9l-6 6M9 9l6 6",
  close: "M6 6l12 12M18 6L6 18",
  menu: "M4 7h16M4 12h16M4 17h16",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-1-3-2 .2-1.3-1.3L17 5l-3-1-1 2h-2L10 4 7 5l.2 2L6 8.3 4 8 3 11l2 1v0l-2 1 1 3 2-.2 1.3 1.3L7 19l3 1 1-2h2l1 2 3-1-.2-2 1.3-1.3 2 .3 1-3z",
  inbox: "M4 7h16v12H4zM8 7V5h8v2",
  send: "M4 12l16-8-6 16-2-7z",
  stop: "M7 7h10v10H7z",
  copy: "M9 9h11v11H9zM5 15H4V4h11v1",
  refresh: "M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7",
  sidebar: "M4 5h16v14H4zM9 5v14",
  chevronLeft: "M15 6l-6 6 6 6",
  chevronRight: "M9 6l6 6-6 6",
  chevronDown: "M6 9l6 6 6-6",
  home: "M4 11l8-7 8 7v9h-5v-6H9v6H4z",
  folder: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  wave: "M3 12h3l2-6 4 12 3-9 2 3h4",
  doc: "M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6",
  device: "M4 6h16v10H4zM8 20h8M12 16v4",
  bell: "M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4",
  filter: "M4 5h16l-6 8v6l-4-2v-4z",
  download: "M12 4v11M7 10l5 5 5-5M5 20h14",
  record: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z",
  bolt: "M13 3L5 14h6l-1 7 8-11h-6z",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
} as const;

export type IconName = keyof typeof paths;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
  /** Ohne label ist das Icon dekorativ (aria-hidden). */
  label?: string;
}

export function Icon({ name, size, label, className, style, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cx("cui-icon", className)}
      style={size ? { width: size, height: size, ...style } : style}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  );
}

export const iconNames = Object.keys(paths) as IconName[];
