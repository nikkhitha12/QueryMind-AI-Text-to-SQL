import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table'
import { ArrowUpDown, ArrowUp, ArrowDown, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ResultTable({ columns = [], rows = [] }) {
  const [sorting, setSorting] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  const tableColumns = useMemo(
    () => columns.map((col) => ({ accessorKey: col, header: col })),
    [columns]
  )

  const tableData = useMemo(
    () => rows.map((row) => Object.fromEntries(columns.map((col, i) => [col, row[i] ?? '—']))),
    [rows, columns]
  )

  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  })

  function exportCsv() {
    const header = columns.join(',')
    const body = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([header + '\n' + body], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!columns.length) return <p className="text-sm text-slate-500">No results to display.</p>

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search results..."
            className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg bg-white/5 dark:bg-white/5 bg-gray-50 border border-white/10 dark:border-white/10 border-gray-200 text-slate-200 dark:text-slate-200 text-gray-900 placeholder-slate-500 outline-none focus:border-brand-500/50 transition-all"
          />
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 border border-white/10 dark:border-white/10 border-gray-200 hover:bg-white/5 dark:hover:bg-white/5 hover:bg-gray-100 transition-all whitespace-nowrap"
        >
          <Download size={12} /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-white/10 dark:border-white/10 border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-white/5 dark:bg-white/5 bg-gray-50 border-b border-white/10 dark:border-white/10 border-gray-200">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="px-3 py-2.5 text-left font-semibold text-slate-400 dark:text-slate-400 text-gray-600 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-slate-200 dark:hover:text-slate-200 hover:text-gray-900 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' ? (
                          <ArrowUp size={10} className="text-brand-400" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <ArrowDown size={10} className="text-brand-400" />
                        ) : (
                          <ArrowUpDown size={10} className="opacity-30" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.025 }}
                  className="border-t border-white/5 dark:border-white/5 border-gray-100 hover:bg-white/5 dark:hover:bg-white/5 hover:bg-gray-50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2.5 text-slate-300 dark:text-slate-300 text-gray-700 font-mono whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{table.getFilteredRowModel().rows.length} total rows</span>
        <div className="flex items-center gap-2">
          <button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            className="p-1 rounded disabled:opacity-30 hover:text-slate-300 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <span>
            Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
          </span>
          <button
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            className="p-1 rounded disabled:opacity-30 hover:text-slate-300 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
