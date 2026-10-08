# Seoul Rental Market Analysis
## Project Guide

---

# 1. 프로젝트 개요

서울 전월세 실거래 데이터를 활용하여

- 전월세 시장 구조 분석
- 가격 결정요인 분석
- 지역별 가격 차이 분석
- 통계 분석
- 전세/월세 가격 예측
- 머신러닝 모델 비교
- SHAP 기반 모델 해석

을 수행하는 데이터 분석 포트폴리오 프로젝트이다.

최종적으로 분석 결과를 별도의 React Dashboard로 시각화하여
개인 포트폴리오 웹사이트에서 접근할 수 있도록 한다.

---

# 2. 프로젝트 목적

이 프로젝트의 목적은 웹서비스 개발이 아니라
데이터 분석 역량을 증명하는 것이다.

핵심 평가 요소:

1. 데이터 이해
2. 데이터 정제
3. EDA
4. 가설 설정
5. 통계 분석
6. Feature Engineering
7. 머신러닝
8. 모델 평가
9. 모델 설명
10. 데이터 시각화
11. 분석 결과 전달

React Dashboard는 분석 결과를 보여주기 위한 Presentation Layer이며
프로젝트의 핵심 분석 로직을 담당하지 않는다.

---

# 3. 데이터

데이터 출처:

서울시 부동산 전월세 실거래 데이터

사용 기간:

2023 ~ 2025

현재 원본 데이터:

data/raw/

- 서울특별시_전월세가_2023.csv
- 서울특별시_전월세가_2024.csv
- 서울특별시_전월세가_2025.csv

원본 데이터는 GitHub에 업로드하지 않는다.

---

# 4. 분석 대상

1차 분석 대상은 서울 아파트이다.

다음 건물 유형은 현재 메인 분석 대상에서 제외한다.

- 단독다가구
- 연립다세대
- 오피스텔

전세와 월세는 가격구조가 다르므로 분석 및 모델링 과정에서
필요에 따라 분리한다.

---

# 5. 현재 확인된 2023 데이터

전체 전월세 거래:

545,813건

건물용도:

- 아파트: 233,849
- 단독다가구: 133,456
- 연립다세대: 116,141
- 오피스텔: 62,367

아파트 전월세:

- 전세: 139,307
- 월세: 94,542

아파트 신규계약구분:

- 신규: 138,033
- 갱신: 61,098
- 결측: 34,718

주요 결측치:

- 계약기간: 51,754
- 신규계약구분: 34,718
- 건축년도: 47

데이터 품질 검사:

- 임대면적 <= 0: 0
- 보증금 < 0: 0
- 임대료 < 0: 0
- 층 <= 0: 23
- 건축년도 < 1900: 0
- 완전 중복 행: 103
- 전세인데 월세 존재: 0
- 월세인데 임대료 0: 35

---

# 6. 원본 컬럼

총 23개:

- 접수년도
- 자치구코드
- 자치구명
- 법정동코드
- 법정동명
- 지번구분코드
- 지번구분
- 본번
- 부번
- 층
- 계약일
- 전월세구분
- 임대면적
- 보증금(만원)
- 임대료(만원)
- 건물명
- 건축년도
- 건물용도
- 계약기간
- 신규계약구분
- 갱신청구권사용
- 종전보증금
- 종전임대료

현재 주요 분석 후보 컬럼:

- 접수년도
- 자치구명
- 법정동명
- 층
- 계약일
- 전월세구분
- 임대면적
- 보증금(만원)
- 임대료(만원)
- 건물명
- 건축년도
- 건물용도
- 계약기간
- 신규계약구분

---

# 7. Feature Engineering

전세와 월세 예측을 위한 Feature Engineering을 완료하였다.

주요 Feature:

## building_age

계약년도 - 건축년도

## pyeong

임대면적 / 3.3058

## deposit_per_m2

보증금 / 임대면적

## area_group

예:

