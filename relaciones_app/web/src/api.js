const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function fetchPeople(search = '') {
  const url = new URL(`${API_URL}/people`)
  if (search) {
    url.searchParams.set('search', search)
  }
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('No se pudo cargar la lista de personas')
  }
  return response.json()
}

export async function createRelationship(payload) {
  const response = await fetch(`${API_URL}/relationships`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'No se pudo guardar la relación')
  }
  return response.json()
}
