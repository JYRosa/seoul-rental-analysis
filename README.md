# Seoul Rental Market Analysis

서울시 아파트 전월세 실거래 데이터를 활용하여
임대시장 구조를 분석하고 전세보증금 및 월세 예측 모델을 구축한 프로젝트입니다.

단순 EDA에 그치지 않고

**데이터 정제 → EDA → 통계분석 → SQL → 머신러닝 → SHAP**

까지 하나의 분석 Pipeline으로 구성했습니다.


---

## Project Overview

### 분석 데이터

- 서울시 부동산 전월세가 정보
- 기간: 2023 ~ 2025
- 최종 정제 데이터: **881,794건**
- 실제 계약일 기준 분석 데이터: **875,925건**


### 주요 분석 질문

1. 자치구에 따라 전세가격 차이가 존재하는가?
2. 건축연식이 오래될수록 전세가격이 낮아지는가?
3. 전용면적과 전세가격은 어떤 관계가 있는가?
4. 지역과 면적을 고려한 이후에도 건축연식과 가격의 관계가 남는가?
5. 유사한 조건에서 보증금이 증가하면 월세는 감소하는가?


---

# Key Insights

## 1. 지역별 전세가격 차이

Kruskal-Wallis 검정 결과:

- H statistic: 157,921.5082
- p-value: < 0.001
- Epsilon squared: **0.3124**

서울 25개 자치구의 단위면적당 전세가격 분포에는
통계적으로 유의한 차이가 존재했고,
효과크기 역시 큰 수준으로 나타났습니다.

2023~2025년 동안
서초구와 강남구는 지속적으로 전세가격 상위권을 유지했습니다.


## 2. 건축연식과 전세가격

Spearman 상관분석:

- rho: **-0.4143**
- p-value: < 0.001

다중회귀분석에서는
지역, 면적, 층, 계약연도를 고려한 이후에도
건축연식과 전세가격 사이의 음의 관계가 유지되었습니다.

건축연식이 1년 증가할 때
전세보증금은 평균적으로 약 **1.18% 낮아지는 관계**가 관찰되었습니다.


## 3. 전용면적과 전세가격

- Pearson r: **0.6088**
- Spearman rho: **0.6373**

전용면적이 증가할수록
전세보증금도 증가하는 비교적 강한 양의 관계가 나타났습니다.

SHAP에서도 임대면적은
전세와 월세 모델 모두에서 가장 중요한 Feature로 나타났습니다.


## 4. 보증금과 월세의 조건부 관계

전체 월세 데이터에서는
보증금과 월세 사이에 약한 양의 상관관계가 나타났습니다.

그러나 면적과 지역 조건을 고려하면
관계가 반대로 나타났습니다.

다중회귀 결과:

- log_deposit coefficient: **-0.2571**
- p-value: < 0.001

다른 조건을 고려했을 때
보증금이 1% 증가하면
월세가 평균적으로 약 **0.257% 낮아지는 관계**가 관찰되었습니다.

PostgreSQL에서도
60~85㎡ 아파트를 자치구별로 분석한 결과
서울 **25개 자치구 모두 보증금-월세 상관계수가 음수**로 나타났습니다.


---

# Machine Learning

미래 데이터 누수를 방지하기 위해
Random Split 대신 시간 기준으로 데이터를 분리했습니다.

- Train: 2023 ~ 2024
- Test: 2025


## 전세가격 예측

| Model | MAE | RMSE | R² |
|---|---:|---:|---:|
| Median Baseline | 24,418.73 | 38,372.88 | -0.0898 |
| Ridge Regression | 11,750.89 | 21,799.32 | 0.6483 |
| Random Forest | 10,085.60 | 16,266.84 | 0.8042 |
| **XGBoost** | **9,074.27** | **14,690.37** | **0.8403** |

최종 모델: **XGBoost**

Median Baseline 대비 MAE:

**62.84% 개선**


## 월세가격 예측

| Model | MAE | RMSE | R² |
|---|---:|---:|---:|
| Median Baseline | 75.15 | 131.83 | -0.1049 |
| Ridge Regression | 57.81 | 169.70 | -0.8308 |
| Random Forest | 29.88 | 59.86 | 0.7722 |
| **XGBoost** | **29.32** | **57.68** | **0.7885** |

최종 모델: **XGBoost**

Median Baseline 대비 MAE:

**60.98% 개선**


---

# Model Explainability

최종 XGBoost 모델은 SHAP을 이용해 해석했습니다.

### 전세 주요 Feature

1. 임대면적
2. 자치구
3. 건축연식
4. 법정동
5. 시간추세

### 월세 주요 Feature

1. 임대면적
2. 보증금
3. 자치구
4. 건축연식
5. 시간추세

주요 SHAP 패턴:

- 면적 증가 → 가격 예측을 높이는 방향
- 건축연식 증가 → 가격 예측을 낮추는 방향
- 강남·서초 등 일부 지역 → 전세가격 예측을 높이는 방향
- 보증금 증가 → 월세가격 예측을 낮추는 전반적인 패턴


---

# SQL Analysis

정제 데이터 **881,794건**을 PostgreSQL 18에 적재하여
별도의 SQL 분석을 수행했습니다.

사용한 주요 SQL 기능:

- CTE
- GROUP BY
- HAVING
- CASE WHEN
- PERCENTILE_CONT
- RANK()
- LAG()
- PARTITION BY
- CORR()
- NTILE()

주요 분석:

- 연도별 자치구 전세가격 순위
- 자치구별 전년 대비 가격 변화율
- 상승률 Ranking
- 자치구 내부 법정동 가격 Ranking
- 면적 구간별 가격
- 건축연식별 가격
- 보증금 구간별 월세
- 자치구별 보증금-월세 상관관계
- 가격 수준 및 상승률 기반 시장 유형 분류


---

# Tech Stack

### Data Analysis

- Python 3.12
- pandas
- NumPy
- SciPy
- statsmodels
- Matplotlib

### Machine Learning

- scikit-learn
- XGBoost
- SHAP

### Database / SQL

- PostgreSQL 18
- SQL

### Dashboard

- React
- Vite
- Plotly / Recharts
- Vercel


---

# Project Structure

```text
seoul-rental-analysis/
│
├── data/
│   ├── raw/
│   └── processed/
│
├── notebooks/
│   ├── 01_data_understanding.ipynb
│   ├── 02_data_cleaning.ipynb
│   ├── 03_eda.ipynb
│   ├── 04_statistical_analysis.ipynb
│   ├── 05_feature_engineering.ipynb
│   ├── 06_modeling.ipynb
│   └── 07_model_explainability.ipynb
│
├── sql/
│   ├── schema.sql
│   └── analysis_queries.sql
│
├── src/
│
├── reports/
│   ├── figures/
│   └── final_report.md
│
├── docs/
│   └── PROJECT_GUIDE.md
│
├── dashboard/
│
└── README.md