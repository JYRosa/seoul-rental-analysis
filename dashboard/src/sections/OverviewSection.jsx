import MetricCard from '../components/MetricCard'
import { DEPOSIT_RENT, PROJECT } from '../constants/content'
import { formatDecimal, formatManwon, formatNumber, formatPerM2 } from '../utils/formatters'

function OverviewSection({ data }) {
  const { summary, yearly_jeonse: yearly, district_price_2025: districts } = data
  const first = yearly[0]
  const last = yearly[yearly.length - 1]
  const sortedDistricts = [...districts].sort(
    (a, b) => b.median_deposit_per_m2 - a.median_deposit_per_m2,
  )
  const top = sortedDistricts[0]
  const bottom = sortedDistricts[sortedDistricts.length - 1]

  const findings = [
    {
      href: '#market',
      text: (
        <>
          전세보증금 중앙값은 {first.year}년 <strong>{formatManwon(first.median_deposit)}</strong>에서{' '}
          {last.year}년 <strong>{formatManwon(last.median_deposit)}</strong>으로 높아졌습니다.
        </>
      ),
    },
    {
      href: '#market',
      text: (
        <>
          {last.year}년 ㎡당 전세가격은 {top.district}({formatPerM2(top.median_deposit_per_m2)})와{' '}
          {bottom.district}({formatPerM2(bottom.median_deposit_per_m2)}) 사이에 약{' '}
          <strong>{formatNumber(top.median_deposit_per_m2 / bottom.median_deposit_per_m2, 1)}배</strong> 차이를
          보였습니다.
        </>
      ),
    },
    {
      href: '#insights',
      text: (
        <>
          보증금과 월세는 전체 데이터에서 약한 양의 관계였지만, 면적·지역을 통제하면{' '}
          <strong>
            {DEPOSIT_RENT.byDistrict.districtCount}개 자치구 모두 음의 관계
          </strong>
          가 나타났습니다.
        </>
      ),
    },
  ]

  return (
    <section id="overview" className="section section--overview">
      <div className="hero">
        <p className="eyebrow">{PROJECT.subtitle}</p>
        <h1>{PROJECT.title}</h1>
        <p className="hero__desc">{PROJECT.description}</p>
        <p className="hero__meta">
          <span>분석 기간 {PROJECT.period}</span>
          <span>데이터 {PROJECT.dataSource}</span>
        </p>
      </div>

      <div className="metric-grid">
        <MetricCard label="정제 데이터" value={formatNumber(summary.clean_rows)} unit="건" />
        <MetricCard
          label="분석 데이터"
          value={formatNumber(summary.analysis_rows)}
          unit="건"
          note="실제 계약일 2023~2025"
        />
        <MetricCard label="서울 자치구" value={formatNumber(summary.district_count)} unit="개" />
        <MetricCard
          label="전세 XGBoost R²"
          value={formatDecimal(summary.jeonse_model.r2)}
          note={`MAE ${formatManwon(summary.jeonse_model.mae, 2)}`}
        />
        <MetricCard
          label="월세 XGBoost R²"
          value={formatDecimal(summary.monthly_model.r2)}
          note={`MAE ${formatManwon(summary.monthly_model.mae, 2)}`}
        />
      </div>

      <div className="findings">
        <p className="findings__label">주요 발견</p>
        <ol className="findings__list">
          {findings.map((finding, index) => (
            <li key={index}>
              <a href={finding.href}>{finding.text}</a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default OverviewSection
