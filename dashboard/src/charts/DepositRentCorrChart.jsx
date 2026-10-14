import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartTooltip from '../components/ChartTooltip'
import { formatDecimal, formatSigned } from '../utils/formatters'
import BarValueLabel from './BarValueLabel'
import { AXIS_TICK, CHART_COLORS } from './chartTheme'

const tooltipRows = (d) => [
  { label: 'Pearson r (보증금–월세)', value: formatSigned(d.r, 4) },
  { label: '조건', value: '60~85㎡ 월세 아파트' },
]

/** 자치구별 보증금-월세 상관계수 (문서에 기록된 일부 자치구) */
function DepositRentCorrChart({ data }) {
  const minValue = Math.min(...data.map((d) => d.r))
  const domain = [Math.floor(minValue * 10) / 10 - 0.1, 0]

  return (
    <div className="chart-box" style={{ height: data.length * 30 + 40 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 0 }} barCategoryGap={6}>
          <CartesianGrid stroke={CHART_COLORS.grid} horizontal={false} />
          <XAxis
            type="number"
            domain={domain}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatDecimal(v, 1)}
          />
          <YAxis
            type="category"
            dataKey="district"
            orientation="right"
            tick={{ ...AXIS_TICK, fill: CHART_COLORS.text }}
            tickLine={false}
            axisLine={false}
            width={64}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: 'rgba(28, 28, 26, 0.05)' }}
            content={<ChartTooltip title={(d) => d.district} getRows={tooltipRows} />}
          />
          <ReferenceLine x={0} stroke={CHART_COLORS.neutralDark} />
          <Bar dataKey="r" fill={CHART_COLORS.negative} radius={2} isAnimationActive={false}>
            <LabelList
              dataKey="r"
              content={(props) => <BarValueLabel {...props} format={(v) => formatSigned(v, 2)} />}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DepositRentCorrChart
