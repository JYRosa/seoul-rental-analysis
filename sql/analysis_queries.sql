-- ============================================================
-- Seoul Rental Market Analysis
-- PostgreSQL Analysis Queries
--
-- Analysis period:
-- 2023-01-01 ~ 2025-12-31 based on contract_date
--
-- Main SQL techniques:
-- GROUP BY / HAVING / CASE WHEN / CTE
-- PERCENTILE_CONT / RANK / LAG / PARTITION BY
-- CORR / NTILE
-- ============================================================


-- ============================================================
-- Query 1
-- 연도별 자치구 단위면적당 전세가격 TOP 5
--
-- Purpose:
-- 각 연도별로 전세 단위면적당 가격 중앙값이 높은
-- 자치구를 확인한다.
-- ============================================================

WITH district_yearly AS (
    SELECT
        contract_year,
        district_name,
        COUNT(*) AS contract_count,

        PERCENTILE_CONT(0.5)
            WITHIN GROUP (
                ORDER BY deposit_per_m2
            ) AS median_deposit_per_m2

    FROM rental_contracts

    WHERE rental_type = '전세'
      AND contract_date BETWEEN DATE '2023-01-01'
                            AND DATE '2025-12-31'

    GROUP BY
        contract_year,
        district_name
),
ranked AS (
    SELECT
        contract_year,
        district_name,
        contract_count,
        median_deposit_per_m2,

        RANK() OVER (
            PARTITION BY contract_year
            ORDER BY median_deposit_per_m2 DESC
        ) AS price_rank

    FROM district_yearly
)
SELECT
    contract_year,
    price_rank,
    district_name,
    contract_count,

    ROUND(
        median_deposit_per_m2::numeric,
        2
    ) AS median_deposit_per_m2

FROM ranked

WHERE price_rank <= 5

ORDER BY
    contract_year,
    price_rank,
    district_name;



-- ============================================================
-- Query 2
-- 자치구별 전년 대비 전세가격 변화율
--
-- Purpose:
-- LAG()를 이용하여 각 자치구의 전년도 가격을 가져오고
-- 전년 대비 가격 변화율을 계산한다.
-- ============================================================

WITH yearly_price AS (
    SELECT
        contract_year,
        district_name,
        COUNT(*) AS contract_count,

        PERCENTILE_CONT(0.5)
            WITHIN GROUP (
                ORDER BY deposit_per_m2
            ) AS median_deposit_per_m2

    FROM rental_contracts

    WHERE rental_type = '전세'
      AND contract_date BETWEEN DATE '2023-01-01'
                            AND DATE '2025-12-31'

    GROUP BY
        contract_year,
        district_name
),
price_with_previous AS (
    SELECT
        contract_year,
        district_name,
        contract_count,
        median_deposit_per_m2,

        LAG(median_deposit_per_m2) OVER (
            PARTITION BY district_name
            ORDER BY contract_year
        ) AS previous_year_price

    FROM yearly_price
)
SELECT
    contract_year,
    district_name,

    ROUND(
        previous_year_price::numeric,
        2
    ) AS previous_year_price,

    ROUND(
        median_deposit_per_m2::numeric,
        2
    ) AS current_year_price,

    ROUND(
        (
            (
                median_deposit_per_m2
                - previous_year_price
            )
            / previous_year_price
            * 100
        )::numeric,
        2
    ) AS yoy_change_pct

FROM price_with_previous

WHERE previous_year_price IS NOT NULL

ORDER BY
    contract_year,
    yoy_change_pct DESC;



-- ============================================================
-- Query 3
-- 연도별 전세가격 상승률 TOP 5
--
-- Purpose:
-- LAG()로 계산한 전년 대비 변화율에 다시 RANK()를 적용하여
-- 상승률이 높은 지역을 찾는다.
-- ============================================================

