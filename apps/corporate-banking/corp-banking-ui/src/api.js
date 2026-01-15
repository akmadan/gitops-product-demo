async function parseBody(res) {
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return await res.json()
  return await res.text()
}

export async function http(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  })

  const payload = await parseBody(res)
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}`)
    err.status = res.status
    err.payload = payload
    throw err
  }
  return payload
}
