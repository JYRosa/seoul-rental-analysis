// 차트 공통 색상. 강조(accent)는 핵심 값에만, 나머지는 중립 회색을 사용한다.
// 값은 src/index.css 의 CSS 변수와 동일하게 유지한다.
export const CHART_COLORS = {
  accent: '#2d6a57',
  neutral: '#b9b8b0',
  neutralDark: '#8c8b84',
  negative: '#a5502f',
  grid: '#e7e6e1',
  axis: '#6b6a64',
  text: '#1c1c1a',
}

export const AXIS_TICK = { fill: CHART_COLORS.axis, fontSize: 12 }

export const CHART_MARGIN = { top: 8, right: 16, bottom: 8, left: 8 }
