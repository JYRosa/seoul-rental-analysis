import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartTooltip from '../components/ChartTooltip'
import { formatAxisEok, formatCount, formatEok, formatManwon, formatPerM2 } from '../utils/formatters'
import { AXIS_TICK, CHART_COLORS } from './chartTheme'

const tooltipRows = (d) => [
  { label: '전세보증금 중앙값', value: `${formatManwon(d.median_deposit)} (${formatEok(d.median_deposit)})` },
  { label: '㎡당 중앙값', value: formatPerM2(d.median_deposit_per_m2) },
  { label: '전세 거래 건수', value: formatCount(d.contract_count) },
]

// 3개 연도의 변화가 보이도록 y축은 데이터 범위 주변으로 설정한다 (0 기준 아님).
const yDomain = [
  (min) => Math.floor((min * 0.9) / 2000) * 2000,
  (max) => Math.ceil((max * 1.05) / 2000) * 2000,
]

function YearlyTrendChart({ data }) {
  return (
    <div className="chart-box" style={{ height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 32, right: 32, bottom: 4, left: 4 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
          <XAxis
            dataKey="year"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: CHART_COLORS.grid }}
            padding={{ left: 40, right: 40 }}
            tickFormatter={(year) => `${year}년`}
          />
          <YAxis
            domain={yDomain}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={formatAxisEok}
          />
          <Tooltip
            cursor={{ stroke: CHART_COLORS.neutral, strokeDasharray: '3 3' }}
            content={<ChartTooltip title={(d) => `${d.year}년`} getRows={tooltipRows} />}
          />
          <Line
            type="linear"
            dataKey="median_deposit"
            stroke={CHART_COLORS.accent}
            strokeWidth={2}
            dot={{ r: 5, fill: CHART_COLORS.accent, stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 7, fill: CHART_COLORS.accent, stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="median_deposit"
              position="top"
              offset={14}
              formatter={(value) => formatManwon(value)}
              style={{ fill: CHART_COLORS.text, fontSize: 13, fontWeight: 600 }}
            />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default YearlyTrendChart
