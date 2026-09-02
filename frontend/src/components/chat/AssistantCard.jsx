import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Code2, Table2, BarChart3, GitBranch, Loader2 } from 'lucide-react'
import SqlEditor from '../sql/SqlEditor'
import ResultTable from '../table/ResultTable'
import AgentTimeline from '../timeline/AgentTimeline'
import QueryStats from './QueryStats'

const TABS = [
  { id: 'answer',   label: 'Answer',   icon: MessageSquare },
  { id: 'sql',      label: 'SQL',      icon: Code2 },
  { id: 'results',  label: 'Results',  icon: Table2 },
  { id: 'stats',    label: 'Stats',    icon: BarChart3 },
  { id: 'workflow', label: 'Workflow', icon: GitBranch },
]

/** Coerce any LLM content shape to a plain string. */
function toStr(content) {
  if (typeof content === 'string') return content
  if (Array.isArray(content))
    return content.map((b) => (typeof b === 'string' ? b : (b?.text ?? ''))).join('\n')
  return String(content ?? '')
}

/** Placeholder shown while a tab's data hasn't arrived yet. */
function Pending({ streaming, label }) {
  return (
    <div className="flex items-center gap-2 py-2 text-slate-500 text-xs">
      {streaming && <Loader2 size={12} className="animate-spin text-brand-400 flex-shrink-0" />}
      <span>{label}</span>
    </div>
  )
}

export default function AssistantCard({ message }) {
  const [tab, setTab] = useState('answer')

  const { isStreaming = false, streamEvents = [] } = message

  // All event types that represent an agent execution stage
  const STAGE_TYPES = new Set([
    'init', 'status', 'tables_found', 'schema_retrieved',
    'sql_generated', 'sql_validated', 'results_retrieved', 'answer',
  ])

  // Build a live timeline with rich detail during streaming;
  // fall back to the final compact timeline once 'complete' arrives.
  const liveTimeline = isStreaming
    ? streamEvents
        .filter((e) => STAGE_TYPES.has(e.type))
        .map((e, i, arr) => ({
          step: e.step || e.type,
          status: i === arr.length - 1 ? 'active' : 'done',
          time: '',
          detail: {
            tables: e.tables,
            preview: e.preview,
            sql: e.sql,
            rows: e.rows,
            columns: e.columns,
            message: e.message,
          },
        }))
    : (message.timeline ?? [])

  const answerText = toStr(message.content)
  const hasSQL     = Boolean(message.sql)
  const hasResults = (message.result?.columns?.length ?? 0) > 0
  const hasStats   = Boolean(message.stats && Object.keys(message.stats).length)

  return (
    <div className="rounded-2xl border border-white/10 dark:border-white/10 border-gray-200 bg-white/5 dark:bg-white/5 bg-white shadow-xl overflow-hidden">

      {/* Tab bar */}
      <div className="flex items-center gap-0.5 px-3 pt-2 overflow-x-auto border-b border-white/10 dark:border-white/10 border-gray-200">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 whitespace-nowrap transition-all ${
              tab === id
                ? 'text-brand-400 border-brand-400 bg-brand-500/5'
                : 'text-slate-500 dark:text-slate-500 text-gray-500 border-transparent hover:text-slate-300 dark:hover:text-slate-300 hover:text-gray-700'
            }`}
          >
            <Icon size={11} />
            {label}
          </button>
        ))}

        {/* Spinning indicator while streaming */}
        {isStreaming && (
          <Loader2
            size={13}
            className="ml-auto mr-2 flex-shrink-0 text-brand-400 animate-spin"
          />
        )}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.14 }}
          className="p-4"
        >
          {tab === 'answer' && (
            answerText ? (
              <p className="text-sm text-slate-200 dark:text-slate-200 text-gray-800 leading-relaxed whitespace-pre-wrap">
                {answerText}
                {/* Blinking cursor while streaming */}
                {isStreaming && (
                  <span className="inline-block w-[3px] h-[1em] ml-0.5 bg-brand-400 animate-pulse rounded-sm align-middle" />
                )}
              </p>
            ) : (
              <Pending streaming={isStreaming} label="Generating answer…" />
            )
          )}

          {tab === 'sql' && (
            hasSQL
              ? <SqlEditor value={message.sql} readOnly />
              : <Pending streaming={isStreaming} label="SQL will appear here once generated." />
          )}

          {tab === 'results' && (
            hasResults
              ? <ResultTable columns={message.result.columns} rows={message.result.rows} />
              : <Pending streaming={isStreaming} label="Results will appear after the query executes." />
          )}

          {tab === 'stats' && (
            hasStats
              ? <QueryStats stats={message.stats} />
              : <Pending streaming={isStreaming} label="Execution stats will appear when complete." />
          )}

          {tab === 'workflow' && (
            liveTimeline.length > 0
              ? <AgentTimeline steps={liveTimeline} />
              : <Pending streaming={isStreaming} label="Agent workflow steps will appear here." />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
