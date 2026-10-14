import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartTooltip from '../components/ChartTooltip'
import { formatCount, formatManwon, formatNumber, formatPerM2 } from '../utils/formatters'
import { AXIS_TICK, CHART_COLORS } from './chartTheme'

const tooltipRows = (d) => [
  { label: '㎡당 전세가격 중앙값', value: formatPerM2(d.median_deposit_per_m2) },
  { label: '전세보증금 중앙값', value: formatManwon(d.median_deposit) },
  { label: '전세 거래 건수', value: formatCount(d.contract_count) },
]

function BuildingAgeChart({ data }) {
  return (
    <div className="chart-box" style={{ height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 28, right: 8, bottom: 4, left: 4 }} barCategoryGap="28%">
          <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="age_group"
            tick={{ ...AXIS_TICK, fill: CHART_COLORS.text }}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.neutralDark }}
            interval={0}
          />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(value) => formatNumber(value)}
          />
          <Tooltip
            cursor={{ fill: 'rgba(28, 28, 26, 0.05)' }}
            content={<ChartTooltip title={(d) => `건축연식 ${d.age_group}`} getRows={tooltipRows} />}
          />
          <Bar
            dataKey="median_deposit_per_m2"
            fill={CHART_COLORS.accent}
            radius={[2, 2, 0, 0]}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="median_deposit_per_m2"
              position="top"
              offset={8}
              formatter={(value) => formatNumber(value, 1)}
              style={{ fill: CHART_COLORS.text, fontSize: 12, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BuildingAgeChart
