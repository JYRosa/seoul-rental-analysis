import DepositRentCorrChart from '../charts/DepositRentCorrChart'
import ChartFigure from '../components/ChartFigure'
import SectionHeader from '../components/SectionHeader'
import { DEPOSIT_RENT, HYPOTHESES, HYPOTHESIS_FOOTNOTE } from '../constants/content'
import { formatDecimal, formatSigned } from '../utils/formatters'

function EvidenceStep({ step, scope, value, valueNote, children, tone }) {
  return (
    <li className={`evidence__step evidence__step--${tone}`}>
      <p className="evidence__index">{step}</p>
      <p className="evidence__scope">{scope}</p>
      <p className="evidence__value">{value}</p>
      <p className="evidence__value-note">{valueNote}</p>
      <p className="evidence__text">{children}</p>
    </li>
  )
}

function InsightSection() {
  const { overall, byDistrict, regression, sqlCorrExamples } = DEPOSIT_RENT

  return (
    <section id="insights" className="section">
      <SectionHeader
        eyebrow="02 · Insights"
        title="보증금이 높으면 월세도 높을까?"
        description="전체 데이터의 단순 상관만 보면 보증금과 월세는 함께 높아지는 것처럼 보입니다. 그러나 면적과 지역 조건을 맞추면 관계의 방향이 달라졌습니다."
      />

      <ol className="evidence">
        <EvidenceStep
          step="1"
          tone="neutral"
          scope={overall.scope}
          value={`${overall.approx ? '약 ' : ''}${formatSigned(overall.value, 2)}`}
          valueNote={`${overall.method} 상관계수`}
        >
          약한 양의 관계. 고가 지역·대형 주택에서는 보증금과 월세가 동시에 높아, 지역과 면적 차이가 관계를
          가릴 수 있습니다.
        </EvidenceStep>
        <EvidenceStep
          step="2"
          tone="accent"
          scope={byDistrict.scope}
          value={`${byDistrict.negativeCount} / ${byDistrict.districtCount}`}
          valueNote="음의 상관을 보인 자치구"
        >
          면적을 60~85㎡로 제한하고 자치구별로 나누자 모든 자치구에서 음의 관계가 나타났습니다 ({byDistrict.method} ρ
          약 {formatSigned(byDistrict.min, 2)} ~ {formatSigned(byDistrict.max, 2)}).
        </EvidenceStep>
        <EvidenceStep
          step="3"
          tone="accent"
          scope={`다중회귀 · ${regression.controls.join('·')} 통제`}
          value={formatSigned(regression.coefficient, 4)}
          valueNote="log 보증금 계수"
        >
          {regression.elasticityText}가 확인되었습니다 (p {regression.pValue}, R²{' '}
          {formatDecimal(regression.r2)}).
        </EvidenceStep>
      </ol>

      <div className="split split--wide-right">
        <div className="stack">
          <h3 className="block__title">같은 조건에서는 trade-off 관계</h3>
          <p className="body-text">
            유사한 지역과 면적 조건에서는 보증금을 더 많이 낸 계약일수록 월세가 낮은 trade-off 구조가
            관찰되었습니다. 이 방향은 PostgreSQL의 자치구별 <code>CORR()</code> 분석과 월세 XGBoost 모델의 SHAP
            결과에서도 동일하게 확인되었습니다.
          </p>
          <p className="body-text body-text--muted">
            단순 집계와 조건부 분석의 결과가 달랐다는 점은, 변수 간 관계를 판단할 때 혼입 요인을 함께 고려해야
            함을 보여줍니다. 이 결과는 관찰된 관계이며 인과관계를 의미하지 않습니다.
          </p>
        </div>
        <ChartFigure
          title="자치구별 보증금–월세 상관계수 (일부)"
          unit="Pearson r"
          source="60~85㎡ 월세 아파트 · PostgreSQL CORR() · 문서에 기록된 8개 자치구 예시 (25개 자치구 모두 음수)"
        >
          <DepositRentCorrChart data={sqlCorrExamples} />
        </ChartFigure>
      </div>

      <article className="block">
        <h3 className="block__title">가설 검정 요약</h3>
        <div className="table-scroll">
          <table className="data-table data-table--hypothesis">
            <thead>
              <tr>
                <th scope="col">가설</th>
                <th scope="col">내용</th>
                <th scope="col">검정 방법</th>
                <th scope="col">결과</th>
                <th scope="col">해석</th>
              </tr>
            </thead>
            <tbody>
              {HYPOTHESES.map((h) => (
                <tr key={h.id}>
                  <th scope="row">{h.id}</th>
                  <td>{h.statement}</td>
                  <td className="muted">{h.method}</td>
                  <td className="mono">{h.result}</td>
                  <td>{h.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="caption">{HYPOTHESIS_FOOTNOTE}</p>
      </article>
    </section>
  )
}

export default InsightSection
