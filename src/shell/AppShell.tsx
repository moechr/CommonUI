import {
  createContext, useCallback, useContext, useEffect, useState,
  type ButtonHTMLAttributes, type CSSProperties, type HTMLAttributes, type ReactNode,
} from "react";
import { cx } from "../utils";
import { Icon, type IconName } from "../components/Icon";
import { IconButton } from "../components/Button";

/* Aufbau einer Software-Anwendung:
   ┌──────────── TitleBar ────────────┐
   │ Sidebar │ Main (Toolbar/Tabs) │ Inspector │
   └──────────── StatusBar ───────────┘
   Sidebar ein-/ausklappbar (Icon-Leiste), Zustand wird gespeichert, Strg/⌘+B schaltet um.
   Unter 1060 px verschwindet der Inspector, unter 720 px wird die Sidebar zum Overlay. */

interface ShellCtx {
  /** Desktop: Sidebar als schmale Icon-Leiste. */
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  /** Mobil: Sidebar als Overlay geöffnet. */
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  /** Schaltet je nach Bildschirmbreite Einklappen oder Overlay um. */
  toggleSidebar: () => void;
}

const ShellContext = createContext<ShellCtx>({
  collapsed: false, setCollapsed: () => {}, sidebarOpen: false, setSidebarOpen: () => {}, toggleSidebar: () => {},
});
export const useShell = () => useContext(ShellContext);

const STORAGE_KEY = "cui-sidebar-collapsed";
const isNarrow = () => typeof window !== "undefined" && window.matchMedia?.("(max-width: 720px)").matches;

export interface AppShellProps {
  sidebar: ReactNode;
  children: ReactNode;
  titleBar?: ReactNode;
  statusBar?: ReactNode;
  inspector?: ReactNode;
  /** Startzustand, falls nichts gespeichert ist. */
  defaultCollapsed?: boolean;
  /** Rahmen und Schatten, z. B. für eingebettete Vorschauen. */
  framed?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function AppShell({
  sidebar, children, titleBar, statusBar, inspector, defaultCollapsed = false, framed, className, style,
}: AppShellProps) {
  const [collapsed, setCollapsedState] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v != null) return v === "1";
    } catch { /* ignorieren */ }
    return defaultCollapsed;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const setCollapsed = useCallback((v: boolean) => {
    setCollapsedState(v);
    try { localStorage.setItem(STORAGE_KEY, v ? "1" : "0"); } catch { /* ignorieren */ }
  }, []);

  const toggleSidebar = useCallback(() => {
    if (isNarrow()) setSidebarOpen((o) => !o);
    else setCollapsedState((c) => {
      try { localStorage.setItem(STORAGE_KEY, c ? "0" : "1"); } catch { /* ignorieren */ }
      return !c;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleSidebar]);

  return (
    <ShellContext.Provider value={{ collapsed, setCollapsed, sidebarOpen, setSidebarOpen, toggleSidebar }}>
      <div
        className={cx("cui-shell", framed && "cui-shell--framed", className)}
        data-collapsed={collapsed}
        data-sidebar-open={sidebarOpen}
        data-inspector={inspector ? "true" : "false"}
        style={style}
      >
        {titleBar}
        {sidebar}
        {sidebarOpen && <div className="cui-shell__scrim" onClick={() => setSidebarOpen(false)} aria-hidden />}
        {children}
        {inspector}
        {statusBar}
      </div>
    </ShellContext.Provider>
  );
}

/* ---------- TitleBar ---------- */
export interface TitleBarProps {
  /** App-Name, z. B. "Werkbank". */
  appName: ReactNode;
  logo?: ReactNode;
  /** Pfad/Kontext neben dem Namen, z. B. Projekt › Messung. */
  context?: ReactNode;
  /** Mitte, z. B. Suchfeld. */
  center?: ReactNode;
  /** Rechtsbündige Aktionen. */
  actions?: ReactNode;
}

export function TitleBar({ appName, logo, context, center, actions }: TitleBarProps) {
  const { toggleSidebar, collapsed } = useShell();
  return (
    <header className="cui-titlebar">
      <IconButton
        icon="sidebar"
        label={collapsed ? "Seitenmenü ausklappen (Strg+B)" : "Seitenmenü einklappen (Strg+B)"}
        onClick={toggleSidebar}
      />
      {logo ?? <span className="cui-logo">{typeof appName === "string" ? appName.charAt(0) : "·"}</span>}
      <strong className="cui-titlebar__name">{appName}</strong>
      {context && <span className="cui-titlebar__context">{context}</span>}
      <span className="cui-spacer" />
      {center && <div className="cui-titlebar__center">{center}</div>}
      <span className="cui-spacer" />
      {actions && <div className="cui-cluster" style={{ flexWrap: "nowrap" }}>{actions}</div>}
    </header>
  );
}

/* ---------- Sidebar ---------- */
export interface SidebarProps {
  children: ReactNode;
  /** Unten fixiert, z. B. Konto oder Version. Wird eingeklappt ausgeblendet. */
  footer?: ReactNode;
  /** Ein-/Ausklapp-Schalter am unteren Rand anzeigen (Standard: ja). */
  collapseToggle?: boolean;
}

export function Sidebar({ children, footer, collapseToggle = true }: SidebarProps) {
  const { collapsed, setCollapsed } = useShell();
  return (
    <aside className="cui-sidebar" aria-label="Hauptnavigation">
      <nav className="cui-sidebar__nav">{children}</nav>
      {(footer || collapseToggle) && (
        <div className="cui-sidebar__foot">
          {footer && <div className="cui-sidebar__foot-content">{footer}</div>}
          {collapseToggle && (
            <button
              type="button"
              className="cui-nav-item cui-sidebar__collapse"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Ausklappen" : "Einklappen"}
              aria-expanded={!collapsed}
            >
              <Icon name={collapsed ? "chevronRight" : "chevronLeft"} />
              <span className="cui-nav-item__label">Einklappen</span>
            </button>
          )}
        </div>
      )}
    </aside>
  );
}

export function NavSection({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="cui-nav-section" role="group" aria-label={typeof label === "string" ? label : undefined}>
      <div className="cui-nav-label">{label}</div>
      {children}
    </div>
  );
}

export interface NavItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  active?: boolean;
  badge?: ReactNode;
  children: string;
}