- ~40㎡
- 40~60㎡
- 60~85㎡
- 85~102㎡
- 102㎡~

## floor_group

- 저층
- 중층
- 고층

단, 층 구간 정의는 데이터 분포 확인 후 결정한다.

## contract_year

계약일로부터 추출

## contract_month

계약일로부터 추출

계약월 기반 계절 Feature도 추가하였다.

실제 모델링에는 계약월의 주기성을 표현하는
`contract_month_sin`, `contract_month_cos`와
시간 흐름을 표현하는 `time_idx`를 추가하였다.

전세 모델:

- Train: 266,848건
- Test: 238,570건
- Target: 전세보증금
- 학습 Target: log(전세보증금)
- 주요 Feature: 자치구, 법정동, 임대면적, 건축연식, 층, 시간추세, 계절성

월세 모델:

- Train: 185,103건
- Test: 183,778건
- Target: 월세
- 학습 Target: log(월세)
- 주요 Feature: 보증금, 자치구, 법정동, 임대면적, 건축연식, 층, 시간추세, 계절성

미래 데이터 누수를 방지하기 위해 Random Split 대신
계약일을 기준으로 다음과 같이 시간 분할하였다.

- Train: 2023~2024
- Test: 2025

---

# 8. 주요 분석 질문

## 지역

서울 자치구별 전세가격 차이는 얼마나 존재하는가?

## 면적

전용면적 증가에 따라 전세가격은 어떻게 변화하는가?

## 건물 연식

신축 아파트의 전세가격 프리미엄이 존재하는가?

## 층

지역과 면적을 통제했을 때 층수가 가격에 영향을 미치는가?

## 월세

보증금 증가와 월세 감소 사이에 관계가 존재하는가?

---

# 9. 주요 가설

H1

동일한 면적이라도 자치구에 따라 전세가격 차이가 존재한다.

H2

건물 연식이 낮을수록 전세가격이 높다.

H3

전용면적이 증가할수록 전세가격이 증가한다.

H4

지역과 면적을 통제해도 건물 연식은 가격에 영향을 준다.

H5

월세 계약에서는 보증금이 증가할수록 월세가 감소하는 경향이 있다.

---

# 10. 분석 방법

사용 방법:

- Descriptive Statistics
- Pearson Correlation
- Spearman Correlation
- Kruskal-Wallis Test
- Multiple Linear Regression

전세가격 분포의 비정규성과 극단값을 고려하여
자치구별 차이 검정에는 Kruskal-Wallis 검정을 사용하였다.

전용면적과 가격의 관계에는 Pearson 및 Spearman 상관분석을,
건축연식과 가격의 관계에는 Spearman 상관분석을 사용하였다.

다른 조건을 동시에 통제하기 위해
로그 변환 Target을 이용한 다중선형회귀분석을 수행하였다.

p-value뿐 아니라 효과 크기, 설명력, 표본 수,
변수 통제 여부를 함께 고려하여 결과를 해석하였다.

---

# 11. Machine Learning

전세와 월세를 별도 모델링하였다.

비교 모델:

- Median Baseline
- Ridge Regression
- Random Forest Regressor
- XGBoost

평가 지표:

- MAE
- RMSE
- R²

시간 기반 Split:

- Train: 2023~2024
- Test: 2025

전세와 월세 모두 XGBoost가 가장 높은 성능을 보여
최종 모델로 선정하였다.

전세 XGBoost:

- MAE: 9,074.27만원
- RMSE: 14,690.37만원
- R²: 0.8403
- Median Baseline 대비 MAE 개선율: 62.84%

월세 XGBoost:

- MAE: 29.32만원
- RMSE: 57.68만원
- R²: 0.7885
- Median Baseline 대비 MAE 개선율: 60.98%

Tree 기반 모델이 Ridge Regression보다 높은 성능을 보여
임대가격에 비선형 관계와 Feature 간 상호작용이
중요한 역할을 하는 것으로 판단하였다.

