/**
 * dashboard_data.json에 포함되지 않은 설명 문구와 검증된 분석 결과.
 *
 * 모든 수치는 아래 문서에 기록된 실제 분석 결과에서 옮겨왔다.
 * - docs/PROJECT_GUIDE.md
 * - reports/final_report.md
 * - notebooks/03_eda.ipynb, 04_statistical_analysis.ipynb, 07_model_explainability.ipynb
 * - sql/analysis_queries.sql
 *
 * 수치를 변경할 때는 반드시 위 원본 분석 결과와 함께 수정한다.
 */

export const PROJECT = {
  title: '서울 아파트 전월세 시장 데이터 분석',
  subtitle: 'Seoul Rental Market Analysis',
  description:
    '2023~2025년 서울 아파트 실거래 데이터를 활용해 시장 변화, 지역별 가격 격차와 주요 가격 특성 분석 프로젝트',
  period: '2023.01 – 2025.12',
  dataSource: '서울특별시 부동산 전월세가 정보 (2023~2025)',
  githubUrl: 'https://github.com/JYRosa/seoul-rental-analysis',
}

export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'market', label: 'Market' },
  { id: 'insights', label: 'Insights' },
  { id: 'model', label: 'Model' },
  { id: 'methodology', label: 'Methodology' },
]

/* ------------------------------------------------------------------
 * 보증금-월세 관계 (H5)
 * 출처: PROJECT_GUIDE.md "EDA 주요 결과 5", "H5", "SQL 8"
 * ---------------------------------------------------------------- */
export const DEPOSIT_RENT = {
  overall: {
    method: 'Spearman',
    value: 0.17,
    approx: true,
    scope: '전체 월세 데이터',
  },
  byDistrict: {
    method: 'Spearman',
    scope: '60~85㎡ · 자치구별',
    negativeCount: 25,
    districtCount: 25,
    min: -0.7,
    max: -0.38,
  },
  regression: {
    coefficient: -0.2571,
    r2: 0.3871,
    pValue: '< 0.001',
    elasticityText: '보증금 1% 증가 시 월세 약 0.257% 감소 관계',
    controls: ['자치구', '전용면적', '건축연식', '층', '계약연도'],
  },
  // PostgreSQL CORR() 결과 중 문서에 기록된 일부 자치구 (60~85㎡ 월세, Pearson)
  sqlCorrExamples: [
    { district: '강북구', r: -0.6627 },
    { district: '관악구', r: -0.6599 },
    { district: '중구', r: -0.6503 },
    { district: '성북구', r: -0.6465 },
    { district: '강남구', r: -0.4531 },
    { district: '서초구', r: -0.4031 },
    { district: '성동구', r: -0.3949 },
    { district: '영등포구', r: -0.3775 },
  ],
}

/* ------------------------------------------------------------------
 * 가설 검정 요약 (H1~H5)
 * 출처: PROJECT_GUIDE.md "통계분석 주요 결과", final_report.md 6장
 * ---------------------------------------------------------------- */
export const HYPOTHESES = [
  {
    id: 'H1',
    statement: '자치구에 따라 전세가격 차이가 존재한다',
    method: 'Kruskal-Wallis',
    result: 'H = 157,921.5 · ε² = 0.3124',
    note: '통계적으로 유의한 차이, 큰 효과 크기',
  },
  {
    id: 'H2',
    statement: '건축연식이 낮을수록 전세가격이 높다',
    method: 'Spearman',
    result: 'ρ = −0.4143',
    note: '중간 수준의 음의 관계',
  },
  {
    id: 'H3',
    statement: '전용면적이 클수록 전세가격이 높다',
    method: 'Pearson / Spearman',
    result: 'r = 0.6088 · ρ = 0.6373',
    note: '비교적 강한 양의 관계',
  },
  {
    id: 'H4',
    statement: '지역·면적을 통제해도 건축연식은 가격과 관련이 있다',
    method: '다중회귀 (log 전세보증금)',
    result: '계수 −0.011911 · R² = 0.6287',
    note: '연식 1년 증가 시 약 1.18% 낮은 관계',
  },
  {
    id: 'H5',
    statement: '보증금이 높을수록 월세가 낮다',
    method: '다중회귀 (log 월세)',
    result: '계수 −0.2571 · R² = 0.3871',
    note: '보증금 1% 증가 시 약 0.257% 낮은 관계',
  },
]

