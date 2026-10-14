import { formatDecimal, formatManwon } from '../utils/formatters'

// 모델 비교 차트에서 전환 가능한 지표
export const METRICS = {
  r2: { label: 'R²', better: '높을수록 좋음', format: (v) => formatDecimal(v, 4) },
  mae: { label: 'MAE', better: '낮을수록 좋음', format: (v) => formatManwon(v, 2) },
  rmse: { label: 'RMSE', better: '낮을수록 좋음', format: (v) => formatManwon(v, 2) },
}
