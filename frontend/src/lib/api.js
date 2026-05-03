export async function requestPrediction(sliders) {
  const response = await fetch('http://127.0.0.1:5000/predict', {
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
  const response = await fetch('http://127.0.0.1:5000/demo')
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error || 'Demo request failed')
  }

  return payload
}

export async function requestHealth() {
  const response = await fetch('http://127.0.0.1:5000/health')
  return response.ok
}