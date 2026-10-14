import { useCallback, useEffect, useState } from 'react'

const DATA_URL = `${import.meta.env.BASE_URL}data/dashboard_data.json`

const REQUIRED_KEYS = [
  'summary',
  'yearly_jeonse',
  'district_price_2025',
  'building_age_price_2025',
  'model_performance',
]

/**
 * Python(src/export_dashboard_data.py)이 생성한 집계 JSON을 불러온다.
 * status: 'loading' | 'success' | 'error'
 */
export function useDashboardData() {
  const [state, setState] = useState({ status: 'loading', data: null, error: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const response = await fetch(DATA_URL, { signal: controller.signal })
        if (!response.ok) {
          throw new Error(`데이터 파일을 불러오지 못했습니다 (HTTP ${response.status}).`)
        }
        const json = await response.json()
        const missing = REQUIRED_KEYS.filter((key) => !(key in json))
        if (missing.length > 0) {
          throw new Error(`데이터 형식이 올바르지 않습니다. 누락된 항목: ${missing.join(', ')}`)
        }
        setState({ status: 'success', data: json, error: null })
      } catch (error) {
        if (error.name === 'AbortError') return
        setState({ status: 'error', data: null, error })
      }
    }

    load()
    return () => controller.abort()
  }, [attempt])

  const retry = useCallback(() => {
    setState({ status: 'loading', data: null, error: null })
    setAttempt((count) => count + 1)
  }, [])

  return { ...state, retry }
}
