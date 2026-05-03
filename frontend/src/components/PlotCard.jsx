function PlotCard({ title, subtitle, imageUrl, description }) {
  return (
    <article className="panel plot-card">
      <div className="plot-header">
        <div className="plot-title-group">
          <span className="eyebrow-accent">Fleet Analysis</span>
          <h3>{title}</h3>
        </div>
        <div className="plot-status-dot"></div>
      </div>
      
      <div className="plot-container">
        <img src={imageUrl} alt={title} className="plot-image" />
      </div>

      <div className="plot-footer-expanded">
        <h4 className="plot-subtitle">{subtitle}</h4>
        <p className="plot-description">{description}</p>
      </div>
    </article>
  )
}

export default PlotCard
