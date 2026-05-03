import React from 'react'

const COLORS = {
  'Flight-Test Fresh': '#7ef2b8',
  'Ocean Patrol': '#ffd36e',
  'High-Stress Run': '#ff6f83',
}

// Standard normal PDF function
function normalPDF(x, mean, std) {
  const variance = std * std
  return Math.exp(-Math.pow(x - mean, 2) / (2 * variance)) / Math.sqrt(2 * Math.PI * variance)
}

function generateCurve(mean, sd, points = 100, xMin = 0, xMax = 150) {
  const curve = []
  const range = xMax - xMin
  for (let i = 0; i <= points; i++) {
    const x = xMin + (i / points) * range
    const y = normalPDF(x, mean, sd)
    curve.push({ x, y })
  }
  return curve
}

function MultiProbabilityChart({ results }) {
  if (!results || Object.keys(results).length === 0) return null

  // Ensure we have some valid results to plot
  const validResults = Object.values(results).filter(r => !r.error && r.RUL)
  if (validResults.length === 0) return <div className="placeholder-chart">Waiting for predictions...</div>

  // Find the global max probability for scaling the Y-axis
  let maxProb = 0.01
  const curvesData = validResults.map(r => {
    const mean = Number(r.RUL)
    const sd = Math.max(Number(r.uncertainty) || 5, 2)
    const curve = generateCurve(mean, sd, 80, 0, 150)
    
    const localMax = Math.max(...curve.map(p => p.y))
    if (localMax > maxProb) maxProb = localMax
    
    return { name: r.preset.name, color: COLORS[r.preset.name], curve, mean, sd }
  })

  // Viewport setup
  const width = 800
  const height = 280
  const padX = 50
  const padY = 30
  
  const toX = (val) => padX + (val / 150) * (width - padX * 2)
  const toY = (val) => height - padY - (val / (maxProb * 1.1)) * (height - padY * 2)

  const toPath = (curve) => {
    return curve.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.x)},${toY(p.y)}`).join(' ')
  }
  
  const toArea = (curve) => {
    const path = toPath(curve)
    return `${path} L ${toX(150)},${height - padY} L ${toX(0)},${height - padY} Z`
  }

  return (
    <div className="telemetry-chart-container" style={{ margin: '20px 0' }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="chart" style={{ width: '100%', height: 'auto', background: 'rgba(0,0,0,0.15)', borderRadius: '16px' }}>
        {/* X Axis */}
        <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <text x={padX} y={height - padY + 16} fill="var(--muted)" fontSize="10">0 CYCLES</text>
        <text x={width / 2} y={height - padY + 16} textAnchor="middle" fill="var(--muted)" fontSize="10">REMAINING USEFUL LIFE (CYCLES)</text>
        <text x={width - padX} y={height - padY + 16} textAnchor="end" fill="var(--muted)" fontSize="10">150 CYCLES</text>

        {/* Y Axis */}
        <line x1={padX} y1={height - padY} x2={padX} y2={padY} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <text x={padX - 25} y={height / 2} transform={`rotate(-90 ${padX - 25},${height / 2})`} textAnchor="middle" fill="var(--muted)" fontSize="10" letterSpacing="0.05em">PROBABILITY DENSITY</text>

        {/* Legend */}
        <g transform={`translate(${width - 150}, ${padY})`}>
          {curvesData.map((data, i) => (
            <g key={`legend-${data.name}`} transform={`translate(0, ${i * 20})`}>
              <circle cx="0" cy="4" r="5" fill={data.color} />
              <text x="12" y="8" fill="var(--text)" fontSize="11" letterSpacing="0.02em">{data.name}</text>
            </g>
          ))}
        </g>

        {/* Curves */}
        {curvesData.map(data => (
          <g key={data.name}>
            {/* Area Fill */}
            <path d={toArea(data.curve)} fill={data.color} opacity="0.15" />
            {/* Outline */}
            <path d={toPath(data.curve)} fill="none" stroke={data.color} strokeWidth="2" />
            
            {/* Mean Line */}
            <line 
              x1={toX(data.mean)} 
              y1={height - padY} 
              x2={toX(data.mean)} 
              y2={toY(normalPDF(data.mean, data.mean, data.sd))} 
              stroke={data.color} 
              strokeWidth="1" 
              strokeDasharray="4 4" 
              opacity="0.6"
            />
          </g>
        ))}
      </svg>
    </div>
  )
}

export default MultiProbabilityChart
