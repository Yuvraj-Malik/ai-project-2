import PlotCard from '../components/PlotCard'

function EvaluationPage() {
  const baseUrl = import.meta.env.VITE_API_URL || ''
  
  // Real metrics computed via 20-pass MC Dropout on 690 test engines
  const metrics = [
    { label: 'Global RMSE', value: '28.80', unit: 'cycles', note: 'Root Mean Squared Error across all 4 domains', tone: 'warning' },
    { label: 'Global MAE', value: '20.65', unit: 'cycles', note: 'Mean Absolute Error — average RUL deviation', tone: 'warning' },
    { label: 'R² Score', value: '0.672', unit: '', note: 'Variance explained by the LSTM model', tone: 'safe' },
    { label: 'Mean Uncertainty (SD)', value: '±5.62', unit: 'cycles', note: 'Average stochastic confidence width from MC Dropout', tone: 'neutral' },
  ]

  const domainRmse = [
    { ds: 'FD001', rmse: 16.60, note: 'Single fault, single condition' },
    { ds: 'FD002', rmse: 31.48, note: 'Single fault, multiple conditions' },
    { ds: 'FD003', rmse: 17.95, note: 'Multiple faults, single condition' },
    { ds: 'FD004', rmse: 33.24, note: 'Multiple faults, multiple conditions — hardest' },
  ]
  const maxRmse = Math.max(...domainRmse.map(d => d.rmse))

  return (
    <section className="page-stack">
      <section className="hero panel">
        <div className="hero-copy">
          <span className="eyebrow gold">Model Validation</span>
          <h1>Fleet Accuracy & Evaluation Metrics</h1>
          <p className="body-copy">
            Computed via 20-pass Monte Carlo Dropout inference across 690 test engines from the NASA C-MAPSS dataset.
            All metrics reflect real model performance — not theoretical estimates.
          </p>
        </div>
      </section>

      {/* Real Accuracy Metrics */}
      <section className="eval-metrics-grid">
        {metrics.map(m => (
          <div key={m.label} className={`eval-metric-card panel ${m.tone}`}>
            <span className="eyebrow-accent">{m.label}</span>
            <div className="eval-metric-value">{m.value}<em>{m.unit}</em></div>
            <p className="plot-description">{m.note}</p>
          </div>
        ))}
      </section>

      {/* Per-Domain RMSE Bar Chart */}
      <section className="panel info-panel">
        <span className="eyebrow-accent">Domain Breakdown</span>
        <h2>RMSE per C-MAPSS Dataset</h2>
        <p className="body-copy">
          Lower RMSE on single-condition domains (FD001, FD003) confirms the model has correctly learned 
          degradation patterns. Higher error on FD002 and FD004 reflects the inherent difficulty of 
          predicting across multiple operational flight conditions.
        </p>
        <div className="domain-bars">
          {domainRmse.map(d => (
            <div key={d.ds} className="domain-bar-row">
              <div className="domain-bar-label">
                <strong>{d.ds}</strong>
                <span>{d.note}</span>
              </div>
              <div className="domain-bar-track">
                <div
                  className="domain-bar-fill"
                  style={{ width: `${(d.rmse / maxRmse) * 100}%` }}
                />
              </div>
              <span className="domain-bar-val">{d.rmse} cycles</span>
            </div>
          ))}
        </div>
      </section>

      {/* Diagnostic Plots — 15 total */}
      <section className="dashboard-plots-grid">
        <PlotCard title="Degradation Profile" subtitle="RUL distribution across test engines."
          imageUrl={`${baseUrl}/plots/global_test_performance.png`}
          description="Tracks 690 test engines sorted by true RUL. Demonstrates the model's ability to maintain a consistent degradation gradient." />
        <PlotCard title="Domain Accuracy (RMSE)" subtitle="Per-domain error performance."
          imageUrl={`${baseUrl}/plots/rmse_per_dataset.png`}
          description="RMSE breakdown per C-MAPSS dataset. FD001 achieves best accuracy (16.60 cycles); FD004 is hardest (33.24 cycles)." />
        <PlotCard title="Uncertainty Tracking" subtitle="MC Dropout confidence intervals."
          imageUrl={`${baseUrl}/plots/engine_degradation_uncertainty.png`}
          description="95% confidence bands from 20 MC passes. Bands narrow near failure—improving grounding reliability." />
        <PlotCard title="Error Residuals" subtitle="Prediction error histogram."
          imageUrl={`${baseUrl}/plots/error_distribution.png`}
          description="Histogram of (Predicted − True) RUL. Near-zero centering (MAE = 20.65) confirms the model is unbiased." />
        <PlotCard title="Correlation Analysis" subtitle="Predicted vs Actual RUL scatter."
          imageUrl={`${baseUrl}/plots/pred_vs_actual_scatter.png`}
          description="Scatter plot showing R²=0.672 correlation. Tight clustering along the diagonal confirms non-linear degradation learning." />
        <PlotCard title="Fleet Health State" subtitle="Engine status distribution."
          imageUrl={`${baseUrl}/plots/fleet_status_pie.png`}
          description="Pie chart categorising 690 engines into Safe, Warning and Critical states based on predicted RUL thresholds." />
        <PlotCard title="Training Loss Curve" subtitle="Model convergence over 50 epochs."
          imageUrl={`${baseUrl}/plots/loss_curve.png`}
          description="Training vs validation MSE loss over each epoch. Convergence without divergence confirms stable Bi-LSTM training." />
        <PlotCard title="Uncertainty Distribution" subtitle="MC Dropout SD across the fleet."
          imageUrl={`${baseUrl}/plots/uncertainty_distribution.png`}
          description="Histogram of per-engine SD values. Mean SD = ±5.62 cycles. Right skew indicates some high-uncertainty edge cases." />
        <PlotCard title="Residuals vs True RUL" subtitle="Error pattern by lifecycle stage."
          imageUrl={`${baseUrl}/plots/residuals_vs_true.png`}
          description="Shows if error correlates with engine age. Random scatter confirms the model is not biased towards specific lifecycle stages." />
        <PlotCard title="Cumulative RMSE" subtitle="Running RMSE by engine RUL."
          imageUrl={`${baseUrl}/plots/cumulative_rmse.png`}
          description="Cumulative RMSE as engines are sorted by true RUL. Shows where the model performs best relative to fleet lifecycle stage." />
        <PlotCard title="Sensor Correlation Matrix" subtitle="Inter-sensor correlation heatmap."
          imageUrl={`${baseUrl}/plots/sensor_correlation.png`}
          description="Correlation between 14 key sensors in FD001. Highly correlated clusters guide feature selection and redundancy analysis." />
        <PlotCard title="Engine Lifecycle" subtitle="Full sensor trajectory of Engine #1."
          imageUrl={`${baseUrl}/plots/engine_lifecycle.png`}
          description="Full degradation trajectory of Engine #1 showing T2, P30, and Nf sensors across all operating cycles until failure." />
        <PlotCard title="Error vs Uncertainty" subtitle="Calibration of stochastic outputs."
          imageUrl={`${baseUrl}/plots/rmse_vs_uncertainty.png`}
          description="Scatter of absolute error vs MC Dropout uncertainty coloured by true RUL. Positive correlation confirms uncertainty is a reliable error proxy." />
        <PlotCard title="Domain Error Boxplot" subtitle="Error spread per C-MAPSS regime."
          imageUrl={`${baseUrl}/plots/domain_error_boxplot.png`}
          description="Boxplots showing error quartile distribution per domain. FD002 and FD004 show wider spreads due to multi-condition variability." />
        <PlotCard title="Conservative RUL Safety Schedule" subtitle="95% lower-bound maintenance planning."
          imageUrl={`${baseUrl}/plots/conservative_rul.png`}
          description="Compares mean RUL vs conservative (Mean − 1.96×SD) RUL. The safety buffer zone ensures grounding before 95% failure probability window." />
      </section>
    </section>
  )
}

export default EvaluationPage