---

# 12. Model Explainability

최종 XGBoost 모델에 SHAP을 적용하였다.

분석 대상:

- Global Feature Importance
- Feature 영향 방향
- 개별 예측 설명

전세 모델에서는 임대면적이 가장 중요한 변수로 나타났으며,
자치구, 건축연식, 법정동, 시간추세 순으로 높은 중요도를 보였다.

월세 모델에서도 임대면적이 가장 중요했고,
보증금이 두 번째로 높은 중요도를 보였다.

임대면적이 증가할수록 전세와 월세 예측값을 높이는 방향,
건축연식이 증가할수록 예측값을 낮추는 방향이 관찰되었다.

월세 모델에서는 보증금이 증가할수록
월세 예측값을 낮추는 전반적인 음의 관계가 확인되었다.

SHAP은 모델의 예측 기여도를 설명하는 방법이며
직접적인 인과관계를 의미하지 않는다.

---

# 13. SQL

정제된 데이터를 PostgreSQL에 적재한다.

SQL 분석에서 사용할 요소:

- SELECT
- WHERE
- GROUP BY
- JOIN
- CASE WHEN
- CTE
- Window Function

Python에서 모든 분석을 처리하지 않고
SQL 분석 역량도 포트폴리오에 포함한다.

---

# 14. 프로젝트 디렉터리

현재 목표 구조:

seoul-rental-analysis/
│
├── CLAUDE.md
├── AGENTS.md
├── README.md
├── requirements.txt
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
├── src/
│   ├── data_loader.py
│   ├── preprocessing.py
│   ├── features.py
│   ├── train.py
│   └── evaluate.py
│
├── sql/
│   ├── schema.sql
│   └── analysis_queries.sql
│
├── models/
│
├── reports/
│   ├── figures/
│   └── final_report.md
│
├── docs/
│   ├── PROJECT_GUIDE.md
│   └── data_dictionary.md
│
└── dashboard/
    ├── src/
    └── public/
        └── data/

---

# 15. Dashboard Architecture

Dashboard는 분석이 완료된 후 개발한다.

구조:

Raw Data

→ Python / Pandas

→ Cleaning

→ EDA / Statistics / ML

→ Aggregated Dashboard Data

→ JSON

→ React Dashboard

React가 원본 CSV를 직접 처리하지 않는다.

대규모 원본 데이터를 브라우저로 전달하지 않는다.

Python에서 집계한 작은 JSON 파일만 Dashboard에 전달한다.

---

# 16. Dashboard 기술

Frontend:

- React
- Vite

Charts:

- Recharts 또는 Plotly

Deployment:

- Vercel 우선 고려

Backend:

없음

Database:

Dashboard에서는 사용하지 않음

분석 결과는 정적 JSON으로 제공한다.

---

# 17. Dashboard 화면 구성

## Overview

- 분석 거래 건수
- 분석기간
- 전세 거래 건수
- 월세 거래 건수
- 분석 자치구 수

## Market Trend

- 연도/월별 가격 변화
- 전세/월세 필터
- 자치구 필터
- 면적 구간 필터

## District Analysis

- 자치구별 가격 비교
- 거래량
- 가격 중앙값

## Area Analysis

- 임대면적과 가격 관계
- 면적 구간별 가격

## Building Age Analysis

- 건물 연식과 가격 관계

## Model Analysis

- 모델별 MAE
- RMSE
- R²
- SHAP Feature Importance

---

# 18. Dashboard 데이터 예시

dashboard/public/data/

- overview.json
- district_summary.json
- monthly_trend.json
- area_price.json
- building_age.json
- model_metrics.json
- feature_importance.json

Dashboard에는 계산 로직을 최소화한다.

분석과 계산은 Python이 담당한다.

---

# 19. 작업 순서

반드시 다음 순서를 따른다.

Phase 1
환경 구성

