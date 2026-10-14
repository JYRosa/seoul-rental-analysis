const numberFormatters = new Map()

function getFormatter(digits) {
  if (!numberFormatters.has(digits)) {
    numberFormatters.set(
      digits,
      new Intl.NumberFormat('ko-KR', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }),
    )
  }
  return numberFormatters.get(digits)
}

function isValidNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

/** 천 단위 구분 기호가 들어간 숫자. 예: 881794 → "881,794" */
export function formatNumber(value, digits = 0) {
  if (!isValidNumber(value)) return '–'
  return getFormatter(digits).format(value)
}

/** 거래 건수. 예: 881794 → "881,794건" */
export function formatCount(value) {
  return `${formatNumber(value)}건`
}

/** 만원 단위 금액. 예: 46000 → "46,000만원" */
export function formatManwon(value, digits = 0) {
  return `${formatNumber(value, digits)}만원`
}

/** 만원 단위 금액을 억/만원으로 읽기 쉽게 변환. 예: 52500 → "5억 2,500만원" */
export function formatEok(value) {
  if (!isValidNumber(value)) return '–'
  const eok = Math.floor(value / 10000)
  const rest = Math.round(value % 10000)
  if (eok === 0) return formatManwon(rest)
  if (rest === 0) return `${eok}억원`
  return `${eok}억 ${formatNumber(rest)}만원`
}

/** 단위면적당 금액. 예: 1044.93 → "1,044.9만원/㎡" */
export function formatPerM2(value, digits = 1) {
  return `${formatNumber(value, digits)}만원/㎡`
}

/** R² 등 소수 지표. 예: 0.8403 → "0.8403" */
export function formatDecimal(value, digits = 4) {
  if (!isValidNumber(value)) return '–'
  return value.toFixed(digits)
}

/** 부호를 포함한 소수. 예: -0.2571 → "−0.2571" */
export function formatSigned(value, digits = 4) {
  if (!isValidNumber(value)) return '–'
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  return `${sign}${Math.abs(value).toFixed(digits)}`
}

/** 비율(0~1)을 퍼센트로. 예: 0.6284 → "62.84%" */
export function formatPercent(ratio, digits = 2) {
  if (!isValidNumber(ratio)) return '–'
  return `${(ratio * 100).toFixed(digits)}%`
}

/** 부호를 포함한 퍼센트. 예: 0.087 → "+8.7%" */
export function formatSignedPercent(ratio, digits = 1) {
  if (!isValidNumber(ratio)) return '–'
  const sign = ratio > 0 ? '+' : ratio < 0 ? '−' : ''
  return `${sign}${Math.abs(ratio * 100).toFixed(digits)}%`
}

/** 차트 축 눈금용 축약 표기. 예: 46000 → "4.6억" */
export function formatAxisEok(value) {
  if (!isValidNumber(value)) return ''
  return `${formatNumber(value / 10000, 1)}억`
}
