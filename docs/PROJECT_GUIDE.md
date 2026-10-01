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

# 7. Feature Engineering 계획

예정 Feature:

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

필요 시 계절 Feature도 추가한다.

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

사용 예정:

- Descriptive Statistics
- Pearson Correlation
- Spearman Correlation
- ANOVA
- Multiple Linear Regression

모든 방법을 억지로 사용할 필요는 없다.

분석 질문에 필요한 방법만 선택한다.

---

# 11. Machine Learning

전세와 월세를 필요에 따라 별도 모델링한다.

Baseline:

- Linear Regression

Tree Model:

- Random Forest Regressor

Boosting:

- XGBoost

평가 지표:

- MAE
- RMSE
- R²

가능하면 시간 기반 Split을 사용한다.

예:

Train:
2023 ~ 2024

Test:
2025

단순 random split만 사용하는 것보다
실제 미래 가격 예측 상황에 가까운 평가를 우선 검토한다.

---

# 12. Model Explainability

최종 모델에 대해 SHAP을 사용한다.

확인 대상:

- Global Feature Importance
- Feature 영향 방향
- 개별 예측 설명

모델 성능뿐 아니라
"왜 해당 가격을 예측했는가"를 설명하는 것이 목적이다.

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
SQL 분석

Phase 10
Machine Learning

Phase 11
SHAP

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

Phase 3 - 데이터 품질 검사 진행 중

완료:

- Python 3.12 환경
- requirements 설치
- 2023~2025 데이터 확보
- CSV 구조 확인
- 주요 컬럼 확인
- 2023년 아파트 데이터 필터링
- 결측치 확인
- 기본 이상값 검사
- 중복 데이터 확인
- 전세/월세 논리검사

다음 작업:

이상값 후보를 직접 확인한다.

확인 항목:

1. 보증금 상위 10건
2. 월세 상위 10건
3. 월세이면서 임대료가 0인 35건
4. 층이 0 이하인 23건
5. 중복 데이터 103건

이 데이터를 확인한 후
Cleaning Rule을 확정한다.

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