Phase 2
데이터 이해

Phase 3
데이터 품질 검사

Phase 4
데이터 Cleaning

Phase 5
2023~2025 데이터 통합

Phase 6
EDA

Phase 7
통계 분석

Phase 8
Feature Engineering

Phase 9
Machine Learning

Phase 10
SHAP

Phase 11
SQL 분석

Phase 12
README 및 분석 보고서

Phase 13
Dashboard용 JSON 생성

Phase 14
React Dashboard

Phase 15
Vercel 배포

Phase 16
Portfolio 연결

---

# 20. 현재 진행 상황

현재:

Phase 11 - SQL 분석 준비 단계

완료:

- Python 3.12 가상환경 구성
- 데이터 분석 패키지 설치
- 2023~2025 서울 전월세 원본 데이터 확보
- 연도별 CSV 인코딩 확인
  - 2023: UTF-8
  - 2024: CP949
  - 2025: CP949
- 원본 데이터 구조 및 23개 컬럼 확인
- 서울 아파트 데이터만 필터링
- 2023~2025 아파트 데이터 통합
- 핵심 결측치 및 이상값 검사
- 고가 전세/월세 거래 검토
- 지하층 데이터 검토
- 중복 후보 검토
- 원본 전체 컬럼 기준 완전 중복 0건 확인
- 핵심 식별정보 결측 행 제거
- 월세이면서 임대료가 0인 데이터 품질 플래그 생성
- 건축년도 결측 데이터 플래그 생성
- 계약일 datetime 변환
- 계약연도 / 계약월 Feature 생성
- 평수 Feature 생성
- 단위면적당 보증금 Feature 생성
- 건축연식 Feature 생성
- 입주 전 계약 데이터 확인 및 플래그 생성
- 음수 건축연식을 0년으로 보정하고 원본 연식값 별도 보존
- 신규계약구분 결측값을 `미상`으로 처리
- 정제 데이터 저장
- EDA 완료
- 거래량, 전세가격, 지역, 면적, 건축연식, 월세 관계 분석 완료
- H1~H5 통계검정 완료
- 전세/월세 Feature Engineering 완료
- 2023~2024 Train / 2025 Test 시간 분할 완료
- Median Baseline, Ridge Regression, Random Forest, XGBoost 모델 비교 완료
- 전세/월세 최종 XGBoost 모델 선정
- 전세/월세 SHAP 분석 완료
- `04_statistical_analysis.ipynb` 완료
- `05_feature_engineering.ipynb` 완료
- `06_modeling.ipynb` 완료
- `07_model_explainability.ipynb` 완료


## 현재 정제 데이터

원본 서울 아파트 데이터:

881,805건

핵심 정보 결측 제거 후:

881,794건

EDA 분석 대상:

실제 계약일 기준
2023-01-01 ~ 2025-12-31

875,925건


## 데이터 Cleaning 주요 기준

다음 데이터는 유지한다.

- 초고가 전세 거래
- 초고가 월세 거래
- 지하층(-1, -2 등)
- 건축년도 결측 거래
- 계약기간 결측 거래
- 신규계약구분 결측 거래

명백한 오류라는 근거 없이 가격 Outlier를 임의 제거하지 않는다.

월세이지만 임대료가 0인 74건은 원본에서는 유지하되,
월세 가격 분석 및 모델링에서는 제외한다.

건축년도 결측 데이터는 유지하되,
건축연식이 필요한 분석 및 모델링에서는 제외한다.


## 시계열 데이터 처리 기준

서울시 연도별 원본 파일은 실제 계약연도가 아니라
접수년도를 기준으로 구성되어 있다.

따라서 모든 시계열 분석은:

`contract_date`

를 기준으로 수행한다.

접수년도는 원본 데이터 확인 및 신고 시점 분석 용도로만 사용한다.

2023~2025 파일에는 일부 2022 및 2026 계약 데이터가 포함되어 있어
EDA에서는 실제 계약일 기준 2023~2025 데이터만 사용한다.


