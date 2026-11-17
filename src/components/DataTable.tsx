import type { ReactNode } from "react";
import { EmptyState } from "./Display";

export interface Column<T> {
  key: string;
  header: ReactNode;
  /** Zahlen rechtsbündig mit tabellarischen Ziffern. */
  numeric?: boolean;
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
}

export function DataTable<T>({ columns, rows, rowKey, onRowClick, empty, minWidth = 560 }: DataTableProps<T>) {
  if (rows.length === 0) return <>{empty ?? <EmptyState title="Keine Einträge" />}</>;
  return (
    <div className="cui-table-wrap">
      <table className="cui-table" style={{ minWidth }}>
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