export const HYPOTHESIS_FOOTNOTE =
  '모든 검정의 p-value < 0.001. 결과는 H1~H5 모두 지지되었으며, 관찰 데이터 기반의 관계로 해석한다.'

/* ------------------------------------------------------------------
 * 모델
 * 출처: PROJECT_GUIDE.md "Feature Engineering 및 데이터 분할", "SHAP 주요 결과"
 * ---------------------------------------------------------------- */
export const FINAL_MODEL_NAME = 'XGBoost'
export const BASELINE_MODEL_NAME = 'Median Baseline'

export const MODEL_TARGETS = {
  jeonse: {
    key: 'jeonse',
    label: '전세',
    target: '전세보증금',
    trainTarget: 'log(전세보증금)',
    unit: '만원',
    trainRows: 266848,
    testRows: 238570,
    shap: {
      image: 'figures/jeonse_shap_importance.png',
      alt: '전세가격 예측 XGBoost 모델의 SHAP Feature 중요도 (mean |SHAP value|)',
      topFeatures: ['임대면적', '자치구', '건축연식', '법정동', '시간추세'],
      summary: '면적과 지역(자치구·법정동)이 전세가격 예측에서 높은 중요도를 보였습니다.',
      notes: [
        '임대면적이 클수록 예측값을 높이는 방향으로 작용하였습니다.',
        '자치구 SHAP에서는 강남구, 서초구, 용산구, 성동구 등이 예측값을 높이는 방향으로 나타났습니다.',
        '건축연식이 증가할수록 예측값을 낮추는 패턴이 관찰되었습니다.',
      ],
    },
  },
  monthly: {
    key: 'monthly',
    label: '월세',
    target: '월세',
    trainTarget: 'log(월세)',
    unit: '만원',
    trainRows: 185103,
    testRows: 183778,
    shap: {
      image: 'figures/monthly_shap_importance.png',
      alt: '월세가격 예측 XGBoost 모델의 SHAP Feature 중요도 (mean |SHAP value|)',
      topFeatures: ['임대면적', '보증금', '자치구', '건축연식', '시간추세'],
      summary: '면적 다음으로 보증금이 월세가격 예측에서 높은 중요도를 보였습니다.',
      notes: [
        '보증금이 높을수록 월세 예측값을 낮추는 전반적인 음의 관계가 확인되었습니다.',
        '이는 통계분석(H5)과 SQL 자치구별 상관분석의 방향과 일관됩니다.',
        '건축연식이 증가할수록 예측값을 낮추는 패턴이 관찰되었습니다.',
      ],
    },
  },
}

export const MODEL_SPLIT_NOTE =
  '미래 데이터 누수를 막기 위해 Random Split 대신 계약일 기준으로 2023~2024년을 학습, 2025년을 평가 데이터로 분할했습니다.'

export const SHAP_CAVEAT =
  'SHAP 값은 모델의 예측 기여도를 설명하며, 해당 변수가 가격을 변화시키는 인과적 효과를 의미하지 않습니다.'

/* ------------------------------------------------------------------
 * Methodology
 * ---------------------------------------------------------------- */