WITH yearly_price AS (
    SELECT
        contract_year,
        district_name,

        PERCENTILE_CONT(0.5)
            WITHIN GROUP (
                ORDER BY deposit_per_m2
            ) AS median_deposit_per_m2

    FROM rental_contracts

    WHERE rental_type = '전세'
      AND contract_date BETWEEN DATE '2023-01-01'
                            AND DATE '2025-12-31'

    GROUP BY
        contract_year,
        district_name
),
price_change AS (
    SELECT
        contract_year,
        district_name,
        median_deposit_per_m2,

        LAG(median_deposit_per_m2) OVER (
            PARTITION BY district_name
            ORDER BY contract_year
        ) AS previous_year_price

    FROM yearly_price
),
growth AS (
    SELECT
        contract_year,
        district_name,
        median_deposit_per_m2,
        previous_year_price,

        (
            median_deposit_per_m2
            - previous_year_price
        )
        / previous_year_price
        * 100 AS yoy_change_pct

    FROM price_change

    WHERE previous_year_price IS NOT NULL
),
ranked AS (
    SELECT
        *,

        RANK() OVER (
            PARTITION BY contract_year
            ORDER BY yoy_change_pct DESC
        ) AS growth_rank

    FROM growth
)
SELECT
    contract_year,
    growth_rank,
    district_name,

    ROUND(
        previous_year_price::numeric,
        2
    ) AS previous_year_price,

    ROUND(
        median_deposit_per_m2::numeric,
        2
    ) AS current_year_price,

    ROUND(
        yoy_change_pct::numeric,
        2
    ) AS yoy_change_pct

FROM ranked

WHERE growth_rank <= 5

ORDER BY
    contract_year,
    growth_rank;



-- ============================================================
-- Query 4
-- 자치구 내부 법정동 전세가격 TOP 3
--
-- Purpose:
-- 동일한 자치구 안에서도 법정동에 따라
-- 전세가격 수준이 얼마나 다른지 확인한다.
--
-- 최소 50건 이상의 거래가 존재하는 법정동만 사용한다.
-- ============================================================

WITH dong_price AS (
    SELECT
        district_name,
        dong_name,
        COUNT(*) AS contract_count,

        PERCENTILE_CONT(0.5)
            WITHIN GROUP (
                ORDER BY deposit_per_m2
            ) AS median_deposit_per_m2

    FROM rental_contracts

    WHERE rental_type = '전세'
      AND contract_date BETWEEN DATE '2025-01-01'
                            AND DATE '2025-12-31'

    GROUP BY
        district_name,
        dong_name

    HAVING COUNT(*) >= 50
),
ranked AS (
    SELECT
        district_name,
        dong_name,
        contract_count,
        median_deposit_per_m2,

        RANK() OVER (
            PARTITION BY district_name
            ORDER BY median_deposit_per_m2 DESC
        ) AS dong_rank

    FROM dong_price
)
SELECT
    district_name,
    dong_rank,
    dong_name,
    contract_count,

    ROUND(
        median_deposit_per_m2::numeric,
        2
    ) AS median_deposit_per_m2

FROM ranked

WHERE dong_rank <= 3

ORDER BY
    district_name,
    dong_rank;



-- ============================================================
-- Query 5
-- 면적 구간별 전세가격
--
-- Purpose:
-- CASE WHEN을 이용해 연속형 면적 변수를 구간화하고
-- 총 전세보증금과 단위면적 가격을 비교한다.
-- ============================================================

WITH area_grouped AS (
    SELECT
        CASE
            WHEN area_m2 < 40
                THEN '01. ~40㎡'

            WHEN area_m2 < 60
                THEN '02. 40~60㎡'

            WHEN area_m2 < 85
                THEN '03. 60~85㎡'

            WHEN area_m2 < 102
                THEN '04. 85~102㎡'

            ELSE '05. 102㎡~'
        END AS area_group,

        deposit_10k,
        deposit_per_m2

    FROM rental_contracts

    WHERE rental_type = '전세'
      AND contract_date BETWEEN DATE '2025-01-01'
                            AND DATE '2025-12-31'
)
SELECT
    area_group,
    COUNT(*) AS contract_count,

    ROUND(
        PERCENTILE_CONT(0.5)
            WITHIN GROUP (
                ORDER BY deposit_10k
            )::numeric,
        0
    ) AS median_deposit_10k,

    ROUND(
        PERCENTILE_CONT(0.5)
            WITHIN GROUP (
                ORDER BY deposit_per_m2
            )::numeric,
        2
    ) AS median_deposit_per_m2

FROM area_grouped

GROUP BY area_group

ORDER BY area_group;



-- ============================================================
-- Query 6
-- 건축연식 구간별 전세가격
--
-- Purpose:
-- 신축과 구축 아파트 사이의
-- 전세가격 구조 차이를 비교한다.
-- ============================================================

