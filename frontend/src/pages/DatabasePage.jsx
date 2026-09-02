import { motion } from 'framer-motion'
import { Database, CheckCircle2, Trash2 } from 'lucide-react'
import ConnectForm from '../components/database/ConnectForm'
import SchemaExplorer from '../components/database/SchemaExplorer'
import { useDbStore } from '../store/dbStore'

export default function DatabasePage() {
  const { connections, activeConnection, schema, removeConnection, setActiveConnection, setSchema } = useDbStore()

  function loadConnection(c) {
    setActiveConnection(c)
    // Each connection stores its schema from when it was first connected
    if (c.schema) {
      setSchema(c.schema)
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: connect form */}
      <div className="w-[400px] flex-shrink-0 border-r border-white/10 dark:border-white/10 border-gray-200 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center glow-sm">
              <Database size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 dark:text-slate-100 text-gray-900">Database Connections</h2>
              <p className="text-xs text-slate-500">Add a new connection</p>
            </div>
          </div>

          <ConnectForm />

          {connections.length > 0 && (
            <div className="mt-6">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Saved Connections</p>
              <div className="space-y-2">
                {connections.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => loadConnection(c)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      activeConnection?.id === c.id
                        ? 'border-brand-500/40 bg-brand-500/8'
                        : 'border-white/10 dark:border-white/10 border-gray-200 bg-white/5 dark:bg-white/5 bg-gray-50 hover:border-white/20 dark:hover:border-white/20 hover:border-gray-300'
                    }`}
                  >
                    <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 dark:text-slate-200 text-gray-900 truncate">{c.database || 'defaultdb'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{c.type} · {c.host || 'localhost'}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeConnection(c.id) }}
                      className="p-1.5 rounded-lg hover:bg-red-500/15 text-slate-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: schema explorer */}
      <div className="flex-1 overflow-y-auto p-6">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-4">Schema Explorer</p>
        {schema ? (
          <SchemaExplorer schema={schema} />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
            <Database size={40} className="text-slate-700 dark:text-slate-700 text-gray-300" />
            <p className="text-sm text-slate-500">Connect a database to explore its schema</p>
          </div>
        )}
      </div>
    </div>
  )
}
