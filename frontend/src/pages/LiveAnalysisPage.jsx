import { useState } from 'react'
import { CONTROL_PRESETS, DOMAINS, MAX_RUL } from '../data/presets'
import { formatCycles, getHealthClass } from '../lib/telemetry'
import { requestPrediction } from '../lib/api'
import ProbabilityChart from '../components/ProbabilityChart'
import MultiProbabilityChart from '../components/MultiProbabilityChart'

const PRESET_COLORS = {
  'Flight-Test Fresh': '#7ef2b8',
  'Ocean Patrol': '#ffca66',
  'High-Stress Run': '#ff6f83',
}

function LiveAnalysisPage() {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [ran, setRan] = useState(false)
  const [domain, setDomain] = useState(DOMAINS[0].id)
  
  const runAll = async () => {
    setLoading(true)
    setRan(false)
    const newResults = {}
    
    const promises = CONTROL_PRESETS.map(async (preset) => {
      try {
        const data = await requestPrediction({
          wear: preset.wearLevel,
          severity: preset.missionSeverity,
          thermal: preset.thermalStress,
          cycle: preset.cycleBias,
          volatility: preset.volatility,
          domain: domain
        })
        return { name: preset.name, result: { ...data, preset } }
      } catch {
        return { name: preset.name, result: { error: true, preset } }
      }
    })

    const resolved = await Promise.all(promises)
    for (const { name, result } of resolved) {
      newResults[name] = result
    }

    setResults(newResults)
    setLoading(false)
    setRan(true)
  }

  const maxRul = Math.max(...Object.values(results).map(r => r.RUL || 0), 1)

  return (
    <section className="page-stack">
      <section className="hero panel">
        <div className="hero-copy">
          <span className="eyebrow gold">Comparative Intelligence</span>
          <h1>Live Mission Profile Analysis</h1>
          <p className="body-copy">
            Run all three mission presets simultaneously through the Bidirectional LSTM model. 
            Compare predicted RUL, uncertainty intervals, and risk profiles across different 
            engine operational states in real-time.
          </p>

          <div className="domain-select-wrapper" style={{ marginTop: '28px', maxWidth: '300px' }}>
            <span className="eyebrow" style={{ display: 'block', marginBottom: '8px' }}>Select Engine Architecture</span>
            <select 
              className="domain-select" 
              value={domain} 
              onChange={(e) => setDomain(e.target.value)}
            >
              {DOMAINS.map(d => <option key={d.id} value={d.id}>{d.name} ({d.id})</option>)}
            </select>
          </div>
        </div>
        <button
          className="primary-button large"
          onClick={runAll}
          disabled={loading}
          style={{ minWidth: '220px' }}
        >
          {loading ? '⟳ Running All Presets...' : '▶ Run Live Comparison'}
        </button>
      </section>

      {/* Preset Cards */}
      <section className="live-grid">
        {CONTROL_PRESETS.map(preset => {
          const r = results[preset.name]
          const color = PRESET_COLORS[preset.name]
          const rul = r?.RUL ?? null
          const uncertainty = r?.uncertainty ?? null
          const status = r?.status ?? '—'
          const riskPct = rul !== null ? Math.round((1 - rul / MAX_RUL) * 100) : null

          return (
            <div key={preset.name} className="live-card panel" style={{ borderTop: `3px solid ${color}` }}>
              <div className="live-card-header">
                <div>
                  <span className="eyebrow" style={{ color }}>{preset.name}</span>
                  <h2 className="live-rul">
                    {rul !== null ? Math.round(rul) : (loading ? '...' : '—')}
                    <em>cycles RUL</em>
                  </h2>
                </div>
                {status !== '—' && (
                  <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
                )}
              </div>

              {/* RUL Bar */}
              <div className="live-bar-wrap">
                <div className="live-bar-track">
                  <div
                    className="live-bar-fill"
                    style={{
                      width: rul !== null ? `${Math.min((rul / MAX_RUL) * 100, 100)}%` : '0%',
                      background: color,
                      transition: 'width 1s ease',
                    }}
                  />
                </div>
                <span className="live-bar-pct">{rul !== null ? `${Math.round((rul / MAX_RUL) * 100)}% life remaining` : '—'}</span>
              </div>

              {/* Stats Row */}
              <div className="live-stats">
                <div className="live-stat-item">
                  <span>Risk Score</span>
                  <strong style={{ color }}>{riskPct !== null ? `${riskPct}%` : '—'}</strong>
                </div>
                <div className="live-stat-item">
                  <span>Uncertainty</span>
                  <strong>±{uncertainty !== null ? uncertainty.toFixed(1) : '—'} cycles</strong>
                </div>
                <div className="live-stat-item">
                  <span>Conservative RUL</span>
                  <strong>{rul !== null ? Math.max(0, Math.round(rul - 1.96 * uncertainty)) : '—'} cycles</strong>
                </div>
                <div className="live-stat-item">
                  <span>Wear Level</span>
                  <strong>{Math.round(preset.wearLevel * 100)}%</strong>
                </div>
              </div>

              {/* Live Bell Curve */}
              {rul !== null && (
                <ProbabilityChart mean={rul} sd={uncertainty} />
              )}

              {!ran && !loading && (
                <div className="live-placeholder">
                  Click "Run Live Comparison" to generate prediction
                </div>
              )}
            </div>
          )
        })}
      </section>

      {/* Comparison Chart */}
      {ran && (
        <section className="panel info-panel">
          <span className="eyebrow-accent">Side-by-Side Comparison</span>
          <h2>RUL Comparison — All Mission Profiles</h2>
          <div className="compare-bars">
            {CONTROL_PRESETS.map(preset => {
              const r = results[preset.name]
              const rul = r?.RUL ?? 0
              const color = PRESET_COLORS[preset.name]
              return (
                <div key={preset.name} className="compare-bar-row">
                  <span className="compare-label">{preset.name}</span>
                  <div className="compare-track">
                    <div
                      className="compare-fill"
                      style={{
                        width: `${Math.min((rul / maxRul) * 100, 100)}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}88)`,
                        transition: 'width 1s ease',
                      }}
                    />
                    <span className="compare-val">{Math.round(rul)} cycles</span>
                  </div>
                  <span className={`status-badge small ${(r?.status || '').toLowerCase()}`}>{r?.status || '—'}</span>
                </div>
              )
            })}
          </div>

          <div className="compare-insight panel" style={{ marginTop: '24px', background: 'rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: 'var(--accent)', marginBottom: '12px' }}>Key Insight</h3>
            <p className="body-copy">
              The RUL spread across presets demonstrates the model's sensitivity to operational stress.
              The gap between <strong style={{ color: '#7ef2b8' }}>Flight-Test Fresh</strong> and{' '}
              <strong style={{ color: '#ff6f83' }}>High-Stress Run</strong> quantifies the degradation 
              cost of high-severity missions. This comparison can guide fleet scheduling decisions — 
              alternating high-stress and low-stress missions extends overall fleet lifecycle.
            </p>
          </div>

          <div style={{ marginTop: '40px' }} className="panel chart-panel">
            <div className="section-heading compact">
              <div>
                <span className="eyebrow">Predictive Analytics</span>
                <h2>Probability Density & Confidence Intervals</h2>
                <p className="body-copy">
                  This chart visualizes the <strong>Probability Density Function (PDF)</strong> of the Remaining Useful Life for all three mission profiles simultaneously. 
                  <br/><br/>
                  <strong>How to interpret this analysis:</strong><br/>
                  • The <strong>X-axis</strong> represents the predicted RUL. The further left a curve sits, the sooner the engine requires maintenance.<br/>
                  • The <strong>Y-axis (Probability Density)</strong> represents the model's confidence. Taller, narrower peaks indicate high certainty in the prediction.<br/>
                  • <strong>Key Insight:</strong> Notice how the <strong>High-Stress Run (Red)</strong> curve is positioned far to the left and is very sharp. This indicates the model is highly certain that failure is imminent. Conversely, the <strong>Flight-Test Fresh (Green)</strong> curve is wider, reflecting the natural uncertainty when predicting long-term survival for a healthy engine.
                </p>
              </div>
            </div>
            <MultiProbabilityChart results={results} />
          </div>
        </section>
      )}
    </section>
  )
}

export default LiveAnalysisPage
