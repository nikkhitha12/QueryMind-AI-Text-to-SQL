import { NavLink, useNavigate } from 'react-router-dom'
import { MessageSquare, Database, History, Settings, Plus, Trash2, X, Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
import { useChatStore } from '../../store/chatStore'
import { useThemeStore } from '../../store/themeStore'

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Sidebar({ onClose }) {
  const { conversations, activeId, newConversation, setActive, deleteConversation } = useChatStore()
  const { isDark, toggle } = useThemeStore()
  const navigate = useNavigate()

  function handleNew() {
    newConversation()
    navigate('/')
  }

  const navItems = [
    { to: '/', icon: MessageSquare, label: 'Chat' },
    { to: '/database', icon: Database, label: 'Database' },
    { to: '/history', icon: History, label: 'History' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="h-full flex flex-col border-r border-white/10 dark:border-white/10 border-gray-200 bg-surface-50 dark:bg-surface-50 bg-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 dark:border-white/10 border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg glow-sm flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16M9 11h6M9 15h4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100 dark:text-slate-100 text-gray-900 leading-none">QueryMind</p>
            <p className="text-[10px] text-slate-500 mt-0.5">AI Text-to-SQL</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 hover:bg-gray-100 text-slate-400 transition-all">
          <X size={15} />
        </button>
      </div>

      {/* New Chat */}
      <div className="p-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleNew}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white text-sm font-semibold transition-all shadow-lg"
        >
          <Plus size={15} />
          New Chat
        </motion.button>
      </div>

      {/* Nav */}
      <nav className="px-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
                isActive
                  ? 'bg-brand-500/15 text-brand-400'
                  : 'text-slate-400 dark:text-slate-400 text-gray-600 hover:bg-white/5 dark:hover:bg-white/5 hover:bg-gray-100 hover:text-slate-200 dark:hover:text-slate-200 hover:text-gray-900'
              )
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto mt-4 px-3 min-h-0">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-2">Recent</p>
        <div className="space-y-0.5">
          {conversations.slice(0, 25).map((c) => (
            <div
              key={c.id}
              onClick={() => { setActive(c.id); navigate('/') }}
              className={cn(
                'group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all text-xs',
                activeId === c.id
                  ? 'bg-brand-500/15 text-slate-200 dark:text-slate-200 text-gray-900'
                  : 'text-slate-500 dark:text-slate-500 text-gray-500 hover:bg-white/5 dark:hover:bg-white/5 hover:bg-gray-100 hover:text-slate-300'
              )}
            >
              <span className="truncate flex-1">{c.title || 'Untitled'}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteConversation(c.id) }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-400 transition-all flex-shrink-0"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
          {conversations.length === 0 && (
            <p className="text-xs text-slate-600 text-center py-6">No chats yet</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 dark:border-white/10 border-gray-200">
        <button
          onClick={toggle}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-white/5 dark:hover:bg-white/5 hover:bg-gray-100 hover:text-slate-200 dark:hover:text-slate-200 hover:text-gray-900 transition-all mb-1"
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">R</div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 dark:text-slate-200 text-gray-900 truncate">Nikhitha</p>
            <p className="text-[10px] text-slate-500 truncate">nikhithasudhagani12@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
