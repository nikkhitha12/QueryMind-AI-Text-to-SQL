import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

function StepDetail({ detail }) {
  if (!detail) return null

  return (
    <div className="mt-1.5 space-y-1">
      {/* Tables list */}
      {detail.tables?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {detail.tables.map((t) => (
            <span
              key={t}
              className="px-1.5 py-0.5 rounded bg-brand-500/15 text-brand-400 text-[9px] font-mono border border-brand-500/20"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Schema preview */}
      {detail.preview && (
        <pre className="text-[9px] font-mono text-slate-500 overflow-hidden leading-tight whitespace-pre-wrap break-all max-h-14">
          {detail.preview.slice(0, 200)}{detail.preview.length > 200 ? '…' : ''}
        </pre>
      )}

      {/* SQL preview */}
      {detail.sql && (
        <pre className="text-[9px] font-mono text-green-400 overflow-hidden leading-tight whitespace-pre-wrap break-all max-h-10">
          {detail.sql.slice(0, 150)}{detail.sql.length > 150 ? '…' : ''}
        </pre>
      )}

      {/* Results count */}
      {detail.rows !== undefined && (
        <span className="text-[9px] font-mono text-emerald-400">
          {detail.rows} row{detail.rows !== 1 ? 's' : ''} · {detail.columns} column{detail.columns !== 1 ? 's' : ''}
        </span>
      )}

      {/* Generic message (only shown when no structured detail above) */}
      {!detail.tables?.length && !detail.preview && !detail.sql && detail.rows === undefined && detail.message && (
        <span className="text-[9px] text-slate-500">{detail.message}</span>
      )}
    </div>
  )
}

export default function AgentTimeline({ steps = [], compact = false }) {
  return (
    <div className="space-y-0">
      {steps.map((s, i) => (
        <motion.div
          key={`${s.step}-${i}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="flex items-start gap-2.5"
        >
          {/* Icon + connector */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="mt-0.5">
              {s.status === 'done' ? (
                <CheckCircle2 size={compact ? 13 : 16} className="text-green-400" />
              ) : s.status === 'active' ? (
                <Loader2 size={compact ? 13 : 16} className="text-brand-400 animate-spin" />
              ) : (
                <Circle size={compact ? 13 : 16} className="text-slate-600" />
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-px my-1 ${s.status === 'done' ? 'bg-green-400/30' : 'bg-white/10 dark:bg-white/10 bg-gray-200'}`}
                style={{ height: compact ? 14 : 20 }}
              />
            )}
          </div>

          {/* Label + detail */}
          <div className={`min-w-0 flex-1 ${compact ? 'pb-0' : 'pb-1'}`}>
            <p className={`font-medium leading-none ${compact ? 'text-[11px]' : 'text-sm'} ${s.status === 'done' ? 'text-slate-300 dark:text-slate-300 text-gray-700' : 'text-slate-500'}`}>
              {s.step}
            </p>
            {s.time && (
              <p className={`font-mono text-slate-600 mt-0.5 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>{s.time}</p>
            )}
            {s.detail && <StepDetail detail={s.detail} />}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
