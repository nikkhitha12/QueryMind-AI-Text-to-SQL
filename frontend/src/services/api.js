async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Request failed (${res.status})`)
  }
  return res.json()
}

export function queryApi(question) {
  return apiFetch('/api/query', {
    method: 'POST',
    body: JSON.stringify({ question }),
  })
}

// Async generator that yields parsed SSE events from the streaming endpoint.
// Each yielded value is a plain object with a `type` field.
export async function* streamQuery(question) {
  const res = await fetch('/api/query/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Request failed (${res.status})`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          yield JSON.parse(line.slice(6))
        } catch {
          // ignore malformed lines
        }
      }
    }
  }
}

export function connectApi(form) {
  return apiFetch('/api/connect', {
    method: 'POST',
    body: JSON.stringify({
      host: form.host,
      port: Number(form.port) || 5432,
      username: form.username,
      password: form.password,
      database: form.database,
      ssl: form.ssl,
      type: form.type,
    }),
  })
}

export function getSchemaApi() {
  return apiFetch('/api/schema')
}

export function getConfigApi() {
  return apiFetch('/api/config')
}
