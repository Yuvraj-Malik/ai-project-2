function GaugeCard({ title, value, subtitle, tone = 'neutral' }) {
  return (
    <div className={`gauge-card ${tone}`}>
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{subtitle}</p>
    </div>
  )
}

export default GaugeCard
