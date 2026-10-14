function InsightBox({ label = 'Insight', children, note }) {
  return (
    <aside className="insight">
      <p className="insight__label">{label}</p>
      <p className="insight__text">{children}</p>
      {note && <p className="insight__note">{note}</p>}
    </aside>
  )
}

export default InsightBox
