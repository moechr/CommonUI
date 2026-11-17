import { createContext, useContext, useState, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils";
import { Icon, type IconName } from "../components/Icon";
import { IconButton } from "../components/Button";

/* Gerüst: Sidebar · Main (Toolbar + Inhalt) · Inspector.
   Unter 1060 px verschwindet der Inspector, unter 720 px wird die Sidebar zum Overlay. */

interface ShellCtx { sidebarOpen: boolean; setSidebarOpen: (v: boolean) => void }
const ShellContext = createContext<ShellCtx>({ sidebarOpen: false, setSidebarOpen: () => {} });
export const useShell = () => useContext(ShellContext);

export interface AppShellProps {
  sidebar: ReactNode;
  inspector?: ReactNode;
  children: ReactNode;
  /** Rahmen und Schatten, z. B. für eingebettete Vorschauen. */
  framed?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function AppShell({ sidebar, inspector, children, framed, className, style }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <ShellContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      <div
        className={cx("cui-shell", !inspector && "cui-shell--no-inspector", framed && "cui-shell--framed", className)}
        data-sidebar-open={sidebarOpen}
        style={style}
      >
        {sidebar}
        {children}
        {inspector}
      </div>
    </ShellContext.Provider>
  );
}

/* ---------- Sidebar ---------- */
export interface SidebarProps {
  /** Name der App neben dem Logo. */
  title: ReactNode;
  logo?: ReactNode;
  headerAction?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function Sidebar({ title, logo, headerAction, footer, children }: SidebarProps) {
  const { setSidebarOpen } = useShell();
  return (
    <aside className="cui-sidebar">
      <div className="cui-sidebar__head">
        {logo ?? <span className="cui-logo">{typeof title === "string" ? title.charAt(0) : "·"}</span>}
        <strong style={{ flex: 1, minWidth: 0 }}>{title}</strong>
        {headerAction}
        <IconButton icon="close" label="Seitenleiste schließen" className="cui-shell__menu" onClick={() => setSidebarOpen(false)} />
      </div>
      <nav className="cui-sidebar__nav">{children}</nav>
      {footer && <div className="cui-sidebar__foot">{footer}</div>}
    </aside>
  );
}

export function NavSection({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <>
      <div className="cui-nav-label">{label}</div>
      {children}
    </>
  );
}

export interface NavItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: IconName;
  active?: boolean;
  badge?: ReactNode;
  children: ReactNode;
}

/** Als Button umgesetzt; für Router-Links eigene <a className="cui-nav-item"> verwenden. */
export function NavItem({ icon, active, badge, children, className, onClick, ...rest }: NavItemProps) {
  const { setSidebarOpen } = useShell();
  return (
    <button
      type="button"
      className={cx("cui-nav-item", className)}
      aria-current={active ? "page" : undefined}
      onClick={(e) => { onClick?.(e); setSidebarOpen(false); }}
      {...rest}
    >
      {icon && <Icon name={icon} />}
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
  title: ReactNode;
  /** Neben dem Titel, z. B. ein Status-Chip. */
  status?: ReactNode;
  /** Rechtsbündige Aktionen. */
  actions?: ReactNode;
}

export function Toolbar({ title, status, actions }: ToolbarProps) {
  const { setSidebarOpen } = useShell();
  return (
    <div className="cui-toolbar">
      <IconButton icon="menu" label="Seitenleiste öffnen" className="cui-shell__menu" onClick={() => setSidebarOpen(true)} />
      <h2 className="cui-toolbar__title">{title}</h2>
      {status}
      <span className="cui-spacer" />
      {actions}
    </div>
  );
}

/* ---------- Inspector ---------- */
export function Inspector({ title, children }: { title?: ReactNode; children: ReactNode }) {
  return (
    <aside className="cui-inspector">
      {title && <h3 className="cui-text-headline">{title}</h3>}
      {children}
    </aside>
  );
}
