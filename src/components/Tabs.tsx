import { cx } from "../utils";
import { Icon, type IconName } from "./Icon";

export interface TabItem {
  id: string;
  label: string;
  icon?: IconName;
  /** Ungespeicherte Änderungen (Punkt statt Schließen-Kreuz, bis Hover). */
  dirty?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose?: (id: string) => void;
  onAdd?: () => void;
}

/** Dokument-Tabs wie in Desktop-Anwendungen (mehrere offene Messungen, Dateien …). */
export function Tabs({ items, activeId, onSelect, onClose, onAdd }: TabsProps) {
  return (
    <div className="cui-tabs" role="tablist">
      {items.map((t) => {
        const active = t.id === activeId;
        return (
          <div key={t.id} className={cx("cui-tab", active && "cui-tab--active", t.dirty && "cui-tab--dirty")}>
            <button
              type="button"
              role="tab"
              aria-selected={active}
              className="cui-tab__btn"
              onClick={() => onSelect(t.id)}
            >
              {t.icon && <Icon name={t.icon} />}
              <span className="cui-tab__label">{t.label}</span>
            </button>
            {onClose && (
              <button type="button" className="cui-tab__close" aria-label={`${t.label} schließen`} onClick={() => onClose(t.id)}>
                <Icon name="close" />
              </button>
            )}
          </div>
        );
      })}
      {onAdd && (
        <button type="button" className="cui-icon-btn cui-tabs__add" aria-label="Neuer Tab" title="Neuer Tab" onClick={onAdd}>
          <Icon name="plus" />
        </button>
      )}
    </div>
  );
}