WITH age_grouped AS (
    SELECT
        CASE
            WHEN building_age < 5
                THEN '01. 0~4년'

            WHEN building_age < 10
                THEN '02. 5~9년'

            WHEN building_age < 20
                THEN '03. 10~19년'

            WHEN building_age < 30
                THEN '04. 20~29년'

            ELSE '05. 30년 이상'
        END AS age_group,

        deposit_10k,
        deposit_per_m2

    FROM rental_contracts

    WHERE rental_type = '전세'
      AND has_build_year = TRUE
      AND contract_date BETWEEN DATE '2025-01-01'
                            AND DATE '2025-12-31'
)
SELECT
    age_group,
    COUNT(*) AS contract_count,

    ROUND(
        PERCENTILE_CONT(0.5)
            WITHIN GROUP (
                ORDER BY deposit_10k
            )::numeric,
        0
    ) AS median_deposit_10k,

    ROUND(
        PERCENTILE_CONT(0.5)
            WITHIN GROUP (
                ORDER BY deposit_per_m2
            )::numeric,
        2
    ) AS median_deposit_per_m2

FROM age_grouped

GROUP BY age_group

ORDER BY age_group;



-- ============================================================
-- Query 7
-- 보증금 구간별 월세 및 면적 비교
--
-- Purpose:
-- 보증금 구간에 따라 월세와 주택 면적이
-- 어떻게 달라지는지 확인한다.
--
-- 단순 보증금-월세 관계가 주택 크기에 의해
-- 왜곡될 수 있는지 확인하는 탐색 분석이다.
-- ============================================================

WITH monthly_grouped AS (
    SELECT
        CASE
            WHEN deposit_10k < 5000
                THEN '01. 5천만원 미만'

            WHEN deposit_10k < 10000
                THEN '02. 5천~1억원'

            WHEN deposit_10k < 20000
                THEN '03. 1~2억원'

            WHEN deposit_10k < 30000
                THEN '04. 2~3억원'

            WHEN deposit_10k < 50000
                THEN '05. 3~5억원'

            WHEN deposit_10k < 100000
                THEN '06. 5~10억원'

            ELSE '07. 10억원 이상'
        END AS deposit_group,

        monthly_rent_10k,
        area_m2

    FROM rental_contracts

    WHERE rental_type = '월세'
      AND valid_monthly_rent = TRUE
      AND monthly_rent_10k > 0
      AND contract_date BETWEEN DATE '2025-01-01'
                            AND DATE '2025-12-31'
)
SELECT
    deposit_group,
    COUNT(*) AS contract_count,

    ROUND(
        PERCENTILE_CONT(0.5)
            WITHIN GROUP (
                ORDER BY monthly_rent_10k
            )::numeric,
        0
    ) AS median_monthly_rent_10k,

    ROUND(
        PERCENTILE_CONT(0.5)
            WITHIN GROUP (
                ORDER BY area_m2
            )::numeric,
        1
    ) AS median_area_m2

FROM monthly_grouped

GROUP BY deposit_group

ORDER BY deposit_group;



-- ============================================================
-- Query 8
-- 동일 면적대에서 보증금 구간별 월세 비교
--
-- Purpose:
-- 면적 영향을 줄이기 위해 60~85㎡ 아파트만 대상으로
-- 보증금과 월세의 관계를 다시 확인한다.
-- ============================================================

WITH monthly_grouped AS (
    SELECT
        CASE
            WHEN deposit_10k < 5000
                THEN '01. 5천만원 미만'

            WHEN deposit_10k < 10000
                THEN '02. 5천~1억원'

            WHEN deposit_10k < 20000
                THEN '03. 1~2억원'

            WHEN deposit_10k < 30000
                THEN '04. 2~3억원'

            WHEN deposit_10k < 50000
                THEN '05. 3~5억원'

            WHEN deposit_10k < 100000
                THEN '06. 5~10억원'

            ELSE '07. 10억원 이상'
        END AS deposit_group,

        deposit_10k,
        monthly_rent_10k,
        area_m2

    FROM rental_contracts

    WHERE rental_type = '월세'
      AND valid_monthly_rent = TRUE
      AND monthly_rent_10k > 0

      AND area_m2 >= 60
      AND area_m2 < 85

      AND contract_date BETWEEN DATE '2025-01-01'
                            AND DATE '2025-12-31'
)
SELECT
    deposit_group,
    COUNT(*) AS contract_count,

    ROUND(
        PERCENTILE_CONT(0.5)
            WITHIN GROUP (
                ORDER BY deposit_10k
            )::numeric,
        0
    ) AS median_deposit_10k,

    ROUND(
        PERCENTILE_CONT(0.5)
            WITHIN GROUP (
                ORDER BY monthly_rent_10k
            )::numeric,
        0
    ) AS median_monthly_rent_10k,

    ROUND(
        PERCENTILE_CONT(0.5)
            WITHIN GROUP (
                ORDER BY area_m2
            )::numeric,
        1
    ) AS median_area_m2

