import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import Shell from './components/Shell'
import DashboardPage from './pages/DashboardPage'
import EvaluationPage from './pages/EvaluationPage'
import LandingPage from './pages/LandingPage'
import LiveAnalysisPage from './pages/LiveAnalysisPage'
import MethodologyPage from './pages/MethodologyPage'
import PredictPage from './pages/PredictPage'
import AboutPage from './pages/AboutPage'

function App() {
  const [isAuth, setIsAuth] = useState(() => {
    return localStorage.getItem('lstm_auth') === 'true'
  })

  const handleLogin = () => {
    setIsAuth(true)
    localStorage.setItem('lstm_auth', 'true')
  }

  const handleLogout = () => {
    setIsAuth(false)
    localStorage.removeItem('lstm_auth')
  }

  if (!isAuth) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LandingPage onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <Shell onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/predict" element={<PredictPage />} />
          <Route path="/evaluation" element={<EvaluationPage />} />
          <Route path="/live" element={<LiveAnalysisPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/about" replace />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  )
}

export default App