## EDA 주요 결과

### 1. 전세가격 변화

서울 아파트 전세보증금 중앙값:

- 2023: 46,000만원
- 2024: 50,000만원
- 2025: 52,500만원

단위면적당 전세보증금 중앙값:

- 2023: 644.2만원/㎡
- 2024: 706.7만원/㎡
- 2025: 727.7만원/㎡

2023~2025년 동안 전세가격 수준이 상승하는 패턴이 관찰되었다.


### 2. 자치구별 전세가격

2025년 단위면적당 전세보증금 중앙값은
서초구, 강남구, 성동구, 중구, 용산구 등에서 높은 수준을 보였다.

2023년과 2025년을 비교한 결과
서울 25개 자치구 모두 단위면적당 전세보증금 중앙값이 상승하였다.


### 3. 면적 통제 분석

60~85㎡ 아파트만 별도로 비교한 결과에도
25개 자치구 모두 2023 대비 2025 전세보증금 중앙값이 상승하였다.

따라서 전체 가격 상승 패턴은
단순히 대형 평형 거래 비중 증가만으로 설명되지는 않았다.


### 4. 건축연식과 전세가격

2025년 단위면적당 전세보증금 중앙값:

- 0~4년: 988.5만원/㎡
- 5~9년: 971.5만원/㎡
- 10~19년: 776.8만원/㎡
- 20~29년: 673.7만원/㎡
- 30년 이상: 592.7만원/㎡

동일 자치구와 60~85㎡ 조건으로 제한한 분석에서도
서울 25개 자치구 모두 신축(0~9년)의 가격이
구축(20년 이상)보다 높게 나타났다.

다만 법정동, 입지, 브랜드, 학군 등 미통제 변수가 있으므로
건축연식의 인과효과로 해석하지 않는다.


### 5. 보증금과 월세 관계

전체 월세 데이터에서는
보증금과 월세 사이의 Spearman 상관계수가 약 +0.17로 나타났다.

하지만 60~85㎡로 면적을 제한하고
자치구별로 분석한 결과
서울 25개 자치구 모두 음의 상관관계를 보였다.

자치구별 Spearman 상관계수 범위는 대략:

- -0.70 ~ -0.38

수준이었다.

이는 전체 데이터에서는 지역별 주택 가격 수준의 차이가 섞여
보증금과 월세의 관계가 가려질 수 있으며,
유사한 지역과 면적 조건에서는
보증금 증가와 월세 감소 사이의 trade-off가 관찰됨을 보여준다.


### 6. 가격 분포

전세보증금:

- 중앙값: 50,000만원
- 95 percentile: 120,000만원
- 99 percentile: 180,000만원

월세:

- 중앙값: 75만원
- 95 percentile: 317만원
- 99 percentile: 550만원

가격 분포는 오른쪽 꼬리가 긴 형태를 보이므로
평균보다 중앙값을 주요 대표값으로 사용한다.


## 통계분석 주요 결과

### H1. 자치구별 전세가격 차이

Kruskal-Wallis 검정 결과:

- H statistic: 157,921.5082
- p-value: < 0.001
- Epsilon squared: 0.3124

서울 25개 자치구의 단위면적당 전세가격 분포에는
통계적으로 유의한 차이가 존재하였으며,
효과 크기도 큰 수준으로 확인되었다.


### H2. 건축연식과 전세가격

Spearman 순위상관분석 결과:

- Spearman rho: -0.4143
- p-value: < 0.001

건축연식이 증가할수록 단위면적당 전세가격이 낮아지는
중간 수준의 음의 관계가 관찰되었다.


### H3. 전용면적과 전세가격

상관분석 결과:

- Pearson r: 0.6088
- Spearman rho: 0.6373
- p-value: < 0.001

전용면적이 증가할수록 전세보증금도 증가하는
비교적 강한 양의 관계가 나타났다.


