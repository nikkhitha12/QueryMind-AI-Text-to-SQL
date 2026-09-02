import { Settings, Moon, Sun, Key, User, Bell, Cpu } from 'lucide-react'
import { useThemeStore } from '../store/themeStore'
import { useConfigStore } from '../store/configStore'

const ROW = 'flex items-center justify-between p-4 rounded-xl border border-white/10 dark:border-white/10 border-gray-200 bg-white/5 dark:bg-white/5 bg-white'
const INPUT = 'px-3 py-2 rounded-lg text-sm bg-white/5 dark:bg-white/5 bg-gray-50 border border-white/10 dark:border-white/10 border-gray-300 text-slate-200 dark:text-slate-200 text-gray-900 outline-none focus:border-brand-500/50 w-44 transition-all'

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { isDark, toggle } = useThemeStore()
  const { model } = useConfigStore()

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center gap-2.5 mb-8">
        <Settings size={20} className="text-brand-400" />
        <h1 className="text-lg font-bold text-slate-100 dark:text-slate-100 text-gray-900">Settings</h1>
      </div>

      <div className="max-w-2xl space-y-8">
        <Section title="Appearance">
          <div className={ROW}>
            <div className="flex items-center gap-3">
              {isDark ? <Moon size={16} className="text-brand-400" /> : <Sun size={16} className="text-yellow-400" />}
              <div>
                <p className="text-sm font-semibold text-slate-200 dark:text-slate-200 text-gray-900">Theme</p>
                <p className="text-xs text-slate-500">{isDark ? 'Dark mode active' : 'Light mode active'}</p>
              </div>
            </div>
            <button
              onClick={toggle}
              className={`relative w-11 h-6 rounded-full transition-colors ${isDark ? 'bg-brand-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${isDark ? 'left-5.5' : 'left-0.5'}`}
                style={{ left: isDark ? '22px' : '2px' }}
              />
            </button>
          </div>
        </Section>

        <Section title="AI Configuration">
          {[
            { label: 'LLM Model', sub: 'Language model for SQL generation', value: model || '—', icon: Cpu },
            { label: 'Max Tokens', sub: 'Maximum tokens per response', value: '2048', icon: Cpu },
            { label: 'Temperature', sub: 'Creativity vs precision (0–1)', value: '0.1', icon: Cpu },
          ].map(({ label, sub, value, icon: Icon }) => (
            <div key={label} className={ROW}>
              <div>
                <p className="text-sm font-semibold text-slate-200 dark:text-slate-200 text-gray-900">{label}</p>
                <p className="text-xs text-slate-500">{sub}</p>
              </div>
              <input defaultValue={value} className={INPUT} />
            </div>
          ))}
        </Section>

        <Section title="API Keys">
          {[
            { label: 'Google API Key', icon: Key },
            { label: 'LangSmith API Key', icon: Key },
          ].map(({ label, icon: Icon }) => (
            <div key={label} className={ROW}>
              <div className="flex items-center gap-2.5">
                <Icon size={14} className="text-brand-400" />
                <p className="text-sm font-semibold text-slate-200 dark:text-slate-200 text-gray-900">{label}</p>
              </div>
              <input type="password" defaultValue="••••••••••••••••" className={INPUT} />
            </div>
          ))}
        </Section>

        <Section title="Profile">
  {[
    { label: 'Name', value: 'Nikhitha Sudhagani', icon: User },
    { label: 'Email', value: 'nikhitha@gmail.com', icon: Bell },
  ].map(({ label, value, icon: Icon }) => (
    <div key={label} className={ROW}>
      <div className="flex items-center gap-2.5">
        <Icon size={14} className="text-brand-400" />
        <p className="text-sm font-semibold text-slate-200 dark:text-slate-200 text-gray-900">
          {label}
        </p>
      </div>

      <input
        defaultValue={value}
        className={INPUT}
      />
    </div>
  ))}
</Section>

        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-400 hover:to-purple-500 text-white text-sm font-semibold transition-all shadow-lg">
          Save Settings
        </button>
      </div>
    </div>
  )
}
