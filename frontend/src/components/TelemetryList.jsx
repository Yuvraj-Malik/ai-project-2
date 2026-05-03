import { SENSOR_LABELS } from '../data/presets'

function TelemetryList({ row }) {
  return (
    <div className="sensor-list">
      {row.map((value, index) => (
        <div key={SENSOR_LABELS[index]} className="sensor-row">
          <div className="sensor-meta">
            <span>{SENSOR_LABELS[index]}</span>
            <strong>{value.toFixed(3)}</strong>
          </div>
          <div className="sensor-track">
            <div className="sensor-fill" style={{ width: `${Math.min(Math.max(value * 100, 8), 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default TelemetryList