FROM monthly_grouped

GROUP BY deposit_group

ORDER BY deposit_group;



-- ============================================================
-- Query 9
-- 자치구별 보증금-월세 상관관계
--
-- Purpose:
-- 60~85㎡ 아파트로 면적을 제한하고
-- 자치구별로 보증금과 월세의 Pearson 상관계수를 계산한다.
--
-- 전체 집계에서는 가려질 수 있는
-- 보증금-월세 교환관계를 확인한다.
-- ============================================================

WITH district_monthly AS (
    SELECT
        district_name,
        deposit_10k,
        monthly_rent_10k

    FROM rental_contracts

    WHERE rental_type = '월세'
      AND valid_monthly_rent = TRUE

      AND monthly_rent_10k > 0
      AND deposit_10k > 0

      AND area_m2 >= 60
      AND area_m2 < 85

      AND contract_date BETWEEN DATE '2025-01-01'
                            AND DATE '2025-12-31'
)
SELECT
    district_name,
    COUNT(*) AS contract_count,

    ROUND(
        CORR(
            deposit_10k,
            monthly_rent_10k
        )::numeric,
        4
    ) AS deposit_rent_corr

FROM district_monthly

GROUP BY district_name

HAVING COUNT(*) >= 100

ORDER BY deposit_rent_corr;



-- ============================================================
-- Query 10
-- 자치구 전세시장 유형 분류
--
-- Purpose:
-- 2025년 가격 수준과 전년 대비 상승률을 함께 고려하여
-- 자치구를 시장 특성별로 분류한다.
--
-- NTILE(4)를 이용해 가격 및 상승률을
-- 각각 상위 25% 그룹으로 구분한다.
-- ============================================================

WITH yearly_price AS (
    SELECT
        contract_year,
        district_name,

        PERCENTILE_CONT(0.5)
            WITHIN GROUP (
                ORDER BY deposit_per_m2
            ) AS median_price

    FROM rental_contracts

    WHERE rental_type = '전세'
      AND contract_date BETWEEN DATE '2024-01-01'
                            AND DATE '2025-12-31'

    GROUP BY
        contract_year,
        district_name
),
price_change AS (
    SELECT
        contract_year,
        district_name,
        median_price,

        LAG(median_price) OVER (
            PARTITION BY district_name
            ORDER BY contract_year
        ) AS previous_price

    FROM yearly_price
),
district_metrics AS (
    SELECT
        district_name,
        median_price AS price_2025,

        (
            median_price
            - previous_price
        )
        / previous_price
        * 100 AS yoy_change_pct

    FROM price_change

    WHERE contract_year = 2025
),
classified AS (
    SELECT
        *,

        NTILE(4) OVER (
            ORDER BY price_2025 DESC
        ) AS price_quartile,

        NTILE(4) OVER (
            ORDER BY yoy_change_pct DESC
        ) AS growth_quartile

    FROM district_metrics
)
SELECT
    district_name,

    ROUND(
        price_2025::numeric,
        2
    ) AS price_2025,

    ROUND(
        yoy_change_pct::numeric,
        2
    ) AS yoy_change_pct,

    price_quartile,
    growth_quartile,

    CASE
        WHEN price_quartile = 1
         AND growth_quartile = 1
            THEN '고가·고상승'

        WHEN price_quartile = 1
            THEN '고가'

        WHEN growth_quartile = 1
            THEN '고상승'

        ELSE '일반'
    END AS market_group

FROM classified

ORDER BY price_2025 DESC;