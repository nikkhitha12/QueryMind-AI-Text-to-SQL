import { Clock, Hash, Columns3, Database, Cpu } from 'lucide-react'

export default function QueryStats({ stats }) {
  const items = [
    { label: 'Execution Time', value: stats.executionTime, icon: Clock, color: 'text-green-400' },
    { label: 'Rows Returned', value: stats.rowsReturned, icon: Hash, color: 'text-blue-400' },
    { label: 'Columns', value: stats.columnsReturned, icon: Columns3, color: 'text-purple-400' },
    { label: 'Database', value: stats.database, icon: Database, color: 'text-orange-400' },
    { label: 'LLM Used', value: stats.llm, icon: Cpu, color: 'text-brand-400' },
  ]

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {items.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className={`rounded-xl p-3 bg-white/5 dark:bg-white/5 bg-gray-50 border border-white/10 dark:border-white/10 border-gray-200 ${label === 'Database' ? 'col-span-2' : ''}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <Icon size={11} className={color} />
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">{label}</p>
          </div>
          <p className="text-sm font-semibold text-slate-200 dark:text-slate-200 text-gray-900">{value ?? '—'}</p>
        </div>
      ))}
    </div>
  )
}
