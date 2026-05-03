import { Link } from 'react-router-dom'
import EngineScene from '../components/EngineScene'
import MetricCard from '../components/MetricCard'
import PlotCard from '../components/PlotCard'
import StatCard from '../components/StatCard'
import { INITIAL_PROFILE, SEQUENCE_LENGTH } from '../data/presets'

function DashboardPage() {
  return (
    <section className="page-stack">
      <section className="hero panel">
        <div className="hero-copy">
          <span className="eyebrow">Rolls Royce • Fleet Intelligence</span>
          <h1>Aero-Engine Maintenance Command Center</h1>
          <p>
            Real-time RUL prediction, uncertainty estimation, and domain-adapted degradation tracking 
            for the global turbofan fleet.
          </p>

          <div className="hero-stats">
            <StatCard label="Sequence" value={`${SEQUENCE_LENGTH} x 17`} caption="Model input window" />
            <StatCard label="Profile" value={INITIAL_PROFILE.name} caption="Default mission preset" />
            <StatCard label="Mode" value="Reactive" caption="Backend linked via /predict" />
          </div>

          <div className="cta-row">
            <Link className="primary-button" to="/predict">
              Open predict lab
            </Link>
            <Link className="secondary-button" to="/insights">
              View engine insights
            </Link>
          </div>
        </div>

        <EngineScene />
      </section>

      <section className="grid-two">
        <article className="panel info-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow gold">Mission Insights</span>
              <h2>Operational Intelligence</h2>
            </div>
          </div>
          <p className="body-copy">
            The Rolls-Royce AI command center integrates 21 multi-sensor parameters with a Bidirectional LSTM 
            to identify engine wear signatures. By using domain adaptation across FD001-FD004 datasets, 
            we maintain high precision across varying mission profiles.
          </p>
          <div className="metric-grid">
            <MetricCard label="Global Fleet" value="690 Units" tone="safe" />
            <MetricCard label="Mean RUL" value="82 Cycles" tone="warning" />
          </div>
        </article>

        <article className="panel info-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow gold">Direct Access</span>
              <h2>Maintenance Channels</h2>
            </div>
          </div>
          <div className="button-stack">
            <Link to="/predict" className="primary-button">Open Prediction Lab</Link>
            <Link to="/evaluation" className="secondary-button">View Accuracy Metrics</Link>
          </div>
        </article>
      </section>
    </section>
  )
}

export default DashboardPage
