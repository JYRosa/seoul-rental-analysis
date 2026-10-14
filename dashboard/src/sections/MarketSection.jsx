import BuildingAgeChart from '../charts/BuildingAgeChart'
import DistrictPriceChart from '../charts/DistrictPriceChart'
import YearlyTrendChart from '../charts/YearlyTrendChart'
import ChartFigure from '../components/ChartFigure'
import InsightBox from '../components/InsightBox'
import SectionHeader from '../components/SectionHeader'
import { MARKET_TEXT } from '../constants/content'
import {
  formatCount,
  formatManwon,
  formatNumber,
  formatPerM2,
  formatSignedPercent,
} from '../utils/formatters'

function YearlyTable({ rows }) {
  return (
    <table className="data-table">
      <caption className="visually-hidden">연도별 전세보증금 중앙값</caption>
      <thead>
        <tr>
          <th scope="col">연도</th>
          <th scope="col" className="num">중앙값</th>
          <th scope="col" className="num">전년 대비</th>
          <th scope="col" className="num">㎡당</th>
          <th scope="col" className="num">거래</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => {
          const prev = rows[index - 1]
          const change = prev ? row.median_deposit / prev.median_deposit - 1 : null
          return (
            <tr key={row.year}>
              <th scope="row">{row.year}</th>
              <td className="num">{formatManwon(row.median_deposit)}</td>
              <td className="num">{change === null ? '–' : formatSignedPercent(change)}</td>
              <td className="num">{formatNumber(row.median_deposit_per_m2, 1)}</td>
              <td className="num">{formatNumber(row.contract_count)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function MarketSection({ data }) {
  const yearly = data.yearly_jeonse
  const districts = data.district_price_2025
  const ages = data.building_age_price_2025

  // 서울 전체 2025 전세 ㎡당 중앙값 (district_price_2025와 동일한 2025 전세 집단)
  const seoul2025 = yearly.find((row) => row.year === 2025)?.median_deposit_per_m2
  const aboveCount = districts.filter((d) => d.median_deposit_per_m2 >= seoul2025).length

  const newest = ages[0]
  const oldest = ages[ages.length - 1]

  return (
    <section id="market" className="section">
      <SectionHeader
        eyebrow="01 · Market"
        title="서울 아파트 전세시장의 흐름"
        description="연도, 지역, 건축연식에 따라 전세가격 수준이 어떻게 다른지 살펴봅니다. 가격 분포가 오른쪽으로 긴 꼬리를 가지므로 모든 값은 중앙값입니다."
      />

      <article className="block">
        <h3 className="block__title">연도별 전세보증금 중앙값</h3>
        <div className="split split--wide-left">
          <ChartFigure
            title="전세보증금 중앙값 추이"
            unit="단위: 만원 (축: 억원)"
            source="전세 계약 · 실제 계약일 기준"
          >
            <YearlyTrendChart data={yearly} />
          </ChartFigure>
          <div className="stack">
            <YearlyTable rows={yearly} />
            <InsightBox note={MARKET_TEXT.yearlyNote}>{MARKET_TEXT.yearlyInsight}</InsightBox>
          </div>
        </div>
      </article>

      <article className="block">
        <h3 className="block__title">2025년 자치구별 단위면적당 전세가격</h3>
        <div className="split split--wide-left">
          <ChartFigure
            title="자치구별 ㎡당 전세보증금 중앙값 (2025)"
            unit="단위: 만원/㎡"
            source={`점선: 서울 전체 2025 전세 중앙값 ${formatPerM2(seoul2025)}`}
          >
            <div className="legend" aria-hidden="true">
              <span className="legend__item">
                <span className="legend__swatch legend__swatch--accent" />
                서울 전체 중앙값 이상 ({aboveCount}개)
              </span>
              <span className="legend__item">
                <span className="legend__swatch legend__swatch--neutral" />
                미만 ({districts.length - aboveCount}개)
              </span>
            </div>
            <DistrictPriceChart data={districts} seoulMedian={seoul2025} />
          </ChartFigure>
          <div className="stack">
            <InsightBox note={MARKET_TEXT.districtNote}>{MARKET_TEXT.districtInsight}</InsightBox>
            <p className="caption">
              막대 위에 마우스를 올리면 자치구별 ㎡당 중앙값과 거래 건수를 확인할 수 있습니다. 전체 2025년
              전세 거래 {formatCount(yearly.find((row) => row.year === 2025)?.contract_count)}을 집계했습니다.
            </p>
          </div>
        </div>
      </article>

      <article className="block">
        <h3 className="block__title">건축연식별 단위면적당 전세가격 (2025)</h3>
        <div className="split split--wide-left">
          <ChartFigure
            title="건축연식 구간별 ㎡당 전세보증금 중앙값"
            unit="단위: 만원/㎡"
            source="건축년도 정보가 있는 2025년 전세 계약"
          >
            <BuildingAgeChart data={ages} />
          </ChartFigure>
          <div className="stack">
            <dl className="compare">
              <div>
                <dt>{newest.age_group}</dt>
                <dd>{formatPerM2(newest.median_deposit_per_m2)}</dd>
              </div>
              <div>
                <dt>{oldest.age_group}</dt>
                <dd>{formatPerM2(oldest.median_deposit_per_m2)}</dd>
              </div>
            </dl>
            <InsightBox note={MARKET_TEXT.ageNote}>{MARKET_TEXT.ageInsight}</InsightBox>
          </div>
        </div>
      </article>
    </section>
  )
}

export default MarketSection
