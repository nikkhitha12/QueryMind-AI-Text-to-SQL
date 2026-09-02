import { useState } from 'react'
import { ChevronRight, ChevronDown, Table2, Key, Link, Dot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SchemaExplorer({ schema = {} }) {
  const [expanded, setExpanded] = useState({})
  const [selected, setSelected] = useState(null)

  function toggle(table) {
    setExpanded((p) => ({ ...p, [table]: !p[table] }))
  }

  return (
    <div className="font-mono text-xs space-y-0.5">
      {Object.entries(schema).map(([table, cols]) => (
        <div key={table}>
          <button
            onClick={() => toggle(table)}
            className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-lg hover:bg-white/5 dark:hover:bg-white/5 hover:bg-gray-100 transition-all text-left group"
          >
            {expanded[table] ? (
              <ChevronDown size={12} className="text-slate-400 flex-shrink-0" />
            ) : (
              <ChevronRight size={12} className="text-slate-400 flex-shrink-0" />
            )}
            <Table2 size={12} className="text-brand-400 flex-shrink-0" />
            <span className="font-semibold text-slate-200 dark:text-slate-200 text-gray-900">{table}</span>
            <span className="ml-auto text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">
              {cols.length} cols
            </span>
          </button>

          <AnimatePresence>
            {expanded[table] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden ml-4 pl-2 border-l border-white/10 dark:border-white/10 border-gray-200"
              >
                {cols.map((col) => (
                  <button
                    key={col.name}
                    onClick={() => setSelected(selected?.name === col.name && selected?.table === table ? null : { ...col, table })}
                    className={`flex items-center gap-1.5 w-full px-2 py-1.5 rounded-lg transition-all text-left ${
                      selected?.name === col.name && selected?.table === table
                        ? 'bg-brand-500/15 text-brand-300'
                        : 'text-slate-500 dark:text-slate-500 text-gray-500 hover:bg-white/5 dark:hover:bg-white/5 hover:bg-gray-100 hover:text-slate-300'
                    }`}
                  >
                    {col.pk ? (
                      <Key size={10} className="text-yellow-400 flex-shrink-0" />
                    ) : col.fk ? (
                      <Link size={10} className="text-blue-400 flex-shrink-0" />
                    ) : (
                      <Dot size={10} className="text-slate-600 flex-shrink-0" />
                    )}
                    <span className={col.pk ? 'text-yellow-300' : col.fk ? 'text-blue-300' : ''}>{col.name}</span>
                    <span className="ml-auto text-slate-600 text-[10px]">{col.type}</span>
                    {col.nullable && <span className="text-slate-700 text-[9px]">null</span>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
