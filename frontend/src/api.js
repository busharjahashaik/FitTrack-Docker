const API_BASE = '/fitness'

async function request(path = '', options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    })
  } catch {
    throw new Error('Cannot connect to the backend. Make sure CRUDServiceProject is running on port 8081.')
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    const bodyText = await response.text()
    try {
      const body = JSON.parse(bodyText)
      message = body.message || body.error || message
    } catch {
      if (bodyText) message = bodyText
    }
    throw new Error(message)
  }

  if (response.status === 204) return null
  const text = await response.text()
  if (!text) return null
  try { return JSON.parse(text) } catch { return text }
}

export const fitnessApi = {
  getAll: () => request('/displayall'),
  getById: (id) => request(`/${encodeURIComponent(id)}`),
  add: ({ challengeName, durationDays, participantCount, active }) => request('/add', {
    method: 'POST',
    body: JSON.stringify({ challengeName, durationDays, participantCount, active }),
  }),
  update: (id, item) => request(`/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(item) }),
  remove: (id) => request(`/delete/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  removeAll: () => request('/deleteall', { method: 'DELETE' }),
  search: (name) => request(`/searchByChallengeName?name=${encodeURIComponent(name)}`),
  getActive: (active) => request(`/active/${active}`),
  getDuration: (days) => request(`/duration/${days}`),
  getParticipants: (count) => request(`/participants/${count}`),
}
