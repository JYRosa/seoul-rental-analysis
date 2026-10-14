import { useState } from 'react'
import ModelComparisonChart from '../charts/ModelComparisonChart'
import { METRICS } from '../charts/modelMetrics'
import ChartFigure from '../components/ChartFigure'
import SectionHeader from '../components/SectionHeader'
import SegmentedControl from '../components/SegmentedControl'
import {
  BASELINE_MODEL_NAME,
  FINAL_MODEL_NAME,
  MODEL_SPLIT_NOTE,
  MODEL_TARGETS,
  SHAP_CAVEAT,
} from '../constants/content'
import { formatDecimal, formatNumber, formatPercent } from '../utils/formatters'

const TARGET_OPTIONS = Object.values(MODEL_TARGETS).map((t) => ({ value: t.key, label: t.label }))
const METRIC_OPTIONS = Object.entries(METRICS).map(([value, m]) => ({ value, label: m.label }))

function PerformanceTable({ rows }) {
  return (
    <table className="data-table data-table--model">
      <caption className="visually-hidden">모델별 성능 지표</caption>
      <thead>
        <tr>
          <th scope="col">모델</th>
          <th scope="col" className="num">MAE</th>
          <th scope="col" className="num">RMSE</th>
          <th scope="col" className="num">R²</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const isFinal = row.model === FINAL_MODEL_NAME
          return (
            <tr key={row.model} className={isFinal ? 'is-final' : undefined}>
              <th scope="row">
                {row.model}
                {isFinal && <span className="tag">최종</span>}
              </th>
              <td className="num">{formatNumber(row.mae, 2)}</td>
              <td className="num">{formatNumber(row.rmse, 2)}</td>
              <td className="num">{formatDecimal(row.r2)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function ModelSection({ data }) {
  const [targetKey, setTargetKey] = useState('jeonse')
  const [metric, setMetric] = useState('r2')

  const target = MODEL_TARGETS[targetKey]
  const rows = data.model_performance[targetKey] ?? []
  const finalRow = rows.find((row) => row.model === FINAL_MODEL_NAME)
  const baselineRow = rows.find((row) => row.model === BASELINE_MODEL_NAME)
  const maeImprovement =
    finalRow && baselineRow ? (baselineRow.mae - finalRow.mae) / baselineRow.mae : null

  return (
    <section id="model" className="section">
      <SectionHeader
        eyebrow="03 · Model"
        title="가격 예측 모델과 설명"
        description="전세와 월세를 분리해 4개 모델을 동일한 2025년 Test 데이터에서 비교했습니다. 두 시장 모두 XGBoost가 가장 낮은 오차와 가장 높은 R²를 기록해 최종 모델로 선정했습니다."
      />

      <div className="toolbar">
        <SegmentedControl
          label="예측 대상"
          options={TARGET_OPTIONS}
          value={targetKey}
          onChange={setTargetKey}
        />
        <p className="toolbar__note">
          Target: {target.target} (학습 시 {target.trainTarget}) · Train {formatNumber(target.trainRows)}건 / Test{' '}
          {formatNumber(target.testRows)}건
        </p>
      </div>

      <div className="model-summary">
        <div>
          <p className="model-summary__label">{target.label} XGBoost R²</p>
          <p className="model-summary__value">{formatDecimal(finalRow?.r2)}</p>
        </div>
        <div>
          <p className="model-summary__label">MAE</p>
          <p className="model-summary__value">
            {formatNumber(finalRow?.mae, 2)}
            <span className="metric__unit">{target.unit}</span>
          </p>
        </div>
        <div>
          <p className="model-summary__label">Median Baseline 대비 MAE 개선</p>
          <p className="model-summary__value">{formatPercent(maeImprovement)}</p>
        </div>
      </div>

      <div className="split split--even">
        <ChartFigure
          title={`${target.label} 모델별 ${METRICS[metric].label}`}
          unit={METRICS[metric].better}
        >
          <div className="chart-controls">
            <SegmentedControl
              label="비교 지표"
              options={METRIC_OPTIONS}
              value={metric}
              onChange={setMetric}
            />
          </div>
          <ModelComparisonChart rows={rows} metric={metric} />
        </ChartFigure>
        <div className="stack">
          <PerformanceTable rows={rows} />
          <p className="caption">MAE · RMSE 단위: {target.unit}. {MODEL_SPLIT_NOTE}</p>
          <p className="caption">
            Tree 기반 모델(Random Forest, XGBoost)이 Ridge Regression보다 높은 성능을 보여, 임대가격에 비선형
            관계와 Feature 간 상호작용이 중요한 역할을 하는 것으로 판단했습니다.
          </p>
        </div>
      </div>

      <article className="block">
        <h3 className="block__title">SHAP · 모델은 무엇을 근거로 예측했나</h3>
        <div className="split split--wide-left">
          <ChartFigure
            title={`${target.label} XGBoost Feature 중요도`}
            unit="mean |SHAP value|"
            source="reports/figures · 07_model_explainability.ipynb"
          >
            <img
              className="shap-image"
              src={`${import.meta.env.BASE_URL}${target.shap.image}`}
              alt={target.shap.alt}
              width="1580"
              height="981"
              loading="lazy"
            />
          </ChartFigure>
          <div className="stack">
            <p className="shap-summary">{target.shap.summary}</p>
            <ol className="rank-list">
              {target.shap.topFeatures.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ol>
            <ul className="note-list">
              {target.shap.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
            <p className="caveat">{SHAP_CAVEAT}</p>
          </div>
        </div>
      </article>
    </section>
  )
}

export default ModelSection
