import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const EXAMPLES = [
  { q: 'Show top 10 students by CGPA', emoji: '🎓' },
  { q: 'Find total sales revenue this month', emoji: '📊' },
  { q: 'List employees with salary greater than 50000', emoji: '💼' },
  { q: 'Which branch has the highest average CGPA?', emoji: '🏆' },
  { q: 'Count students per department', emoji: '📈' },
  { q: 'Show all results where marks are below 40', emoji: '⚠️' },
]

export default function WelcomeScreen({ onSelect }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-10 text-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mb-5 shadow-2xl glow"
      >
        <Sparkles className="w-8 h-8 text-white" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-2xl font-bold text-gradient mb-2"
      >
        Ask your database anything
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-sm text-slate-400 dark:text-slate-400 text-gray-500 mb-8 max-w-sm"
      >
        Connect your database and start asking questions in natural language. No SQL knowledge required.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg"
      >
        {EXAMPLES.map(({ q, emoji }, i) => (
          <motion.button
            key={q}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 + i * 0.05 }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(q)}
            className="flex items-start gap-3 text-left px-4 py-3 rounded-xl border border-white/10 dark:border-white/10 border-gray-200 bg-white/5 dark:bg-white/5 bg-white hover:border-brand-500/40 hover:bg-brand-500/5 transition-all group"
          >
            <span className="text-lg flex-shrink-0">{emoji}</span>
            <span className="text-sm text-slate-400 dark:text-slate-400 text-gray-600 group-hover:text-slate-200 dark:group-hover:text-slate-200 group-hover:text-gray-900 transition-colors leading-snug">
              {q}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
