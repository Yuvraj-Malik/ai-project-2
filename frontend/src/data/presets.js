export const SEQUENCE_LENGTH = 30
export const FEATURE_COUNT = 17
export const MAX_RUL = 125 // Updated to match piece-wise capping

export const DOMAINS = [
  { id: 'FD001', name: 'Standard (FD001)' },
  { id: 'FD002', name: 'High Alt/Variable (FD002)' },
  { id: 'FD003', name: 'Fault-Heavy (FD003)' },
  { id: 'FD004', name: 'Extreme Combo (FD004)' },
]

export const SENSOR_LABELS = Array.from({ length: FEATURE_COUNT }, (_, index) =>
  `Telemetry ${String(index + 1).padStart(2, '0')}`,
)

export const CONTROL_PRESETS = [
  {
    name: 'Flight-Test Fresh',
    wearLevel: 0.05,
    missionSeverity: 0.1,
    thermalStress: 0.08,
    cycleBias: 0.05,
    volatility: 0.05,
  },
  {
    name: 'Ocean Patrol',
    wearLevel: 0.45,
    missionSeverity: 0.4,
    thermalStress: 0.42,
    cycleBias: 0.35,
    volatility: 0.3,
  },
  {
    name: 'High-Stress Run',
    wearLevel: 0.85,
    missionSeverity: 0.9,
    thermalStress: 0.88,
    cycleBias: 0.75,
    volatility: 0.8,
  },
]

export const INITIAL_PROFILE = CONTROL_PRESETS[1]
