import { CHART_COLORS } from './chartTheme'

/**
 * 가로 막대 끝에 값을 표시하는 LabelList content.
 * 양수 막대는 오른쪽 끝에 라벨을 둔다.
 * 음수 막대는 negativePlacement 에 따라 막대 왼쪽 끝('outside') 또는 0 기준선 오른쪽('baseline')에 둔다.
 */
function BarValueLabel({ x, y, width, height, value, format, emphasize, negativePlacement = 'outside' }) {
  if (typeof value !== 'number') return null
  const left = Math.min(x, x + width)
  const right = Math.max(x, x + width)
  const isNegative = value < 0 && negativePlacement === 'outside'

  return (
    <text
      x={isNegative ? left - 6 : right + 6}
      y={y + height / 2}
      dy="0.35em"
      textAnchor={isNegative ? 'end' : 'start'}
      fill={CHART_COLORS.text}
      fontSize={12}
      fontWeight={emphasize ? 700 : 500}
    >
      {format(value)}
    </text>
  )
}

export default BarValueLabel