### H4. 다른 조건을 통제한 건축연식과 전세가격

다중회귀분석 결과:

- building_age coefficient: -0.011911
- p-value: < 0.001
- R-squared: 0.6287

지역, 전용면적, 층, 계약연도를 통제한 후에도
건축연식은 전세가격과 유의한 음의 관계를 보였다.

건축연식이 1년 증가할 때 전세보증금은 평균적으로
약 1.18% 낮아지는 관계가 관찰되었다.


### H5. 보증금과 월세의 관계

다중회귀분석 결과:

- log_deposit coefficient: -0.2571
- p-value: < 0.001
- R-squared: 0.3871

자치구, 전용면적, 건축연식, 층, 계약연도를 통제한 후
보증금이 1% 증가하면 월세가 평균적으로 약 0.257% 낮아지는
관계가 관찰되었다.


## Feature Engineering 및 데이터 분할

전세 모델:

- Train: 266,848건
- Test: 238,570건
- Train 기간: 2023~2024
- Test 기간: 2025
- 학습 Target: log(전세보증금)

월세 모델:

- Train: 185,103건
- Test: 183,778건
- Train 기간: 2023~2024
- Test 기간: 2025
- 학습 Target: log(월세)

Random Split을 사용하지 않고 계약일 기준으로 분할하여
미래 데이터가 학습에 포함되는 데이터 누수를 방지하였다.


## 모델링 주요 결과

Median Baseline, Ridge Regression, Random Forest, XGBoost를
동일한 2025년 Test 데이터에서 비교하였다.

전세 최종 XGBoost:

- MAE: 9,074.27만원
- RMSE: 14,690.37만원
- R²: 0.8403
- Median Baseline 대비 MAE 개선율: 62.84%

월세 최종 XGBoost:

- MAE: 29.32만원
- RMSE: 57.68만원
- R²: 0.7885
- Median Baseline 대비 MAE 개선율: 60.98%

전세와 월세 모두 XGBoost가 가장 낮은 MAE와 RMSE,
가장 높은 R²를 기록하여 최종 모델로 선정되었다.


## SHAP 주요 결과

전세 모델에서는 임대면적이 가장 중요한 변수로 나타났고,
자치구, 건축연식, 법정동, 시간추세 순으로 높은 중요도를 보였다.

월세 모델에서도 임대면적이 가장 중요했으며,
보증금이 두 번째로 높은 중요도를 보였다.

전세와 월세 모델 모두에서 임대면적이 증가할수록
가격 예측을 높이는 방향으로 작용하였고,
건축연식이 증가할수록 가격 예측을 낮추는 패턴이 나타났다.

월세 모델에서는 보증금이 증가할수록
월세가격 예측을 낮추는 전반적인 음의 관계가 확인되었다.

EDA, 통계분석, 머신러닝, SHAP에서
지역별 가격 차이, 건축연식과 가격의 음의 관계,
보증금과 월세의 조건부 음의 관계가 일관되게 확인되었다.

단, 통계분석과 SHAP 결과는 관찰 데이터 및 모델의 예측 기여도를
설명하는 것이며 직접적인 인과관계를 의미하지 않는다.


## 현재 가설 상태

H1.
동일한 면적이라도 자치구에 따라 전세가격 차이가 존재한다.

→ Kruskal-Wallis 검정에서 통계적으로 유의한 차이 확인
→ 효과 크기 Epsilon squared 0.3124
→ H1 지지


H2.
건물 연식이 낮을수록 전세가격이 높다.

→ Spearman rho -0.4143, p-value < 0.001
→ H2 지지


H3.
전용면적이 증가할수록 전세가격이 증가한다.

→ Pearson r 0.6088, Spearman rho 0.6373
→ p-value < 0.001
→ H3 지지


H4.
지역과 면적을 통제해도 건물 연식은 가격에 영향을 준다.

