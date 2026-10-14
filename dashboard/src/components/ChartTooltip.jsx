/**
 * Recharts 공통 Tooltip 본문.
 * getRows(datum) 는 [{ label, value }] 배열을 반환한다.
 */
function ChartTooltip({ active, payload, title, getRows }) {
  if (!active || !payload || payload.length === 0) return null
  const datum = payload[0].payload

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__title">{title(datum)}</p>
      <dl>
        {getRows(datum).map((row) => (
          <div className="chart-tooltip__row" key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default ChartTooltip
