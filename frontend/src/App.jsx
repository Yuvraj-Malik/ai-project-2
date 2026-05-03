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
  const [isAuth, setIsAuth] = useState(false)

  if (!isAuth) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LandingPage onLogin={() => setIsAuth(true)} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <Shell onLogout={() => setIsAuth(false)}>
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
