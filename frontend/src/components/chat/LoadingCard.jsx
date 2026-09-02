import { motion } from 'framer-motion'
import { Bot, Loader2 } from 'lucide-react'

export default function LoadingCard({ agentStatus }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3"
    >
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 glow-sm">
        <Bot size={14} className="text-white" />
      </div>
      <div className="rounded-2xl border border-brand-500/25 bg-brand-500/5 px-4 py-3 flex items-center gap-3">
        <Loader2 size={15} className="text-brand-400 animate-spin flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-brand-300">Agent working...</p>
          <p className="text-xs text-slate-500 mt-0.5">{agentStatus || 'Processing your query'}</p>
        </div>
      </div>
    </motion.div>
  )
}
