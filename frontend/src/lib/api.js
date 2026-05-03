export async function requestPrediction(sliders) {
  const baseUrl = import.meta.env.VITE_API_URL || ''
  const response = await fetch(`${baseUrl}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sliders),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error || 'Prediction request failed')
  }

  return payload
}
export async function requestDemoPrediction() {
  const baseUrl = import.meta.env.VITE_API_URL || ''
  const response = await fetch(`${baseUrl}/demo`)
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error || 'Demo request failed')
  }

  return payload
}

export async function requestHealth() {
  const baseUrl = import.meta.env.VITE_API_URL || ''
  const response = await fetch(`${baseUrl}/health`)
  return response.ok
}