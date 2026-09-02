import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useDbStore = create(
  persist(
    (set) => ({
      connections: [],
      activeConnection: null,
      schema: null,

      addConnection: (conn) => {
        const c = {
          ...conn,
          id: String(Date.now()),
          connectedAt: new Date().toISOString(),
          status: 'connected',
        }
        set((s) => ({ connections: [c, ...s.connections], activeConnection: c }))
      },

      setActiveConnection: (conn) => set({ activeConnection: conn }),
      setSchema: (schema) => set({ schema }),

      removeConnection: (id) =>
        set((s) => ({
          connections: s.connections.filter((c) => c.id !== id),
          activeConnection: s.activeConnection?.id === id ? null : s.activeConnection,
        })),
    }),
    { name: 'qm-db' }
  )
)
