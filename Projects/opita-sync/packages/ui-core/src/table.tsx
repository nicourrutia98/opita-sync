import type { Table } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { useTheme } from './theme.js';

export function DenseTable<T>(props: { table: Table<T>; emptyLabel: string; onRowClick?: (row: T) => void }) {
  const { tokens } = useTheme();
  const rows = props.table.getRowModel().rows;

  return (
    <div style={{ overflow: 'auto', borderRadius: 18, border: `1px solid ${tokens.line}`, background: tokens.panel }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
        <thead>
          {props.table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    textAlign: 'left',
                    fontSize: 11,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: tokens.subtle,
                    padding: '14px 16px',
                    borderBottom: `1px solid ${tokens.line}`,
                    background: tokens.surface
                  }}
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={props.table.getAllColumns().length} style={{ padding: 18, color: tokens.muted }}>
                {props.emptyLabel}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                onClick={props.onRowClick ? () => props.onRowClick?.(row.original) : undefined}
                style={props.onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      padding: '14px 16px',
                      borderBottom: `1px solid ${tokens.line}`,
                      color: tokens.ink,
                      fontSize: 14,
                      verticalAlign: 'top'
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
