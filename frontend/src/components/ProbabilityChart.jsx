function ProbabilityChart({ mean, sd }) {
  const safeSd = Math.max(Number(sd) || 5, 0.1)
  const safeMean = Number(mean) || 0

  const points = []
  const start = safeMean - 4 * safeSd
  const end = safeMean + 4 * safeSd
  const step = (end - start) / 60

  for (let x = start; x <= end; x += step) {
    const exponent = -Math.pow(x - safeMean, 2) / (2 * Math.pow(safeSd, 2))
    const y = (1 / (safeSd * Math.sqrt(2 * Math.PI))) * Math.exp(exponent)
    points.push({ x, y })
  }

  const maxX = Math.max(...points.map(p => p.x))
  const minX = Math.min(...points.map(p => p.x))
  const maxY = Math.max(...points.map(p => p.y))
  const range = maxX - minX || 1

  const svgPoints = points.map(p => {
    const x = ((p.x - minX) / range) * 350 + 30
    const y = 160 - (p.y / maxY) * 120
    return `${x},${y}`
  }).join(' ')

  // Unique gradient ID so SVG re-renders on each prediction
  const gradId = `gp-${Math.round(safeMean)}-${Math.round(safeSd * 10)}`

  return (
    <div className="prob-chart-container">
      <svg viewBox="0 0 400 230" className="prob-svg">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Axes */}
        <line x1="30" y1="160" x2="380" y2="160" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <line x1="30" y1="30" x2="30" y2="160" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

        {/* Bell Curve Fill */}
        <path d={`M 30,160 L ${svgPoints} L 380,160 Z`} fill={`url(#${gradId})`} />
        {/* Bell Curve Stroke */}
        <path d={`M 30,160 L ${svgPoints} L 380,160`} fill="none" stroke="var(--accent)" strokeWidth="2.5" />

        {/* Mean Line */}
        <line x1={205} y1={30} x2={205} y2={160} stroke="rgba(255,255,255,0.4)" strokeDasharray="5 3" />

        {/* ±1SD Lines */}
        <line x1={145} y1={80} x2={145} y2={160} stroke="rgba(255,202,102,0.4)" strokeDasharray="3 2" />
        <line x1={265} y1={80} x2={265} y2={160} stroke="rgba(255,202,102,0.4)" strokeDasharray="3 2" />

        {/* Axis Labels */}
        <text x={205} y={178} textAnchor="middle" fill="var(--text)" fontSize="9" fontWeight="bold">
          {Math.round(safeMean)} cycles (mean)
        </text>
        <text x={145} y={178} textAnchor="middle" fill="rgba(255,202,102,0.8)" fontSize="8">
          -{safeSd.toFixed(1)}
        </text>
        <text x={265} y={178} textAnchor="middle" fill="rgba(255,202,102,0.8)" fontSize="8">
          +{safeSd.toFixed(1)}
        </text>

        {/* Axis Titles */}
        <text x={205} y={220} textAnchor="middle" fill="var(--muted)" fontSize="8">
          PREDICTED RUL (CYCLES)
        </text>
        <text x={12} y={95} transform="rotate(-90 12,95)" fill="var(--muted)" fontSize="8">
          PROB.
        </text>
      </svg>

      <div className="prob-meta">
        <p className="chart-explanation">
          <strong>Live Confidence Distribution:</strong> 20 Monte Carlo passes each prediction.
          Mean RUL = <strong style={{ color: 'var(--accent)' }}>{Math.round(safeMean)} cycles</strong>,
          uncertainty = ±{safeSd.toFixed(1)} cycles.
          {safeSd < 6 ? ' ✓ High confidence — narrow curve.' : ' ⚠ Moderate uncertainty — complex degradation state.'}
        </p>
      </div>
    </div>
  )
}

export default ProbabilityChart
