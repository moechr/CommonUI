import type { ReactNode } from "react";
import { EmptyState } from "./Display";

export interface Column<T> {
  key: string;
  header: ReactNode;
  /** Zahlen rechtsbündig mit tabellarischen Ziffern. */
  numeric?: boolean;
  /** Feste Breite (z. B. 96 oder "12ch"). Sobald eine Spalte eine Breite hat, wird das Layout fest:
      Spalten springen dann nicht mehr, wenn sich Werte ändern. Spalten ohne Breite teilen sich den Rest. */
  width?: number | string;
  render: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  /** Mindestbreite, ab der horizontal gescrollt wird. */
  minWidth?: number;
  /** Kompakte Zeilen für viele Messwerte. */
  dense?: boolean;
  /** Ausgeschaltete/inaktive Zeilen gedimmt darstellen. */
  isRowDimmed?: (row: T) => boolean;
}

export function DataTable<T>({ columns, rows, rowKey, onRowClick, empty, minWidth = 560, dense, isRowDimmed }: DataTableProps<T>) {
  if (rows.length === 0) return <>{empty ?? <EmptyState title="Keine Einträge" />}</>;
  const fixed = columns.some((c) => c.width != null);
  const cls = ["cui-table", dense && "cui-table--dense", fixed && "cui-table--fixed"].filter(Boolean).join(" ");
  return (
    <div className="cui-table-wrap">
      <table className={cls} style={{ minWidth }}>
        {fixed && (
          <colgroup>
            {columns.map((c) => <col key={c.key} style={c.width != null ? { width: c.width } : undefined} />)}
          </colgroup>
        )}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.numeric ? "cui-num" : undefined}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={rowKey(r)}
              data-clickable={onRowClick ? "true" : undefined}
              data-off={isRowDimmed?.(r) ? "true" : undefined}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={onRowClick ? (e) => { if (e.key === "Enter") onRowClick(r); } : undefined}
            >
              {columns.map((c) => (
                <td key={c.key} className={c.numeric ? "cui-num" : undefined}>{c.render(r)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
