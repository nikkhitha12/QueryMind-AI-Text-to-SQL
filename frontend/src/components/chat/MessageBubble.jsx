import { motion } from 'framer-motion'
import { User, Bot } from 'lucide-react'
import AssistantCard from './AssistantCard'

export default function MessageBubble({ message }) {
  if (message.role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 justify-end"
      >
        <div className="max-w-[75%] px-4 py-3 rounded-2xl rounded-tr-sm bg-brand-600 text-white text-sm leading-relaxed shadow-lg">
          {message.content}
        </div>
        <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5">
          <User size={13} className="text-white" />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3"
    >
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5 glow-sm">
        <Bot size={13} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <AssistantCard message={message} />
      </div>
    </motion.div>
  )
}
