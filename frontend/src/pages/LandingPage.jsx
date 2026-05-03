import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function LandingPage({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [empId, setEmpId] = useState('')
  const [error, setError] = useState('')

  const handleEnter = (e) => {
    e.preventDefault()
    if (email && empId) {
      onLogin()
      navigate('/')
    } else {
      setError('Please enter both credentials.')
    }
  }

  return (
    <div className="landing-root">
      {/* Ambient background layers matching dashboard */}
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <div className="ambient ambient-c" />

      {/* Left Side — Branding */}
      <div className="landing-brand">
        <div className="brand-logo">
          <span className="brand-icon">✈</span>
        </div>
        <span className="eyebrow gold" style={{ letterSpacing: '0.3em' }}>Rolls-Royce Aerospace</span>
        <h1 className="landing-headline">Aero-Engine<br/>Intelligence<br/>Command</h1>
        <p className="landing-desc">
          Predictive maintenance powered by Bidirectional LSTM, MC Dropout uncertainty estimation,
          and domain-aware sensor fusion across four C-MAPSS operational regimes.
        </p>
        <div className="landing-stats">
          <div className="landing-stat">
            <strong>690</strong>
            <span>Engines Monitored</span>
          </div>
          <div className="landing-stat">
            <strong>108</strong>
            <span>Sensor Parameters</span>
          </div>
          <div className="landing-stat">
            <strong>20×</strong>
            <span>MC Dropout Passes</span>
          </div>
        </div>
      </div>

      {/* Right Side — Login Form */}
      <div className="landing-form-side">
        <form className="login-card" onSubmit={handleEnter}>
          <div className="login-card-header">
            <span className="eyebrow gold">Secure Portal</span>
            <h2>Sign in to your account</h2>
            <p>Enter your Rolls-Royce enterprise credentials to access the fleet intelligence system.</p>
          </div>

          <div className="form-group">
            <label>Enterprise Email</label>
            <input
              type="email"
              placeholder="name@rolls-royce.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              required
            />
          </div>

          <div className="form-group">
            <label>Employee Access Code</label>
            <input
              type="password"
              placeholder="RR-XXXX-XXXX"
              value={empId}
              onChange={e => { setEmpId(e.target.value); setError('') }}
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="login-submit-btn">
            Access Command Center
          </button>

          <div className="login-footer-note">
            <span>🔒 256-bit enterprise encryption</span>
            <span>Session: RR-AI-2026</span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LandingPage

