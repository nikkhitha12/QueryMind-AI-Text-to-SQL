import { useState, useRef } from 'react'
import { Send, Database, Paperclip, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ChatInput({ onSend, isLoading }) {
  const [value, setValue] = useState('')
  const ref = useRef()

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function submit() {
    const q = value.trim()
    if (!q || isLoading) return
    onSend(q)
    setValue('')
    ref.current?.focus()
  }

  return (
    <div>
      <div className="flex items-end gap-2 p-3 rounded-2xl border border-white/15 dark:border-white/15 border-gray-300 bg-white/5 dark:bg-white/5 bg-white shadow-xl">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask anything about your database..."
          rows={1}
          disabled={isLoading}
          className="flex-1 bg-transparent resize-none text-sm text-slate-100 dark:text-slate-100 text-gray-900 placeholder-slate-500 dark:placeholder-slate-500 placeholder-gray-400 outline-none max-h-36 overflow-y-auto leading-relaxed disabled:opacity-50"
          style={{ minHeight: 38 }}
        />
        <div className="flex items-center gap-1 flex-shrink-0">
          <button className="p-2 rounded-lg text-slate-500 hover:text-slate-300 dark:hover:text-slate-300 hover:text-gray-700 hover:bg-white/5 dark:hover:bg-white/5 hover:bg-gray-100 transition-all" title="Attach Schema">
            <Paperclip size={15} />
          </button>
          <button className="p-2 rounded-lg text-slate-500 hover:text-slate-300 dark:hover:text-slate-300 hover:text-gray-700 hover:bg-white/5 dark:hover:bg-white/5 hover:bg-gray-100 transition-all" title="Connect Database">
            <Database size={15} />
          </button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={submit}
            disabled={!value.trim() || isLoading}
            className="p-2 rounded-xl bg-gradient-to-r from-brand-500 to-purple-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-brand-400 hover:to-purple-500 transition-all shadow-lg"
          >
            {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </motion.button>
        </div>
      </div>
      <p className="text-center text-[10px] text-slate-600 dark:text-slate-600 text-gray-400 mt-2">
        QueryMind · Gemini 2.5 Flash · Always verify critical queries
      </p>
    </div>
  )
}
