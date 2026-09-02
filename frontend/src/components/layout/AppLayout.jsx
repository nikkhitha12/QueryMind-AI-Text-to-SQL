import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import InspectorPanel from './InspectorPanel'
import { useChatStore } from '../../store/chatStore'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [inspectorOpen, setInspectorOpen] = useState(true)
  const { activeConversation, isLoading, agentStatus } = useChatStore()
  const conv = activeConversation()
  const lastAssistant = conv?.messages.filter((m) => m.role === 'assistant').at(-1)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface dark:bg-surface bg-gray-50">
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="flex-shrink-0 overflow-hidden"
          >
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="relative flex flex-col flex-1 min-w-0 overflow-hidden">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-3 left-3 z-50 p-2 rounded-lg glass hover:bg-white/10 transition-all text-slate-400"
          >
            <Menu size={16} />
          </button>
        )}
        <Outlet context={{ sidebarOpen, setSidebarOpen, inspectorOpen, setInspectorOpen }} />
      </div>

      {/* Inspector */}
      <AnimatePresence initial={false}>
        {inspectorOpen && lastAssistant && (
          <motion.div
            key="inspector"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="flex-shrink-0 overflow-hidden"
          >
            <InspectorPanel
              data={lastAssistant}
              isLoading={isLoading}
              agentStatus={agentStatus}
              onClose={() => setInspectorOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