export const PIPELINE_STEPS = [
  { title: 'Raw Data', detail: '서울시 전월세 실거래 2023~2025' },
  { title: 'Cleaning', detail: '아파트 필터 · 결측/품질 플래그' },
  { title: 'EDA', detail: '가격 분포 · 지역 · 면적 · 연식' },
  { title: 'Statistical Analysis', detail: 'Kruskal-Wallis · 상관 · 다중회귀' },
  { title: 'Feature Engineering', detail: '연식 · 시간추세 · 계절성' },
  { title: 'Machine Learning', detail: 'Baseline · Ridge · Random Forest' },
  { title: 'XGBoost', detail: '시간 기준 Split 최종 모델' },
  { title: 'SHAP', detail: 'Feature 중요도 · 영향 방향' },
  { title: 'PostgreSQL / SQL', detail: 'CTE · Window Function' },
  { title: 'Dashboard', detail: 'React · Recharts · 정적 JSON' },
]

export const CLEANING_RULES = [
  '서울 아파트 거래만 분석 대상으로 필터링 (단독다가구·연립다세대·오피스텔 제외)',
  '핵심 식별정보 결측 행만 제거 (881,805건 → 881,794건)',
  '고가 거래·지하층은 명백한 오류 근거가 없으므로 유지',
  '시계열 분석은 접수년도가 아닌 실제 계약일 기준으로 2023~2025년 제한',
  '가격 분포가 오른쪽으로 긴 꼬리를 가져 평균 대신 중앙값을 대표값으로 사용',
]

export const SQL_TECHNIQUES = [
  'CTE',
  'PERCENTILE_CONT',
  'RANK()',
  'LAG()',
  'PARTITION BY',
  'CORR()',
  'NTILE()',
  'CASE WHEN',
]

export const TECH_STACK = [
  { group: 'Analysis', items: 'Python 3.12 · pandas · NumPy · SciPy · statsmodels' },
  { group: 'Machine Learning', items: 'scikit-learn · XGBoost · SHAP' },
  { group: 'Database', items: 'PostgreSQL 18 · SQL' },
  { group: 'Dashboard', items: 'React · Vite · Recharts' },
]

export const MISSING_VARIABLES = [
  '역세권',
  '학군',
  '단지 브랜드',
  '세대수',
  '교통 접근성',
  '재건축 가능성',
]

export const LIMITATION_NOTES = [
  '모든 결과는 관찰 데이터에 기반하므로 통계적 관계나 SHAP 결과를 직접적인 인과관계로 해석하지 않습니다.',
  '2023~2025년의 비교적 짧은 기간을 분석했으며, Tree 기반 모델은 학습 기간 이후의 장기 추세를 외삽하는 데 한계가 있습니다.',
]

/* ------------------------------------------------------------------
 * Market 섹션 해설 문구
 * ---------------------------------------------------------------- */
export const MARKET_TEXT = {
  yearlyInsight:
    '2023~2025년 동안 서울 아파트 전세가격 수준이 전반적으로 상승하는 패턴이 관찰되었습니다.',
  yearlyNote:
    '60~85㎡로 면적을 제한한 비교에서도 25개 자치구 모두 2023 대비 2025 전세보증금 중앙값이 상승해, 대형 평형 거래 비중 변화만으로는 설명되지 않았습니다.',
  districtInsight:
    '서초구·강남구·성동구·중구·용산구가 높은 가격 수준을 보였으며, 2023~2025년 SQL 순위에서도 서초구와 강남구가 지속적으로 상위를 유지했습니다.',
  districtNote:
    'Kruskal-Wallis 검정에서 자치구 간 단위면적당 전세가격 분포 차이가 유의했고 효과 크기도 큰 수준(ε² = 0.3124)이었습니다.',
  ageInsight:
    '건축연식이 증가할수록 단위면적당 전세가격이 낮아지는 패턴이 나타났습니다.',
  ageNote:
    '지역·면적·층·계약연도를 통제한 다중회귀에서도 음의 관계가 유지되었으나(연식 1년당 약 −1.18%), 입지·브랜드·학군 등 미통제 변수가 있어 인과효과로 해석하지 않습니다.',
}
