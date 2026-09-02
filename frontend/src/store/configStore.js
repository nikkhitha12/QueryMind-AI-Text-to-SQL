import { create } from 'zustand'
import { getConfigApi } from '../services/api'

export const useConfigStore = create((set) => ({
  model: null,
  dialect: null,
  database: null,
  loaded: false,

  fetchConfig: async () => {
    try {
      const data = await getConfigApi()
      set({ model: data.model, dialect: data.dialect, database: data.database, loaded: true })
    } catch {
      set({ loaded: true })
    }
  },
}))