/** Eingeklappt: nur Icon, Text als Tooltip, Zähler als Punkt. */
export function NavItem({ icon, active, badge, children, className, onClick, ...rest }: NavItemProps) {
  const { setSidebarOpen, collapsed } = useShell();
  return (
    <button
      type="button"
      className={cx("cui-nav-item", className)}
      aria-current={active ? "page" : undefined}
      title={collapsed ? children : undefined}
      onClick={(e) => { onClick?.(e); setSidebarOpen(false); }}
      {...rest}
    >
      <Icon name={icon} />
      <span className="cui-nav-item__label">{children}</span>
      {badge != null && <span className="cui-nav-item__badge">{badge}</span>}
    </button>
  );
}

/* ---------- Main + Toolbar ---------- */
export function Main({ className, ...rest }: HTMLAttributes<HTMLElement>) {
  return <main className={cx("cui-main", className)} {...rest} />;
}

export interface ToolbarProps {
  title?: ReactNode;
  /** Neben dem Titel, z. B. ein Status-Chip. */
  status?: ReactNode;
  /** Linksbündiger Inhalt statt Titel, z. B. Tabs. */
  leading?: ReactNode;
  /** Rechtsbündige Aktionen. */
  actions?: ReactNode;
}

export function Toolbar({ title, status, leading, actions }: ToolbarProps) {
  return (
    <div className="cui-toolbar">
      {leading}
      {title && <h2 className="cui-toolbar__title">{title}</h2>}
      {status}
      <span className="cui-spacer" />
      {actions}
    </div>
  );
}

/* ---------- Inspector ---------- */
export function Inspector({ title, actions, children }: { title?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <aside className="cui-inspector" aria-label="Eigenschaften">
      {(title || actions) && (
        <div className="cui-inspector__head">
          {title && <h3 className="cui-text-headline">{title}</h3>}
          <span className="cui-spacer" />
          {actions}
        </div>
      )}
      <div className="cui-inspector__body">{children}</div>
    </aside>
  );
}

/* ---------- StatusBar ---------- */
export function StatusBar({ children, trailing }: { children: ReactNode; trailing?: ReactNode }) {
  return (
    <footer className="cui-statusbar" role="status">
      {children}
      <span className="cui-spacer" />
      {trailing}
    </footer>
  );
}

export function StatusItem({ tone, children }: { tone?: "ok" | "warn" | "err"; children: ReactNode }) {
  return (
    <span className="cui-statusbar__item">
      {tone && <span className={cx("cui-statusbar__dot", `cui-statusbar__dot--${tone}`)} aria-hidden />}
      {children}
    </span>
  );
}
