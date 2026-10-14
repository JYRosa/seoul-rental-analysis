import SectionHeader from '../components/SectionHeader'
import {
  CLEANING_RULES,
  LIMITATION_NOTES,
  MISSING_VARIABLES,
  PIPELINE_STEPS,
  SQL_TECHNIQUES,
  TECH_STACK,
} from '../constants/content'
import { formatCount } from '../utils/formatters'

function MethodologySection({ data }) {
  return (
    <section id="methodology" className="section">
      <SectionHeader
        eyebrow="04 · Methodology"
        title="분석 과정과 한계"
        description="원천 데이터 정제부터 Dashboard까지 하나의 Pipeline으로 연결했습니다. Dashboard는 Python과 SQL에서 집계한 결과만 정적 JSON으로 읽어 표시합니다."
      />

      <ol className="pipeline">
        {PIPELINE_STEPS.map((step, index) => (
          <li key={step.title} className="pipeline__step">
            <span className="pipeline__num">{String(index + 1).padStart(2, '0')}</span>
            <span className="pipeline__title">{step.title}</span>
            <span className="pipeline__detail">{step.detail}</span>
          </li>
        ))}
      </ol>

      <div className="method-grid">
        <article>
          <h3 className="block__title">데이터 정제 기준</h3>
          <ul className="note-list">
            {CLEANING_RULES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </article>
        <article>
          <h3 className="block__title">SQL 분석</h3>
          <p className="body-text">
            정제 데이터 {formatCount(data.summary.clean_rows)}을 PostgreSQL에 적재해 연도별 자치구 순위, 전년 대비 변화, 법정동 가격 차이,
            자치구별 보증금–월세 상관, 시장 유형 분류를 SQL로 분석했습니다.
          </p>
          <ul className="chip-list">
            {SQL_TECHNIQUES.map((technique) => (
              <li key={technique}>
                <code>{technique}</code>
              </li>
            ))}
          </ul>
        </article>
        <article>
          <h3 className="block__title">Tech Stack</h3>
          <dl className="stack-list">
            {TECH_STACK.map((row) => (
              <div key={row.group}>
                <dt>{row.group}</dt>
                <dd>{row.items}</dd>
              </div>
            ))}
          </dl>
        </article>
      </div>

      <article className="block limitations">
        <h3 className="block__title">Analysis &amp; Model Limitations</h3>
        <div className="split split--even">
          <div>
            <p className="body-text">데이터에 포함되지 않은 변수</p>
            <ul className="chip-list chip-list--plain">
              {MISSING_VARIABLES.map((variable) => (
                <li key={variable}>{variable}</li>
              ))}
            </ul>
          </div>
          <ul className="note-list">
            {LIMITATION_NOTES.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </article>
    </section>
  )
}

export default MethodologySection
