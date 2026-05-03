import { useEffect } from 'react'

function MethodologyPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <section className="page-stack">
      <section className="hero panel">
        <div className="hero-copy">
          <span className="eyebrow">Technical Architecture</span>
          <h1>System Methodology & DL Framework</h1>
          <p className="body-copy">
            A deep dive into the Bidirectional LSTM architecture, domain-aware preprocessing, 
            and stochastic uncertainty estimation used to predict turbofan RUL.
          </p>
        </div>
        <div className="methodology-summary-card">
          <div className="status-chip safe">
            <span>Framework</span>
            <strong>TensorFlow 2.x + Keras</strong>
          </div>
          <div className="status-chip warning">
            <span>Layers</span>
            <strong>LSTM + Dense + Dropout</strong>
          </div>
        </div>
      </section>

      <div className="grid-two">
        <article className="panel info-panel">
          <span className="eyebrow-accent">Learning Objective</span>
          <h2>Training Convergence</h2>
          <div className="plot-container" style={{ minHeight: '300px' }}>
            <img 
              src="/plots/loss_curve.png" 
              alt="Training Loss Curve" 
              className="plot-image" 
            />
          </div>
          <p className="plot-description" style={{ marginTop: '15px' }}>
            <div className="status-chip safe" style={{ display: 'inline-block', marginBottom: '10px' }}>
              <span>Tools Used</span>
              <strong>Matplotlib, Keras History Callback</strong>
            </div><br/>
            The loss curve shows Mean Squared Error (MSE) over 50 epochs. We use a piecewise RUL target capped at 125 cycles 
            to prevent the model from struggling with high-variance healthy data, focusing instead on the 
            critical degradation phase.
          </p>
        </article>

        <article className="panel info-panel">
          <span className="eyebrow-accent">Mathematical Strategy</span>
          <h2>Degradation Pattern Learning</h2>
          <p className="body-copy">
            A core requirement of the Rolls-Royce objective is <strong>Degradation Pattern Learning</strong>. 
            Turbofan engines do not fail linearly; they exhibit a "stable" phase followed by an exponential degradation curve.
          </p>
          <div className="status-chip warning" style={{ display: 'inline-block', marginBottom: '10px' }}>
            <span>Tools Used</span>
            <strong>Pandas (Rolling Windows), Scikit-Learn</strong>
          </div>
          <ul className="method-list">
            <li><strong>Piece-wise RUL Capping (125 Cycles):</strong> We cap the target RUL at 125 cycles during training. This forces the model to ignore noise in early "healthy" cycles and focus exclusively on learning the <strong>degradation elbow</strong> where sensors begin to drift.</li>
            <li><strong>Temporal Feature Fingerprinting:</strong> Beyond raw sensor values, we compute rolling mean and standard deviation over 5-cycle and 10-cycle windows. This allows the model to see <strong>velocity</strong> (rate of change) and <strong>volatility</strong> (increased vibration/noise) which are the physical signatures of engine wear.</li>
            <li><strong>Non-Linear Regression:</strong> The Bi-LSTM layers perform a non-linear mapping of these 108 features into a single RUL estimate, capturing the complex thermo-mechanical interactions of the engine core.</li>
          </ul>
        </article>

        <article className="panel info-panel">
          <span className="eyebrow-accent">Deep Learning Architecture</span>
          <h2>Sequence Modeling (Bi-LSTM)</h2>
          <p className="body-copy">
            Standard RNNs suffer from vanishing gradients. Our <strong>Bidirectional LSTM</strong> solution processes sequences in both forward and backward temporal directions, ensuring that the current health state is contextualized by the full history of the engine's mission profile.
          </p>
          <div className="status-chip safe" style={{ display: 'inline-block', marginBottom: '15px' }}>
            <span>Tools Used</span>
            <strong>TensorFlow 2.x, Keras (Bidirectional, LSTM, Dropout)</strong>
          </div>
          <div className="methodology-spec-grid">
            <div className="spec-item"><span>Sequence Depth</span><strong>30 Cycles</strong></div>
            <div className="spec-item"><span>Feature Count</span><strong>108 Params</strong></div>
            <div className="spec-item"><span>Optimizer</span><strong>Adam (LR: 0.001)</strong></div>
            <div className="spec-item"><span>Hidden Activation</span><strong>tanh & sigmoid (LSTM)</strong></div>
            <div className="spec-item"><span>Output Activation</span><strong>Linear (Regression)</strong></div>
            <div className="spec-item"><span>Loss Function</span><strong>MSE</strong></div>
          </div>
        </article>
      </div>

      <section className="panel info-panel">
        <span className="eyebrow-accent">Data Pipeline</span>
        <h2>Processing Flow & Feature Engineering</h2>
        <p className="body-copy">
          Before telemetry reaches the deep learning model, it passes through a rigorous preprocessing pipeline to synthesize and normalize the data across different flight regimes.
        </p>

        <div className="flowchart-container">
          <div className="flow-step">
            <span className="flow-icon">📄</span>
            <h4>Raw C-MAPSS</h4>
            <small>Txt ingestion</small>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <span className="flow-icon">⚙️</span>
            <h4>Feature Eng.</h4>
            <small>Rolling stats</small>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <span className="flow-icon">⚖️</span>
            <h4>Domain Scaling</h4>
            <small>StandardScaler</small>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <span className="flow-icon">🧩</span>
            <h4>Sequencing</h4>
            <small>30-step tensors</small>
          </div>
          <div className="flow-arrow">→</div>
          <div className="flow-step">
            <span className="flow-icon">🧠</span>
            <h4>Bi-LSTM</h4>
            <small>Prediction</small>
          </div>
        </div>

        <div className="status-chip warning" style={{ display: 'inline-block', marginBottom: '10px', marginTop: '15px' }}>
          <span>Tools Used</span>
          <strong>Pandas, NumPy, Scikit-Learn (StandardScaler)</strong>
        </div>
        <ul className="method-list">
          <li><strong>Data Ingestion (Pandas):</strong> We ingest raw text files containing massive C-MAPSS telemetry matrices. Pandas is utilized for its high-speed grouping operations to identify individual engine trajectories.</li>
          <li><strong>Feature Engineering (Pandas/NumPy):</strong> We compute rolling statistical features. Specifically, a 5-cycle and 10-cycle rolling average and standard deviation are calculated for all 21 sensors to capture drift velocity and vibration.</li>
          <li><strong>Domain Adaptation (Scikit-Learn):</strong> Each engine domain (FD001-FD004) is fitted with its own independent <code>StandardScaler</code>. This prevents the variance of FD002 (High Altitude) from squashing the signal of FD001.</li>
          <li><strong>Sequence Generation (NumPy):</strong> The normalized rows are chunked into 3D tensors of shape <code>(batch_size, 30, 108)</code> using optimized NumPy array slicing, formatting it exactly for the LSTM input layer.</li>
        </ul>
      </section>

      <section className="panel info-panel">
        <span className="eyebrow-accent">System Infrastructure</span>
        <h2>Technology Stack & Integration</h2>
        <div className="tech-stack-grid">
          <div className="tech-card">
            <div className="tech-icon">⚛️</div>
            <h3>Frontend (UI/UX)</h3>
            <p>Built with <strong>React 18</strong> and <strong>Vite</strong> for high-performance HMR. Styling utilizes vanilla CSS with CSS Variables for the Rolls-Royce "Gold & Onyx" design system.</p>
          </div>
          <div className="tech-card">
            <div className="tech-icon">🐍</div>
            <h3>Backend (API)</h3>
            <p><strong>Python Flask</strong> handles the orchestration. It serves as the bridge between the React frontend and the TensorFlow model, managing telemetry synthesis and domain scaling.</p>
          </div>
          <div className="tech-card">
            <div className="tech-icon">🧠</div>
            <h3>Deep Learning</h3>
            <p><strong>TensorFlow & Keras</strong> powers the LSTM model. Data manipulation is handled via <strong>NumPy</strong> and <strong>Pandas</strong>, with <strong>Scikit-Learn</strong> for multi-domain preprocessing.</p>
          </div>
          <div className="tech-card">
            <div className="tech-icon">📊</div>
            <h3>Analytics</h3>
            <p>Visual diagnostics are generated using <strong>Matplotlib</strong> and <strong>Seaborn</strong> on the backend, while live trendlines use <strong>SVG Vectors</strong> for smooth UI transitions.</p>
          </div>
        </div>
      </section>

      <section className="panel info-panel">
        <span className="eyebrow-accent">Performance Metrics</span>
        <h2>Model Evaluation & Validation</h2>
        <p className="body-copy">
          The model was evaluated against the unseen Test datasets for all four domains (FD001-FD004). We utilized the <strong>Root Mean Squared Error (RMSE)</strong> metric to quantify the difference between the predicted RUL and the actual RUL ground truth provided by NASA C-MAPSS.
        </p>
        
        <div className="status-chip safe" style={{ display: 'inline-block', marginBottom: '10px', marginTop: '5px' }}>
          <span>Tools Used</span>
          <strong>Seaborn, Matplotlib, Scikit-Learn (Metrics)</strong>
        </div>

        <div className="grid-two" style={{ marginTop: '24px' }}>
          <div className="plot-container" style={{ minHeight: '300px' }}>
            <img 
              src="/plots/rmse_per_dataset.png" 
              alt="RMSE per Dataset" 
              className="plot-image" 
            />
          </div>
          <div className="plot-container" style={{ minHeight: '300px' }}>
            <img 
              src="/plots/engine_degradation_uncertainty.png" 
              alt="Engine Degradation tracking" 
              className="plot-image" 
            />
          </div>
        </div>

        <div className="method-grid-three" style={{ marginTop: '24px' }}>
          <div className="method-card">
            <h3>Global RMSE Metric</h3>
            <p>Our Bi-LSTM model achieves a competitive RMSE across the multi-domain test set. By implementing domain-specific standard scaling, the model successfully avoids the "mean regression trap" and actively tracks true engine degradation trajectories.</p>
          </div>
          <div className="method-card">
            <h3>Domain Adaptation Success</h3>
            <p>The <em>RMSE per Dataset</em> evaluation (left graph) proves that the model maintains its predictive accuracy even when tested on FD002 and FD004 (which feature 6 varying operational conditions), validating the robustness of our normalization pipeline.</p>
          </div>
          <div className="method-card">
            <h3>Uncertainty Validation</h3>
            <p>During evaluation, we tested the <strong>Monte Carlo Dropout</strong> estimation (right graph). As engines approach failure (RUL nears 0), the model's confidence interval naturally tightens, proving it has learned the definitive physical signatures of critical wear.</p>
          </div>
        </div>
      </section>

      <section className="panel info-panel">
        <span className="eyebrow-accent">Aerospace Solutions</span>
        <h2>Maintenance Scheduling & Reliable Parameters</h2>
        <div className="method-grid-three">
          <div className="method-card">
            <h3>The "Cycle" Solution</h3>
            <p>The Operating Cycle is the primary clock. However, a "Cycle" on FD002 (High Alt) is harsher than FD001. Our solution uses <strong>Domain Adaptation</strong> to normalize these cycles so a "Warning" state is consistent across the entire global fleet regardless of mission severity.</p>
          </div>
          <div className="method-card">
            <h3>Multi-Sensor Fusion</h3>
            <p>Instead of relying on a single temperature sensor, we fuse 21 sensor parameters. This redundancy ensures that even if one sensor fails, the overall RUL prediction remains accurate by observing correlations in other pressure and fan speed parameters.</p>
          </div>
          <div className="method-card">
            <h3>Reliability Thresholds</h3>
            <p>Maintenance is scheduled using a <strong>Conservative RUL (RUL - 1.96*SD)</strong>. By subtracting the uncertainty (SD) from the mean, we ensure that grounding occurs before the 95% probability window of failure, meeting aerospace safety standards.</p>
          </div>
        </div>
      </section>
    </section>
  )
}

export default MethodologyPage

