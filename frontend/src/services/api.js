const API_BASE_URL = import.meta.env.VITE_API_URL;

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.detail || `Request failed (${res.status})`
    );
  }

  return res.json();
}


// =========================
// Query API
// =========================

export function queryApi(question) {
  return apiFetch('/api/query', {
    method: 'POST',
    body: JSON.stringify({
      question,
    }),
  });
}


// =========================
// Streaming Query API
// =========================

export async function* streamQuery(question) {
  const res = await fetch(
    `${API_BASE_URL}/api/query/stream`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));

    throw new Error(
      err.detail || `Request failed (${res.status})`
    );
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, {
      stream: true,
    });

    const lines = buffer.split('\n');

    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          yield JSON.parse(line.slice(6));
        } catch {
          // Ignore malformed SSE data
        }
      }
    }
  }
}


// =========================
// Database Connect API
// =========================

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
  });
}


// =========================
// Schema API
// =========================

export function getSchemaApi() {
  return apiFetch('/api/schema');
}


// =========================
// Config API
// =========================

export function getConfigApi() {
  return apiFetch('/api/config');
}