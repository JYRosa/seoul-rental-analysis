import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartTooltip from '../components/ChartTooltip'
import { FINAL_MODEL_NAME } from '../constants/content'
import { formatDecimal, formatNumber } from '../utils/formatters'
import BarValueLabel from './BarValueLabel'
import { AXIS_TICK, CHART_COLORS } from './chartTheme'
import { METRICS } from './modelMetrics'

const tooltipRows = (d) => [
  { label: 'MAE', value: METRICS.mae.format(d.mae) },
  { label: 'RMSE', value: METRICS.rmse.format(d.rmse) },
  { label: 'R²', value: METRICS.r2.format(d.r2) },
]

// R²: 0.5 간격 눈금. 음수 값 라벨은 0 기준선 오른쪽에 표시한다.
function r2Scale(values) {
  const min = Math.min(0, ...values)
  const domain = [min < 0 ? min - 0.1 : 0, 1.2]
  const ticks = [-1, -0.5, 0, 0.5, 1].filter((t) => t >= domain[0] && t <= domain[1])
  return { domain, ticks }
}

// MAE / RMSE: 0부터 시작하고, 막대 오른쪽 라벨 여백을 둔 균등 눈금.
function errorScale(values) {
  const max = Math.max(...values)
  const rawStep = (max * 1.3) / 4
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rawStep)
  const ticks = Array.from({ length: 5 }, (_, i) => i * step)
  return { domain: [0, ticks[ticks.length - 1]], ticks }
}

function ModelComparisonChart({ rows, metric }) {
  const config = METRICS[metric]
  const values = rows.map((row) => row[metric])
  const { domain, ticks } = metric === 'r2' ? r2Scale(values) : errorScale(values)
  const axisFormat = metric === 'r2' ? (v) => formatDecimal(v, 1) : (v) => formatNumber(v)

  return (
    <div className="chart-box" style={{ height: rows.length * 52 + 40 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 4, right: 12, bottom: 4, left: 0 }}
          barCategoryGap="30%"
        >
          <CartesianGrid stroke={CHART_COLORS.grid} horizontal={false} />
          <XAxis
            type="number"
            domain={domain}
            ticks={ticks}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={axisFormat}
            allowDataOverflow
          />
          <YAxis
            type="category"
            dataKey="model"
            tick={{ ...AXIS_TICK, fill: CHART_COLORS.text }}
            tickLine={false}
            axisLine={false}
            width={118}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: 'rgba(28, 28, 26, 0.05)' }}
            content={<ChartTooltip title={(d) => d.model} getRows={tooltipRows} />}
          />
          <ReferenceLine x={0} stroke={CHART_COLORS.neutralDark} />
          <Bar dataKey={metric} radius={2} isAnimationActive={false}>
            {rows.map((row) => (
              <Cell
                key={row.model}
                fill={row.model === FINAL_MODEL_NAME ? CHART_COLORS.accent : CHART_COLORS.neutral}
              />
            ))}
            <LabelList
              dataKey={metric}
              content={(props) => (
                <BarValueLabel
                  {...props}
                  format={config.format}
                  negativePlacement="baseline"
                  emphasize={rows[props.index]?.model === FINAL_MODEL_NAME}
                />
              )}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ModelComparisonChart
