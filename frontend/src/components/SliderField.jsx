function SliderField({ label, value, onChange, helper }) {
  return (
    <label className="slider-card">
      <div className="slider-labels">
        <span>{label}</span>
        <strong>{value.toFixed(2)}</strong>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {helper ? <small>{helper}</small> : null}
    </label>
  )
}

export default SliderField
