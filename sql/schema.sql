-- ============================================================
-- Seoul Rental Market Analysis
-- PostgreSQL Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS rental_contracts (
    id BIGSERIAL PRIMARY KEY,

    receipt_year SMALLINT,
    district_name VARCHAR(30),
    dong_name VARCHAR(50),

    floor NUMERIC(6, 1),

    contract_day VARCHAR(8),
    rental_type VARCHAR(10),

    area_m2 NUMERIC(10, 3),

    deposit_10k NUMERIC(14, 2),
    monthly_rent_10k NUMERIC(14, 2),

    building_name TEXT,

    build_year NUMERIC(6, 1),
    building_use VARCHAR(30),

    contract_period VARCHAR(50),
    contract_type VARCHAR(20),

    source_file TEXT,

    valid_monthly_rent BOOLEAN,
    has_build_year BOOLEAN,

    contract_date DATE,
    contract_year SMALLINT,
    contract_month SMALLINT,

    building_age NUMERIC(6, 1),

    pyeong NUMERIC(10, 4),
    deposit_per_m2 NUMERIC(14, 4),

    building_age_raw NUMERIC(6, 1),
    pre_completion_contract BOOLEAN
);


-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_rental_contract_date
ON rental_contracts (contract_date);

CREATE INDEX IF NOT EXISTS idx_rental_type
ON rental_contracts (rental_type);

CREATE INDEX IF NOT EXISTS idx_district_name
ON rental_contracts (district_name);

CREATE INDEX IF NOT EXISTS idx_type_date
ON rental_contracts (rental_type, contract_date);

CREATE INDEX IF NOT EXISTS idx_district_dong
ON rental_contracts (district_name, dong_name);

-- ============================================================
-- CSV Import Example
-- Run with psql \copy command.
--
-- Local CSV files are excluded from Git.
-- ============================================================

-- \copy rental_contracts (
--     receipt_year,
--     district_name,
--     dong_name,
--     floor,
--     contract_day,
--     rental_type,
--     area_m2,
--     deposit_10k,
--     monthly_rent_10k,
--     building_name,
--     build_year,
--     building_use,
--     contract_period,
--     contract_type,
--     source_file,
--     valid_monthly_rent,
--     has_build_year,
--     contract_date,
--     contract_year,
--     contract_month,
--     building_age,
--     pyeong,
--     deposit_per_m2,
--     building_age_raw,
--     pre_completion_contract
-- )
-- FROM '<LOCAL_PATH>/seoul_apartment_rental_2023_2025_clean.csv'
-- WITH (
--     FORMAT csv,
--     HEADER true,
--     ENCODING 'UTF8'
-- );