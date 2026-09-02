import { motion } from 'framer-motion'
import { History, MessageSquare, Clock, Trash2, ChevronRight } from 'lucide-react'
import { useChatStore } from '../store/chatStore'
import { useNavigate } from 'react-router-dom'

export default function HistoryPage() {
  const { conversations, setActive, deleteConversation } = useChatStore()
  const navigate = useNavigate()

  function open(id) {
    setActive(id)
    navigate('/')
  }

  if (!conversations.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-8">
        <History size={48} className="text-slate-700 dark:text-slate-700 text-gray-300" />
        <h2 className="text-lg font-bold text-slate-300 dark:text-slate-300 text-gray-700">No history yet</h2>
        <p className="text-sm text-slate-500">Your conversations will appear here after you start chatting.</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center gap-2.5 mb-6">
        <History size={20} className="text-brand-400" />
        <h1 className="text-lg font-bold text-slate-100 dark:text-slate-100 text-gray-900">Query History</h1>
        <span className="ml-auto text-xs text-slate-500 bg-white/5 dark:bg-white/5 bg-gray-100 px-2.5 py-1 rounded-full">
          {conversations.length} chats
        </span>
      </div>

      <div className="space-y-2 max-w-3xl">
        {conversations.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.035 }}
            onClick={() => open(c.id)}
            className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 dark:border-white/10 border-gray-200 bg-white/5 dark:bg-white/5 bg-white hover:border-brand-500/30 hover:bg-brand-500/5 transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
              <MessageSquare size={16} className="text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 dark:text-slate-200 text-gray-900 truncate">{c.title || 'Untitled'}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock size={10} />
                  {new Date(c.createdAt).toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500">{c.messages.length} messages</span>
                <span className="text-[11px] text-green-400 font-medium">✓ Completed</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); deleteConversation(c.id) }}
                className="p-1.5 rounded-lg hover:bg-red-500/15 text-slate-500 hover:text-red-400 transition-all"
              >
                <Trash2 size={14} />
              </button>
              <ChevronRight size={15} className="text-slate-500" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
