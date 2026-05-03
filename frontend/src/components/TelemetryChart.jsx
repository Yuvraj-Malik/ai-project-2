function seriesToPoints(series, width, height, padding = 16) {
  const min = Math.min(...series)
  const max = Math.max(...series)
  const range = max - min || 1

  return series
    .map((value, index) => {
      const x = padding + (index / (series.length - 1)) * (width - padding * 2)
      const y = height - padding - ((value - min) / range) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')
}

function toPath(series, width, height, padding) {
  return `M ${seriesToPoints(series, width, height, padding).replaceAll(' ', ' L ')}`
}

function TelemetryChart({ primary, thermal, vibration }) {
  return (
    <div className="telemetry-chart-container">
      <svg className="chart" viewBox="0 0 760 260" role="img" aria-label="Telemetry trends">
        <defs>
          <linearGradient id="linePrimary" x1="0" x2="1">
            <stop offset="0%" stopColor="#6de6ff" />
            <stop offset="100%" stopColor="#a7ff83" />
          </linearGradient>
          <linearGradient id="lineThermal" x1="0" x2="1">
            <stop offset="0%" stopColor="#ffd36e" />
            <stop offset="100%" stopColor="#ff8a65" />
          </linearGradient>
          <linearGradient id="lineVibration" x1="0" x2="1">
            <stop offset="0%" stopColor="#d58bff" />
            <stop offset="100%" stopColor="#ff5f93" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="760" height="260" rx="24" className="chart-base" />
        
        {/* Axis Lines */}
        <line x1="40" y1="20" x2="40" y2="220" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <line x1="40" y1="220" x2="740" y2="220" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        
        {/* Labels */}
        <text x="10" y="120" transform="rotate(-90 15,120)" fill="var(--muted)" fontSize="10">MAGNITUDE</text>
        <text x="380" y="245" textAnchor="middle" fill="var(--muted)" fontSize="10">TIME (30 CYCLE WINDOW)</text>

        <path d={toPath(primary, 760, 260, 40)} className="chart-line" style={{ stroke: 'url(#linePrimary)' }} />
        <path d={toPath(thermal, 760, 260, 40)} className="chart-line secondary" style={{ stroke: 'url(#lineThermal)' }} />
        <path d={toPath(vibration, 760, 260, 40)} className="chart-line tertiary" style={{ stroke: 'url(#lineVibration)' }} />
      </svg>
      <div className="chart-caption">
        <strong>How to read:</strong> The gradients show the last 30 operational cycles. 
        Rising trendlines in thermal (orange) and vibration (purple) channels are the 
        direct signatures of component degradation used by the LSTM for RUL prediction.
      </div>
    </div>
  )
}

export default TelemetryChart
