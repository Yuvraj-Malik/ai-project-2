import { FEATURE_COUNT, SEQUENCE_LENGTH } from '../data/presets'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export function buildTelemetry(profile) {
  return Array.from({ length: SEQUENCE_LENGTH }, (_, step) => {
    const progress = step / (SEQUENCE_LENGTH - 1)
    const fatigue = profile.wearLevel * Math.pow(progress, 1.25)
    const thermalWave = profile.thermalStress * (0.45 + 0.55 * progress)
    const missionWave = profile.missionSeverity * (0.25 + 0.75 * progress)

    return Array.from({ length: FEATURE_COUNT }, (_, sensorIndex) => {
      const bandBias = sensorIndex < 3 ? 0.08 : sensorIndex < 8 ? 0.14 : sensorIndex < 13 ? 0.2 : 0.26
      const oscillation = Math.sin(progress * Math.PI * (2.3 + sensorIndex * 0.08) + sensorIndex * 0.42)
      const drift = fatigue * (0.16 + sensorIndex * 0.01)
      const thermalLift = thermalWave * (0.06 + (sensorIndex % 4) * 0.012)
      const missionLift = missionWave * (0.04 + (sensorIndex % 5) * 0.009)
      const signal = 0.12 + bandBias + profile.cycleBias * 0.08 + drift + thermalLift + missionLift + oscillation * profile.volatility * 0.035

      return Number(clamp(signal, 0.02, 0.98).toFixed(4))
    })
  })
}

export function seriesFromSequence(sequence, columnIndex) {
  return sequence.map((row) => row[columnIndex])
}

export function latestRow(sequence) {
  return sequence[sequence.length - 1] ?? []
}

export function getHealthClass(status) {
  switch (status) {
    case 'SAFE':
      return 'safe'
    case 'WARNING':
      return 'warning'
    case 'CRITICAL':
      return 'critical'
    default:
      return 'neutral'
  }
}

export function formatCycles(value) {
  return `${Number(value).toFixed(1)} cycles`
}
