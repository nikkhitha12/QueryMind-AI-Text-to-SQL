import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useThemeStore } from './store/themeStore'
import { useConfigStore } from './store/configStore'
import AppLayout from './components/layout/AppLayout'
import ChatPage from './pages/ChatPage'
import DatabasePage from './pages/DatabasePage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  const { isDark } = useThemeStore()
  const fetchConfig = useConfigStore((s) => s.fetchConfig)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  useEffect(() => {
    fetchConfig()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<ChatPage />} />
        <Route path="database" element={<DatabasePage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
