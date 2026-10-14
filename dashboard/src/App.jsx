import Header from './components/Header'
import { PROJECT } from './constants/content'
import InsightSection from './sections/InsightSection'
import MarketSection from './sections/MarketSection'
import MethodologySection from './sections/MethodologySection'
import ModelSection from './sections/ModelSection'
import OverviewSection from './sections/OverviewSection'
import { useDashboardData } from './utils/useDashboardData'

function StatusMessage({ status, error, onRetry }) {
  if (status === 'loading') {
    return (
      <div className="status" role="status">
        <p>분석 데이터를 불러오는 중입니다…</p>
      </div>
    )
  }

  return (
    <div className="status status--error" role="alert">
      <p className="status__title">데이터를 불러오지 못했습니다.</p>
      <p className="status__detail">{error?.message}</p>
      <button type="button" className="button" onClick={onRetry}>
        다시 시도
      </button>
    </div>
  )
}

function App() {
  const { status, data, error, retry } = useDashboardData()
  const ready = status === 'success'

  return (
    <>
      <Header ready={ready} />
      <main className="page">
        {ready ? (
          <>
            <OverviewSection data={data} />
            <MarketSection data={data} />
            <InsightSection />
            <ModelSection data={data} />
            <MethodologySection data={data} />
          </>
        ) : (
          <StatusMessage status={status} error={error} onRetry={retry} />
        )}
      </main>
      <footer className="site-footer">
        <div className="site-footer__inner">
          <p>
            데이터: {PROJECT.dataSource}. 모든 수치는 Python · PostgreSQL 분석 결과를 집계한 정적 데이터입니다.
          </p>
          <a href={PROJECT.githubUrl} target="_blank" rel="noreferrer">
            GitHub Repository
          </a>
        </div>
      </footer>
    </>
  )
}

export default App
