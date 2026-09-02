import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Copy, Download, Maximize2, Minimize2, Check } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SqlEditor({ value = '', onChange, readOnly = false }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function download() {
    const blob = new Blob([value], { type: 'text/sql' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'query.sql'
    a.click()
    URL.revokeObjectURL(url)
  }

  const editorClass = expanded
    ? 'fixed inset-4 z-50 rounded-2xl overflow-hidden shadow-2xl border border-white/20'
    : 'rounded-xl overflow-hidden border border-white/10 dark:border-white/10 border-gray-200'

  return (
    <div className={editorClass}>
      <div className="flex items-center justify-between px-3 py-2 bg-[#1e1e2e] border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/60" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <span className="w-3 h-3 rounded-full bg-green-500/60" />
          <span className="text-xs text-slate-500 font-mono ml-2">query.sql</span>
        </div>
        <div className="flex items-center gap-1">
          <motion.button whileTap={{ scale: 0.9 }} onClick={copy} className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all" title="Copy">
            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={download} className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all" title="Download">
            <Download size={13} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all" title={expanded ? 'Collapse' : 'Expand'}>
            {expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </motion.button>
        </div>
      </div>
      <Editor
        height={expanded ? 'calc(100vh - 112px)' : 190}
        defaultLanguage="sql"
        value={value}
        onChange={onChange}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: 'none',
          overviewRulerBorder: false,
          scrollbar: { vertical: 'hidden', horizontal: 'auto' },
          wordWrap: 'on',
        }}
      />
    </div>
  )
}
