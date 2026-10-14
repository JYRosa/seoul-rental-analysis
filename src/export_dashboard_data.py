from pathlib import Path
import json
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]

DATA_PATH = (
    ROOT
    / "data"
    / "processed"
    / "seoul_apartment_rental_2023_2025_clean.csv"
)

OUTPUT_DIR = ROOT / "dashboard" / "public" / "data"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_PATH = OUTPUT_DIR / "dashboard_data.json"


# ============================================================
# 1. Load
# ============================================================

df = pd.read_csv(
    DATA_PATH,
    parse_dates=["contract_date"]
)

analysis_df = df[
    df["contract_date"].between(
        "2023-01-01",
        "2025-12-31"
    )
].copy()


# ============================================================
# 2. Summary KPI
# ============================================================

summary = {
    "clean_rows": int(len(df)),
    "analysis_rows": int(len(analysis_df)),
    "district_count": int(
        analysis_df["자치구명"].nunique()
    ),

    "jeonse_model": {
        "mae": 9074.27,
        "rmse": 14690.37,
        "r2": 0.8403
    },

    "monthly_model": {
        "mae": 29.32,
        "rmse": 57.68,
        "r2": 0.7885
    }
}


# ============================================================
# 3. Yearly Jeonse Trend
# ============================================================

jeonse = analysis_df[
    analysis_df["전월세구분"] == "전세"
].copy()

yearly_jeonse = (
    jeonse
    .groupby("contract_year")
    .agg(
        contract_count=("보증금(만원)", "size"),
        median_deposit=("보증금(만원)", "median"),
        median_deposit_per_m2=("deposit_per_m2", "median")
    )
    .reset_index()
)

yearly_jeonse = [
    {
        "year": int(row.contract_year),
        "contract_count": int(row.contract_count),
        "median_deposit": float(row.median_deposit),
        "median_deposit_per_m2": round(
            float(row.median_deposit_per_m2),
            2
        )
    }
    for row in yearly_jeonse.itertuples()
]


# ============================================================
# 4. 2025 District Price
# ============================================================

district_2025 = (
    jeonse[
        jeonse["contract_year"] == 2025
    ]
    .groupby("자치구명")
    .agg(
        contract_count=("deposit_per_m2", "size"),
        median_deposit_per_m2=("deposit_per_m2", "median")
    )
    .reset_index()
    .sort_values(
        "median_deposit_per_m2",
        ascending=False
    )
)

district_2025 = [
    {
        "district": row.자치구명,
        "contract_count": int(row.contract_count),
        "median_deposit_per_m2": round(
            float(row.median_deposit_per_m2),
            2
        )
    }
    for row in district_2025.itertuples()
]


# ============================================================
# 5. Building Age Group
# ============================================================

age_df = jeonse[
    (jeonse["contract_year"] == 2025)
    & (jeonse["has_build_year"] == True)
].copy()

age_df["age_group"] = pd.cut(
    age_df["building_age"],
    bins=[
        -1,
        4,
        9,
        19,
        29,
        float("inf")
    ],
    labels=[
        "0~4년",
        "5~9년",
        "10~19년",
        "20~29년",
        "30년 이상"
    ]
)

age_price = (
    age_df
    .groupby(
        "age_group",
        observed=False
    )
    .agg(
        contract_count=("deposit_per_m2", "size"),
        median_deposit=("보증금(만원)", "median"),
        median_deposit_per_m2=("deposit_per_m2", "median")
    )
    .reset_index()
)

age_price = [
    {
        "age_group": str(row.age_group),
        "contract_count": int(row.contract_count),
        "median_deposit": float(row.median_deposit),
        "median_deposit_per_m2": round(
            float(row.median_deposit_per_m2),
            2
        )
    }
    for row in age_price.itertuples()
]


# ============================================================
# 6. Model Performance
# ============================================================

model_performance = {
    "jeonse": [
        {
            "model": "Median Baseline",
            "mae": 24418.73,
            "rmse": 38372.88,
            "r2": -0.0898
        },
        {
            "model": "Ridge Regression",
            "mae": 11750.89,
            "rmse": 21799.32,
            "r2": 0.6483
        },
        {
            "model": "Random Forest",
            "mae": 10085.60,
            "rmse": 16266.84,
            "r2": 0.8042
        },
        {
            "model": "XGBoost",
            "mae": 9074.27,
            "rmse": 14690.37,
            "r2": 0.8403
        }
    ],

    "monthly": [
        {
            "model": "Median Baseline",
            "mae": 75.15,
            "rmse": 131.83,
            "r2": -0.1049
        },
        {
            "model": "Ridge Regression",
            "mae": 57.81,
            "rmse": 169.70,
            "r2": -0.8308
        },
        {
            "model": "Random Forest",
            "mae": 29.88,
            "rmse": 59.86,
            "r2": 0.7722
        },
        {
            "model": "XGBoost",
            "mae": 29.32,
            "rmse": 57.68,
            "r2": 0.7885
        }
    ]
}


# ============================================================
# 7. Export
# ============================================================

dashboard_data = {
    "summary": summary,
    "yearly_jeonse": yearly_jeonse,
    "district_price_2025": district_2025,
    "building_age_price_2025": age_price,
    "model_performance": model_performance
}

with open(
    OUTPUT_PATH,
    "w",
    encoding="utf-8"
) as f:
    json.dump(
        dashboard_data,
        f,
        ensure_ascii=False,
        indent=2
    )


print("Dashboard JSON 생성 완료")
print(OUTPUT_PATH)