import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartTooltip from '../components/ChartTooltip'
import { formatCount, formatNumber, formatPerM2 } from '../utils/formatters'
import { AXIS_TICK, CHART_COLORS } from './chartTheme'

const ROW_HEIGHT = 26

/**
 * 2025년 자치구별 단위면적당 전세보증금 중앙값.
 * seoulMedian(서울 전체 2025 중앙값) 이상인 자치구만 강조 색으로 표시한다.
 */
function DistrictPriceChart({ data, seoulMedian }) {
  const rows = [...data]
    .sort((a, b) => b.median_deposit_per_m2 - a.median_deposit_per_m2)
    .map((row, index) => ({ ...row, rank: index + 1 }))

  const tooltipRows = (d) => [
    { label: '㎡당 전세가격 중앙값', value: formatPerM2(d.median_deposit_per_m2) },
    { label: '전세 거래 건수', value: formatCount(d.contract_count) },
    { label: '순위', value: `${d.rank} / ${rows.length}` },
  ]

  return (
    <div className="chart-box" style={{ height: rows.length * ROW_HEIGHT + 48 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 20, right: 24, bottom: 4, left: 0 }}
          barCategoryGap={4}
        >
          <CartesianGrid stroke={CHART_COLORS.grid} horizontal={false} />
          <XAxis
            type="number"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatNumber(value)}
            orientation="top"
          />
          <YAxis
            type="category"
            dataKey="district"
            tick={{ ...AXIS_TICK, fill: CHART_COLORS.text }}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.neutralDark }}
            width={64}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: 'rgba(28, 28, 26, 0.05)' }}
            content={<ChartTooltip title={(d) => d.district} getRows={tooltipRows} />}
          />
          {Number.isFinite(seoulMedian) && (
            <ReferenceLine
              x={seoulMedian}
              stroke={CHART_COLORS.text}
              strokeDasharray="4 3"
              label={{
                value: `서울 전체 ${formatNumber(seoulMedian, 1)}`,
                position: 'insideBottomRight',
                fill: CHART_COLORS.text,
                fontSize: 12,
              }}
            />
          )}
          <Bar dataKey="median_deposit_per_m2" radius={[0, 2, 2, 0]} isAnimationActive={false}>
            {rows.map((row) => (
              <Cell
                key={row.district}
                fill={
                  row.median_deposit_per_m2 >= seoulMedian
                    ? CHART_COLORS.accent
                    : CHART_COLORS.neutral
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DistrictPriceChart
