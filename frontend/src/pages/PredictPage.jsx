import { useMemo, useState } from 'react'
import AdvisoryReport from '../components/AdvisoryReport'
import GaugeCard from '../components/GaugeCard'
import ProbabilityChart from '../components/ProbabilityChart'
import SliderField from '../components/SliderField'
import TelemetryChart from '../components/TelemetryChart'
import TelemetryList from '../components/TelemetryList'
import { CONTROL_PRESETS, DOMAINS, INITIAL_PROFILE, MAX_RUL } from '../data/presets'
import { buildTelemetry, formatCycles, getHealthClass, latestRow, seriesFromSequence } from '../lib/telemetry'
import { requestPrediction } from '../lib/api'

function PredictPage() {
  const [profile, setProfile] = useState(INITIAL_PROFILE)
  const [domain, setDomain] = useState(DOMAINS[0].id)
  const [sequence, setSequence] = useState(() => buildTelemetry(INITIAL_PROFILE))
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const primarySeries = useMemo(() => seriesFromSequence(sequence, 4), [sequence])
  const thermalSeries = useMemo(() => seriesFromSequence(sequence, 10), [sequence])
  const vibrationSeries = useMemo(() => seriesFromSequence(sequence, 15), [sequence])
  const row = latestRow(sequence)

  const rulValue = Number(prediction?.RUL) || 0
  const riskPercent = Math.min(Math.max((rulValue / MAX_RUL) * 100, 0), 100)
  const health = prediction?.status ?? 'READY'

  async function runPrediction(nextProfile = profile) {
    const nextSequence = buildTelemetry(nextProfile)
    setSequence(nextSequence)
    setLoading(true)
    setError('')

    try {
      const result = await requestPrediction({
        wear: nextProfile.wearLevel,
        severity: nextProfile.missionSeverity,
        thermal: nextProfile.thermalStress,
        cycle: nextProfile.cycleBias,
        volatility: nextProfile.volatility,
        domain: domain
      })
      setPrediction(result)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  function updateProfile(name, value) {
    setProfile((current) => ({ ...current, [name]: value }))
  }

  function applyPreset(preset) {
    setProfile(preset)
    void runPrediction(preset)
  }

  return (
    <section className="page-stack">
      <section className="panel predict-hero">
        <div>
          <span className="eyebrow">Predict Lab</span>
          <h1>Drive the model with a synthetic telemetry profile.</h1>
          <p className="body-copy">
            Tune the mission stressors, push a 30-step sequence into the backend, and watch the RUL estimate update.
          </p>
        </div>

        <div className={`status-chip ${getHealthClass(health)}`}>
          <span>Health</span>
          <strong>{health}</strong>
        </div>
      </section>

      <section className="grid-two">
        <article className="panel control-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Control surface</span>
              <h2>Mission presets and sliders</h2>
            </div>

            <div className="preset-row">
              {CONTROL_PRESETS.map((preset) => (
                <button key={preset.name} type="button" className="ghost-button" onClick={() => applyPreset(preset)}>
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="domain-select-wrapper">
            <span className="eyebrow">Domain Adaptation</span>
            <select 
              className="domain-select" 
              value={domain} 
              onChange={(e) => setDomain(e.target.value)}
            >
              {DOMAINS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div className="slider-list">
            <SliderField label="Wear level" value={profile.wearLevel} onChange={(value) => updateProfile('wearLevel', value)} helper="How much degradation the engine is carrying" />
            <SliderField label="Mission severity" value={profile.missionSeverity} onChange={(value) => updateProfile('missionSeverity', value)} helper="Operational intensity of the profile" />
            <SliderField label="Thermal stress" value={profile.thermalStress} onChange={(value) => updateProfile('thermalStress', value)} helper="Heat load and thermal drift" />
            <SliderField label="Cycle bias" value={profile.cycleBias} onChange={(value) => updateProfile('cycleBias', value)} helper="Long-term wear accumulation" />
            <SliderField label="Volatility" value={profile.volatility} onChange={(value) => updateProfile('volatility', value)} helper="Oscillation and instability factor" />
          </div>

          <div className="control-actions">
            <button type="button" className="primary-button" onClick={() => void runPrediction(profile)}>
              Run prediction
            </button>
            <button type="button" className="secondary-button" onClick={() => void runPrediction(INITIAL_PROFILE)}>
              Reset baseline
            </button>
          </div>

          {error ? <div className="error-banner">{error}</div> : null}
        </article>

        <article className="panel result-panel">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Output</span>
              <h2>Remaining useful life</h2>
            </div>
          </div>

          <div className="gauge-grid">
            <div className="gauge-shell">
              <div className="gauge">
                <div className="gauge-inner">
                  <span>RUL</span>
                  <strong>{loading ? '...' : Math.round(rulValue)}</strong>
                  <em>cycles left</em>
                  {!loading && prediction?.uncertainty && (
                    <div className="uncertainty-badge">
                      ± {prediction.uncertainty.toFixed(1)} SD
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="metric-stack">
              <GaugeCard title="Risk score" value={`${Math.round(100 - riskPercent)}%`} subtitle="Higher means closer to retirement" tone="danger" />
              <div className="panel sub-panel">
                <span className="eyebrow">Confidence Profile</span>
                <ProbabilityChart mean={rulValue} sd={prediction?.uncertainty || 5} />
              </div>
            </div>
          </div>

          <div className="micro-grid">
            <div className="micro-card">
              <span>Latest primary sensor</span>
              <strong>{row[4]?.toFixed(3) ?? '0.000'}</strong>
            </div>
            <div className="micro-card">
              <span>Thermal channel</span>
              <strong>{row[10]?.toFixed(3) ?? '0.000'}</strong>
            </div>
            <div className="micro-card">
              <span>Vibration channel</span>
              <strong>{row[15]?.toFixed(3) ?? '0.000'}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="grid-two bottom-grid">
        <article className="panel chart-panel">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Signal drift</span>
              <h2>Telemetry trend lines</h2>
              <p className="body-copy">
                Visualizing <strong>Degradation Pattern Learning</strong>. These non-linear gradients (EGT, Pressure, Fan Speed) 
                allow the model to detect the precise "elbow" of engine wear before failure.
              </p>
            </div>
          </div>
          <TelemetryChart primary={primarySeries} thermal={thermalSeries} vibration={vibrationSeries} />
        </article>

        <article className="panel sensor-panel">
          <div className="section-heading compact">
            <div>
              <span className="eyebrow">Snapshot</span>
              <h2>Latest timestep fingerprint</h2>
              <p className="body-copy">
                The <strong>Fingerprint</strong> is the high-dimensional feature vector (108 parameters) 
                representing the engine's current state. It is the raw input the LSTM uses to identify 
                specific wear signatures across 21 sensors.
              </p>
            </div>
          </div>
          <TelemetryList row={row} />
        </article>
      </section>

      {prediction && (
        <section className="report-section-container">
          <AdvisoryReport 
            rul={prediction.RUL} 
            uncertainty={prediction.uncertainty} 
            status={prediction.status} 
          />
        </section>
      )}

      <button type="button" className="floating-action" onClick={() => void runPrediction(profile)}>
        {loading ? 'Predicting...' : `Update result — RUL: ${Math.round(rulValue)} cycles`}
      </button>
    </section>
  )
}

export default PredictPage
