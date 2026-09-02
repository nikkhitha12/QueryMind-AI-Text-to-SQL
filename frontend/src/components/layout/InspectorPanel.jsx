import { X, Zap, Clock, Table2, Hash, Cpu, Link } from 'lucide-react'
import { motion } from 'framer-motion'
import AgentTimeline from '../timeline/AgentTimeline'

export default function InspectorPanel({ data, isLoading, agentStatus, onClose }) {
  const stats = data?.stats || {}
  const tokenUsage = data?.tokenUsage || {}

  return (
    <div className="h-full flex flex-col border-l border-white/10 dark:border-white/10 border-gray-200 bg-surface-50 dark:bg-surface-50 bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-white/10 dark:border-white/10 border-gray-200 bg-surface-50 dark:bg-surface-50 bg-white">
        <p className="text-sm font-semibold text-slate-200 dark:text-slate-200 text-gray-900 flex items-center gap-2">
          <Zap size={14} className="text-brand-400" />
          Inspector
        </p>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 hover:bg-gray-100 text-slate-400 transition-all">
          <X size={14} />
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Agent status */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-brand-500/30 bg-brand-500/8 p-3"
          >
            <p className="text-[10px] font-semibold text-brand-400 uppercase tracking-wider mb-1.5">Agent Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse flex-shrink-0" />
              <p className="text-xs text-slate-300 dark:text-slate-300 text-gray-700">{agentStatus || 'Processing...'}</p>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Query Stats</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Exec Time', value: stats.executionTime, icon: Clock, color: 'text-green-400' },
              { label: 'Rows', value: stats.rowsReturned, icon: Table2, color: 'text-blue-400' },
              { label: 'Columns', value: stats.columnsReturned, icon: Hash, color: 'text-purple-400' },
              { label: 'LLM', value: stats.llm, icon: Cpu, color: 'text-brand-400' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-xl p-2.5 bg-white/5 dark:bg-white/5 bg-gray-50 border border-white/10 dark:border-white/10 border-gray-200">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={10} className={color} />
                  <p className="text-[9px] text-slate-500 uppercase tracking-wide">{label}</p>
                </div>
                <p className="text-xs font-semibold text-slate-200 dark:text-slate-200 text-gray-900 truncate">{value ?? '—'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tables used */}
        {data?.tablesUsed?.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Tables Used</p>
            <div className="flex flex-wrap gap-1.5">
              {data.tablesUsed.map((t) => (
                <span key={t} className="flex items-center gap-1 px-2 py-1 rounded-md bg-brand-500/15 text-brand-300 text-[11px] font-mono border border-brand-500/20">
                  <Link size={9} />
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Token usage */}
        {tokenUsage.total > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Token Usage</p>
            <div className="rounded-xl bg-white/5 dark:bg-white/5 bg-gray-50 border border-white/10 dark:border-white/10 border-gray-200 p-3 space-y-2">
              {[
                { label: 'Prompt', value: tokenUsage.prompt, color: 'bg-blue-500', pct: Math.round((tokenUsage.prompt / tokenUsage.total) * 100) },
                { label: 'Completion', value: tokenUsage.completion, color: 'bg-purple-500', pct: Math.round((tokenUsage.completion / tokenUsage.total) * 100) },
              ].map(({ label, value, color, pct }) => (
                <div key={label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-slate-400">{label}</span>
                    <span className="text-[10px] font-mono text-slate-300 dark:text-slate-300 text-gray-700">{value?.toLocaleString()}</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/10 dark:bg-white/10 bg-gray-200">
                    <div className={`h-1 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-1 border-t border-white/10 dark:border-white/10 border-gray-200">
                <span className="text-[10px] text-slate-400">Total</span>
                <span className="text-[10px] font-mono font-semibold text-brand-400">{tokenUsage.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        {data?.timeline && (
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Agent Workflow</p>
            <AgentTimeline steps={data.timeline} compact />
          </div>
        )}
      </div>
    </div>
  )
}
