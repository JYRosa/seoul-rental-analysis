function MetricCard({ label, value, unit, note }) {
  return (
    <div className="metric">
      <p className="metric__label">{label}</p>
      <p className="metric__value">
        {value}
        {unit && <span className="metric__unit">{unit}</span>}
      </p>
      {note && <p className="metric__note">{note}</p>}
    </div>
  )
}

export default MetricCard
