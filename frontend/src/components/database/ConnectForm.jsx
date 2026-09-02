import { useState } from 'react'
import { motion } from 'framer-motion'
import { Database, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useDbStore } from '../../store/dbStore'
import { connectApi } from '../../services/api'

const INPUT = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 dark:bg-white/5 bg-white border border-white/10 dark:border-white/10 border-gray-300 text-slate-100 dark:text-slate-100 text-gray-900 placeholder-slate-500 dark:placeholder-slate-500 placeholder-gray-400 outline-none focus:border-brand-500/60 focus:bg-brand-500/5 transition-all'

export default function ConnectForm() {
  const { addConnection, setSchema } = useDbStore()
  const [form, setForm] = useState({
    host: '', port: '5432', username: '', password: '',
    database: '', ssl: 'require', type: 'PostgreSQL',
  })
  const [status, setStatus] = useState(null) // null | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function connect(e) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const data = await connectApi(form)
      addConnection({ ...form, schema: data.schema })
      setSchema(data.schema)
      setStatus('success')
      setTimeout(() => setStatus(null), 3500)
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  return (
    <form onSubmit={connect} className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-1">
          <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Host</label>
          <input className={INPUT} placeholder="pg-xxx.aivencloud.com" value={form.host} onChange={set('host')} required />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Port</label>
          <input className={INPUT} placeholder="5432" value={form.port} onChange={set('port')} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Username</label>
          <input className={INPUT} placeholder="avnadmin" value={form.username} onChange={set('username')} required />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Password</label>
          <input className={INPUT} type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Database Name</label>
        <input className={INPUT} placeholder="defaultdb" value={form.database} onChange={set('database')} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Type</label>
          <select className={INPUT} value={form.type} onChange={set('type')}>
            <option>PostgreSQL</option>
            <option>MySQL</option>
            <option>SQLite</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">SSL Mode</label>
          <select className={INPUT} value={form.ssl} onChange={set('ssl')}>
            <option value="require">Require</option>
            <option value="prefer">Prefer</option>
            <option value="disable">Disable</option>
          </select>
        </div>
      </div>

      {status === 'error' && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span className="break-all">{errorMsg}</span>
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-400 hover:to-purple-500 text-white text-sm font-semibold transition-all shadow-lg disabled:opacity-70 flex items-center justify-center gap-2 mt-1"
      >
        {status === 'loading' ? (
          <><Loader2 size={15} className="animate-spin" /> Connecting...</>
        ) : status === 'success' ? (
          <><CheckCircle2 size={15} className="text-green-300" /> Connected Successfully!</>
        ) : (
          <><Database size={15} /> Connect Database</>
        )}
      </motion.button>
    </form>
  )
}
