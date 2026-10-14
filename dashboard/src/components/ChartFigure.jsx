/** 차트 제목 · 단위 · 출처를 일관되게 감싸는 figure 래퍼 */
function ChartFigure({ title, unit, source, children, className = '' }) {
  return (
    <figure className={`chart-figure ${className}`}>
      <figcaption className="chart-figure__head">
        <span className="chart-figure__title">{title}</span>
        {unit && <span className="chart-figure__unit">{unit}</span>}
      </figcaption>
      {children}
      {source && <p className="chart-figure__source">{source}</p>}
    </figure>
  )
}

export default ChartFigure
