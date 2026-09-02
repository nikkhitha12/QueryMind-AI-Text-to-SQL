import { useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { PanelRight } from 'lucide-react'
import ChatInput from '../components/chat/ChatInput'
import MessageBubble from '../components/chat/MessageBubble'
import WelcomeScreen from '../components/chat/WelcomeScreen'
import { useChatStore } from '../store/chatStore'
import { useConfigStore } from '../store/configStore'

export default function ChatPage() {
  const { inspectorOpen, setInspectorOpen } = useOutletContext()
  const { sendMessage, activeConversation, isLoading } = useChatStore()
  const streamTick = useChatStore((s) => s.streamTick)
  const { model, dialect } = useConfigStore()
  const conv = activeConversation()
  const messages = conv?.messages || []
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isLoading, streamTick])

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-b border-white/10 dark:border-white/10 border-gray-200 bg-surface-50 dark:bg-surface-50 bg-white">
        <div>
          <h1 className="text-sm font-bold text-slate-100 dark:text-slate-100 text-gray-900">
            {conv?.title || 'QueryMind'}
          </h1>
          <p className="text-[11px] text-slate-500">
            {dialect?.toUpperCase() || 'PostgreSQL'} · {model || '—'}
          </p>
        </div>
        {!inspectorOpen && messages.some((m) => m.role === 'assistant') && (
          <button
            onClick={() => setInspectorOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:bg-white/10 dark:hover:bg-white/10 hover:bg-gray-100 transition-all"
            title="Open Inspector"
          >
            <PanelRight size={16} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <WelcomeScreen onSelect={sendMessage} />
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-white/10 dark:border-white/10 border-gray-200 bg-surface-50 dark:bg-surface-50 bg-white">
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
