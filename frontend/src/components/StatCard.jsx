function StatCard({ label, value, caption }) {
  return (
    <div className="hero-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      {caption ? <p>{caption}</p> : null}
    </div>
  )
}

export default StatCard