→ 다른 조건을 통제한 다중회귀에서 유의한 음의 관계 확인
→ 건축연식 1년 증가 시 전세보증금 약 1.18% 감소 관계
→ H4 지지


H5.
월세 계약에서는 보증금이 증가할수록 월세가 감소하는 경향이 있다.

→ 전체 데이터에서는 약한 양의 상관관계
→ 지역과 면적을 통제한 분석에서는 25개 자치구 모두 음의 상관관계
→ 다중회귀에서 보증금 1% 증가 시 월세 약 0.257% 감소 관계
→ SHAP에서도 전반적인 음의 방향 확인
→ H5 지지


## 완료된 Notebook

- `01_data_understanding.ipynb`
- `02_data_cleaning.ipynb`
- `03_eda.ipynb`
- `04_statistical_analysis.ipynb`
- `05_feature_engineering.ipynb`
- `06_modeling.ipynb`
- `07_model_explainability.ipynb`


## 다음 작업

다음 단계:

Phase 11 - SQL Analysis

진행 예정:

1. 정제 데이터를 PostgreSQL에 적재할 Schema 정의
2. 자치구별·연도별 전월세 거래량 및 가격 집계
3. CTE와 Window Function을 활용한 순위 및 증감률 분석
4. Python 분석 결과와 SQL 집계 결과 검증

이후 작업:

1. README 및 최종 분석 보고서 작성
2. Dashboard용 집계 JSON 생성
3. React Dashboard 개발
4. Vercel 배포
5. Portfolio 연결

최종 문서와 Dashboard에서도 인과관계로 확인되지 않은 결과는
`영향을 준다`라고 단정하지 않고
`관련이 있다`, `차이가 관찰되었다`,
`예측을 높이거나 낮추는 방향으로 작용하였다`와 같이 기술한다.

---

# 21. 데이터 처리 원칙

data/raw

절대 수정하지 않는다.

data/processed

전처리 결과만 저장한다.

분석 중 이상값을 발견해도
근거 없이 삭제하지 않는다.

삭제 기준은 반드시 문서화한다.

예:

- 명백한 입력 오류
- 논리적으로 불가능한 값
- 분석 목적에 부합하지 않는 데이터

고가 거래라는 이유만으로 Outlier를 제거하지 않는다.

---

# 22. Notebook 작성 원칙

Notebook은 다음 구조를 따른다.

1. 분석 목적
2. 데이터 로드
3. 데이터 확인
4. 분석
5. 시각화
6. 결과
7. 해석

그래프를 많이 만드는 것이 목적이 아니다.

항상:

질문
→ 분석
→ 결과
→ 해석

구조를 따른다.

---

# 23. 프로젝트 범위에서 제외

현재 프로젝트에 다음 기능을 추가하지 않는다.

- 회원가입
- 로그인
- Spring Boot
- Node.js Backend
- FastAPI Backend
- 실시간 API
- RAG
- LLM
- Fine-tuning
- Deep Learning

이 프로젝트는 데이터 분석 프로젝트이다.

Dashboard를 웹 애플리케이션 프로젝트로 확장하지 않는다.

---

# 24. Git 규칙

Git에 포함:

- notebooks
- src
- sql
- reports
- docs
- dashboard
- README
- requirements.txt

Git에서 제외:

- .venv
- data/raw
- data/processed
- 대용량 model binary
- Python cache

---

# 25. 최종 Portfolio 구성

Portfolio Project Card:

Seoul Rental Market Analysis

서울 전월세 실거래 데이터를 활용하여
가격 결정요인을 분석하고
전세가격 예측 모델을 구축한 데이터 분석 프로젝트.

Tech:

Python
SQL
Pandas
Scikit-learn
XGBoost
SHAP

Links:

- View Dashboard
- GitHub

Dashboard는 비개발자가 결과를 확인하는 용도이며
GitHub는 분석 과정과 코드를 검토하는 용도이다.
