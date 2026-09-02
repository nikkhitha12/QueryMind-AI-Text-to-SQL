import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { streamQuery } from '../services/api'

let _id = 1

export const useChatStore = create(
  persist(
    (set, get) => ({
      conversations: [],
      activeId: null,
      isLoading: false,
      agentStatus: null,
      // Increments each time a streaming event arrives — used as a scroll trigger.
      streamTick: 0,

      newConversation: () => {
        const id = String(_id++)
        const conv = {
          id,
          title: 'New Chat',
          messages: [],
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ conversations: [conv, ...s.conversations], activeId: id }))
        return id
      },

      setActive: (id) => set({ activeId: id }),

      activeConversation: () => {
        const { conversations, activeId } = get()
        return conversations.find((c) => c.id === activeId) || null
      },

      sendMessage: async (text) => {
        let id = get().activeId
        if (!id) id = get().newConversation()

        const userMsgId = String(Date.now())
        const assistantMsgId = String(Date.now() + 1)

        const userMsg = {
          id: userMsgId,
          role: 'user',
          content: text,
          ts: new Date().toISOString(),
        }

        // The streaming assistant card is added immediately and manages its own
        // loading state via isStreaming + streamEvents.
        const streamingMsg = {
          id: assistantMsgId,
          role: 'assistant',
          ts: new Date().toISOString(),
          isStreaming: true,
          streamEvents: [],
          content: '',
          sql: '',
          result: { columns: [], rows: [] },
          timeline: [],
          stats: {},
          tokenUsage: {},
          tablesUsed: [],
        }

        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id
              ? { ...c, title: text.slice(0, 42), messages: [...c.messages, userMsg, streamingMsg] }
              : c
          ),
          isLoading: false,
          agentStatus: null,
        }))

        // Patch top-level fields on the assistant message.
        const patchMsg = (patch) =>
          set((s) => ({
            conversations: s.conversations.map((c) =>
              c.id === id
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantMsgId ? { ...m, ...patch } : m
                    ),
                  }
                : c
            ),
          }))

        // Append one SSE event and optionally patch top-level fields atomically.
        const addEvent = (ev, extraPatch = {}) =>
          set((s) => {
            const conv = s.conversations.find((c) => c.id === id)
            const msg = conv?.messages.find((m) => m.id === assistantMsgId)
            const newEvents = [...(msg?.streamEvents ?? []), ev]
            return {
              streamTick: s.streamTick + 1,
              conversations: s.conversations.map((c) =>
                c.id === id
                  ? {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === assistantMsgId
                          ? { ...m, ...extraPatch, streamEvents: newEvents }
                          : m
                      ),
                    }
                  : c
              ),
            }
          })

        try {
          for await (const event of streamQuery(text)) {
            if (event.type === 'complete') {
              patchMsg({
                isStreaming: false,
                sql: event.sql ?? '',
                result: event.result ?? { columns: [], rows: [] },
                timeline: event.timeline ?? [],
                stats: event.stats ?? {},
                tokenUsage: event.tokenUsage ?? {},
                tablesUsed: event.tablesUsed ?? [],
              })
            } else {
              // Mirror key data into top-level fields so tabs work immediately.
              const extra = {}
              if (event.type === 'sql_generated') extra.sql = event.sql ?? ''
              if (event.type === 'answer') extra.content = event.content ?? ''
              if (event.type === 'sql_result') {
                extra.result = { columns: event.columns ?? [], rows: event.rows ?? [] }
              }
              addEvent(event, extra)
            }
          }
        } catch (err) {
          patchMsg({
            isStreaming: false,
            content: `Error: ${err.message}`,
          })
        }
      },

      deleteConversation: (id) =>
        set((s) => ({
          conversations: s.conversations.filter((c) => c.id !== id),
          activeId: s.activeId === id ? null : s.activeId,
        })),
    }),
    {
      name: 'qm-chat',
      // Don't persist streaming state or the tick counter.
      partialize: (state) => ({
        activeId: state.activeId,
        conversations: state.conversations.map((c) => ({
          ...c,
          messages: c.messages.map(({ streamEvents, isStreaming, ...m }) => m),
        })),
      }),
    }
  )
)
