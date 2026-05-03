import { useEffect } from 'react'

function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const contributors = [
    { name: 'Abhinav Gupta', roll: '1024030639', group: '2C45', role: 'Project Lead' },
    { name: 'Ishita', roll: '1024030567', group: '2C43', role: 'Data Engineer' },
    { name: 'Pallvi', roll: '1024030578', group: '2C43', role: 'ML Researcher' },
    { name: 'Seerat', roll: '1024030361', group: '2C41', role: 'UI/UX Designer' },
    { name: 'Yuvraj Malik', roll: '1024030353', group: '2C41', role: 'Backend Developer' }
  ]

  return (
    <section className="page-stack" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseGlow { 0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(212, 175, 55, 0); } 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); } }
        @keyframes floatImage { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
        
        .interactive-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
        }
        .interactive-card:hover {
          transform: scale(1.03);
          box-shadow: 0 0 30px rgba(121, 215, 255, 0.25);
          border-color: rgba(121, 215, 255, 0.6);
        }
        
        .github-box {
          background: linear-gradient(135deg, rgba(23, 28, 36, 0.9), rgba(11, 16, 26, 0.9));
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 30px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .github-box::before {
          content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%;
          background: #d4af37;
          transition: height 0.3s ease;
        }
        .github-box:hover {
          transform: translateX(5px);
          border-color: rgba(212, 175, 55, 0.4);
          background: linear-gradient(135deg, rgba(28, 34, 43, 0.9), rgba(11, 16, 26, 0.9));
        }
        .github-box:hover .gh-btn {
          animation: pulseGlow 1.5s infinite;
        }
        
        .aviation-box {
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }
        .aviation-box:hover {
          transform: translateX(-5px);
          border-color: rgba(121, 215, 255, 0.5);
          box-shadow: -5px 15px 35px rgba(0, 0, 0, 0.3), -5px 0 20px rgba(121, 215, 255, 0.1);
        }
      `}} />

      {/* Problem Statement Hero with Image */}
      <section className="hero panel" style={{ gridTemplateColumns: '1.2fr 0.8fr', gap: '40px', alignItems: 'center' }}>
        <div className="hero-copy">
          <span className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d4af37', boxShadow: '0 0 10px #d4af37' }}></div>
            Project Objective
          </span>
          <h1 style={{ fontSize: '3.2rem', marginBottom: '20px' }}>Predictive Maintenance for Aerospace</h1>
          <p className="body-copy" style={{ fontSize: '1.15rem', lineHeight: '1.8' }}>
            <strong>Rolls-Royce Aerospace</strong> is focused on predictive maintenance of aircraft engines. 
            The objective is to develop a deep learning model (RNN/LSTM) to predict the Remaining Useful Life 
            (RUL) of turbofan engines using multi-sensor time-series data. 
          </p>
          <p className="body-copy" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
            This system incorporates sequence modeling, degradation pattern learning, uncertainty estimation, 
            and domain adaptation to ensure accurate and reliable maintenance scheduling.
          </p>
          
          <div className="cta-row" style={{ marginTop: '35px' }}>
            <div className="interactive-card status-chip safe" style={{ padding: '12px 20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.1em' }}>Core Technology</span>
              <strong style={{ color: '#10b981', fontSize: '1.2rem' }}>Bi-Directional LSTM</strong>
            </div>
            <div className="interactive-card status-chip warning" style={{ padding: '12px 20px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.1em' }}>Target Domain</span>
              <strong style={{ color: '#f59e0b', fontSize: '1.2rem' }}>Turbofan RUL Estimation</strong>
            </div>
          </div>
        </div>
        
        {/* Decorative Engine Image / Visualization */}
        <div style={{ position: 'relative', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{
            position: 'absolute',
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(121, 215, 255, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(20px)',
            zIndex: 0
          }}></div>
          <img 
            src="https://images.unsplash.com/photo-1544256718-3bcf237f3974?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Aircraft Engine Turbofan" 
            style={{
              width: '100%',
              maxWidth: '450px',
              height: 'auto',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
              zIndex: 1,
              animation: 'floatImage 6s ease-in-out infinite'
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '-10px',
            background: 'rgba(3, 8, 18, 0.8)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            padding: '12px 20px',
            borderRadius: '16px',
            zIndex: 2,
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>System Status</div>
              <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 'bold' }}>Model Online</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid-two">
        {/* Elaborated Details */}
        <article className="panel info-panel aviation-box">
          <span className="eyebrow-accent">The Challenge</span>
          <h2>Aviation Reliability</h2>
          <p className="body-copy">
            Aircraft engine failures are catastrophic and unscheduled maintenance is extremely costly. 
            Traditional threshold-based alerts are inadequate because engine wear accelerates non-linearly 
            and depends heavily on the operational environment.
          </p>
          <p className="body-copy">
            By analyzing high-frequency multi-sensor telemetry, we can detect the subtle "fingerprints" 
            of degradation long before physical symptoms appear.
          </p>
        </article>

        {/* GitHub Repo Box */}
        <a href="https://github.com/Yuvraj-Malik/ai-project-2" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <article className="github-box" style={{ height: '100%' }}>
            <div style={{ 
              width: '60px', height: '60px', borderRadius: '50%', 
              background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ color: '#d4af37', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}>Source Code</span>
              <h3 style={{ margin: '4px 0 8px 0', color: '#fff', fontSize: '1.4rem' }}>GitHub Repository</h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>Explore the complete Bidirectional LSTM implementation, preprocessing pipeline, and full React frontend codebase.</p>
            </div>
            <div className="gh-btn" style={{ 
              background: '#fff', color: '#000', padding: '10px 20px', borderRadius: '12px', 
              fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              View Repo
              <span style={{ fontSize: '1.2rem' }}>→</span>
            </div>
          </article>
        </a>
      </div>

      {/* Contributors Section */}
      <section className="panel info-panel" style={{ marginTop: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#79d7ff', boxShadow: '0 0 10px #79d7ff' }}></div>
            Development Team
          </span>
          <h2 style={{ fontSize: '2.5rem', marginTop: '10px' }}>Project Contributors</h2>
          <p className="body-copy" style={{ margin: '10px auto', maxWidth: '600px' }}>
            The engineers and researchers who developed the predictive maintenance framework.
          </p>
        </div>

        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '24px',
          maxWidth: '1050px',
          margin: '0 auto'
        }}>
          {contributors.map((member, index) => (
            <div key={index} className="interactive-card" style={{
              flex: '0 0 300px',
              background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              padding: '28px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fff', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>{member.name}</h3>
                </div>
                <span style={{ 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#e2e8f0', 
                  padding: '6px 12px', 
                  borderRadius: '12px', 
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap'
                }}>
                  Group {member.group}
                </span>
              </div>
              
              <div style={{ 
                background: 'rgba(0,0,0,0.2)', 
                padding: '12px 16px', 
                borderRadius: '12px',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                border: '1px solid rgba(255,255,255,0.03)'
              }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Roll No
                </span>
                <strong style={{ color: '#fff', fontSize: '1.1rem', letterSpacing: '0.1em', fontFamily: 'monospace' }}>{member.roll}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  )
}

export default AboutPage
