"""
KisanAI - Crop Yield Prediction ML Pipeline
Production-ready training script with model comparison and evaluation.
Run: python train_yield_model.py
Output: models/yield_model.pkl (best model)
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import warnings
import os
from pathlib import Path

from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

warnings.filterwarnings("ignore")

RANDOM_SEED = 42
OUTPUT_DIR = Path("models")
OUTPUT_DIR.mkdir(exist_ok=True)

# ─── 1. Dataset Generation (Production: use Kaggle Crop Yield / ICAR data) ────
def generate_synthetic_dataset(n_samples=5000) -> pd.DataFrame:
    """
    Synthetic dataset based on realistic Indian agricultural parameters.
    Production: Replace with:
    - Kaggle Crop Yield Prediction Dataset
    - ICAR AICRP trial data
    - State agriculture dept data
    """
    np.random.seed(RANDOM_SEED)

    crops = ["rice", "wheat", "cotton", "maize", "tomato", "groundnut", "soybean"]
    states = ["Telangana", "AP", "Maharashtra", "Punjab", "Karnataka", "MP"]

    data = []
    for _ in range(n_samples):
        crop = np.random.choice(crops)
        state = np.random.choice(states)

        # Realistic parameter ranges by crop
        crop_params = {
            "rice":      {"rain": (800, 2000), "temp": (22, 35), "ph": (5.5, 7.0), "fert": (100, 200)},
            "wheat":     {"rain": (400, 1200), "temp": (10, 25), "ph": (6.0, 7.5), "fert": (80, 180)},
            "cotton":    {"rain": (600, 1500), "temp": (25, 40), "ph": (6.0, 8.0), "fert": (80, 160)},
            "maize":     {"rain": (500, 1500), "temp": (20, 35), "ph": (5.8, 7.0), "fert": (120, 220)},
            "tomato":    {"rain": (400, 1200), "temp": (18, 30), "ph": (5.5, 7.0), "fert": (150, 300)},
            "groundnut": {"rain": (500, 1200), "temp": (25, 38), "ph": (5.5, 7.0), "fert": (60, 120)},
            "soybean":   {"rain": (600, 1500), "temp": (20, 32), "ph": (6.0, 7.5), "fert": (80, 150)},
        }
        p = crop_params[crop]

        rainfall = np.random.uniform(*p["rain"])
        temperature = np.random.uniform(*p["temp"])
        soil_ph = np.random.uniform(*p["ph"])
        fertilizer = np.random.uniform(*p["fert"])
        soil_moisture = np.random.uniform(30, 85)
        farm_size = np.random.uniform(0.5, 15)

        # Yield based on agronomy formulas (non-linear)
        base_yields = {"rice": 4.5, "wheat": 3.8, "cotton": 2.2, "maize": 5.0, "tomato": 25.0, "groundnut": 2.0, "soybean": 2.5}
        base = base_yields[crop]

        yield_val = (
            base
            * (1 + 0.0003 * (rainfall - 1000))
            * (1 - 0.002 * abs(temperature - 28))
            * (1 + 0.2 * (1 - abs(soil_ph - 6.5)))
            * (1 + 0.003 * fertilizer)
            * (1 + 0.005 * soil_moisture)
            + np.random.normal(0, base * 0.08)
        )
        yield_val = max(0.3, yield_val)

        data.append({
            "crop": crop,
            "state": state,
            "rainfall_mm": round(rainfall, 1),
            "temperature_c": round(temperature, 1),
            "soil_moisture_pct": round(soil_moisture, 1),
            "soil_ph": round(soil_ph, 2),
            "fertilizer_kg_ha": round(fertilizer, 1),
            "farm_size_ha": round(farm_size, 2),
            "yield_tons_ha": round(yield_val, 3),
        })

    df = pd.DataFrame(data)
    df.to_csv("data/crop_yield_dataset.csv", index=False)
    print(f"✅ Dataset generated: {len(df)} samples")
    print(df.describe())
    return df


# ─── 2. Data Preprocessing ────────────────────────────────────────────────────
def preprocess_data(df: pd.DataFrame):
    print("\n📊 Data Preprocessing...")

    # Missing values
    print(f"Missing values:\n{df.isnull().sum()}")
    df = df.dropna(subset=["yield_tons_ha"])

    # Outlier removal (IQR method)
    Q1 = df["yield_tons_ha"].quantile(0.01)
    Q3 = df["yield_tons_ha"].quantile(0.99)
    df = df[(df["yield_tons_ha"] >= Q1) & (df["yield_tons_ha"] <= Q3)]

    # Encode categorical
    le = LabelEncoder()
    df["crop_encoded"] = le.fit_transform(df["crop"])
    df["state_encoded"] = le.fit_transform(df["state"])

    feature_cols = [
        "rainfall_mm", "temperature_c", "soil_moisture_pct",
        "soil_ph", "fertilizer_kg_ha", "farm_size_ha",
        "crop_encoded", "state_encoded"
    ]
    X = df[feature_cols]
    y = df["yield_tons_ha"]

    print(f"✅ After preprocessing: {len(df)} samples")
    print(f"Feature columns: {feature_cols}")
    return X, y, feature_cols


# ─── 3. Model Training & Comparison ──────────────────────────────────────────
def train_models(X_train, X_test, y_train, y_test):
    print("\n🤖 Training Models...")

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    models = {
        "Linear Regression": LinearRegression(),
        "Ridge Regression": Ridge(alpha=1.0),
        "Random Forest": RandomForestRegressor(
            n_estimators=100, max_depth=12, min_samples_leaf=5,
            n_jobs=-1, random_state=RANDOM_SEED
        ),
        "Gradient Boosting (XGBoost-like)": GradientBoostingRegressor(
            n_estimators=200, learning_rate=0.05, max_depth=5,
            random_state=RANDOM_SEED
        ),
    }

    results = {}
    cv = KFold(n_splits=5, shuffle=True, random_state=RANDOM_SEED)

    for name, model in models.items():
        X_tr = X_train_scaled if "Regression" in name or "Ridge" in name or "Lasso" in name else X_train
        X_te = X_test_scaled if "Regression" in name or "Ridge" in name or "Lasso" in name else X_test

        model.fit(X_tr, y_train)
        y_pred = model.predict(X_te)

        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)

        cv_scores = cross_val_score(model, X_tr, y_train, cv=cv, scoring="r2")

        results[name] = {
            "model": model,
            "RMSE": round(rmse, 4),
            "R2": round(r2, 4),
            "MAE": round(mae, 4),
            "CV_R2_mean": round(cv_scores.mean(), 4),
            "CV_R2_std": round(cv_scores.std(), 4),
            "y_pred": y_pred,
        }
        print(f"  {name:<35} RMSE={rmse:.3f}  R²={r2:.3f}  CV={cv_scores.mean():.3f}±{cv_scores.std():.3f}")

    return results, scaler


# ─── 4. Best Model Selection ──────────────────────────────────────────────────
def select_best_model(results):
    best_name = max(results, key=lambda k: results[k]["R2"])
    best = results[best_name]
    print(f"\n🏆 Best Model: {best_name}")
    print(f"   R² = {best['R2']} | RMSE = {best['RMSE']} | MAE = {best['MAE']}")
    return best_name, best["model"]


# ─── 5. Feature Importance ───────────────────────────────────────────────────
def plot_feature_importance(model, feature_cols):
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
        fi_df = pd.DataFrame({"Feature": feature_cols, "Importance": importances})
        fi_df = fi_df.sort_values("Importance", ascending=False)
        print("\n📈 Feature Importances:")
        print(fi_df.to_string(index=False))
        return fi_df
    return None


# ─── 6. Save Model ────────────────────────────────────────────────────────────
def save_model(model, scaler, feature_cols, model_name):
    artifacts = {
        "model": model,
        "scaler": scaler,
        "feature_cols": feature_cols,
        "model_name": model_name,
        "trained_date": pd.Timestamp.now().isoformat(),
        "version": "1.0.0",
    }
    path = OUTPUT_DIR / "yield_model.pkl"
    joblib.dump(artifacts, path)
    print(f"\n✅ Model saved: {path}")
    return path


# ─── 7. Evaluation Summary ───────────────────────────────────────────────────
def print_summary(results):
    print("\n" + "=" * 65)
    print("📊 MODEL COMPARISON SUMMARY")
    print("=" * 65)
    print(f"{'Model':<35} {'RMSE':>6} {'R²':>6} {'MAE':>6}")
    print("-" * 65)
    for name, r in sorted(results.items(), key=lambda x: -x[1]["R2"]):
        print(f"{name:<35} {r['RMSE']:>6.3f} {r['R2']:>6.3f} {r['MAE']:>6.3f}")
    print("=" * 65)


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    print("🌾 KisanAI - Crop Yield Prediction Training Pipeline")
    print("=" * 65)

    os.makedirs("data", exist_ok=True)
    os.makedirs("models", exist_ok=True)

    # 1. Load / generate data
    df = generate_synthetic_dataset(n_samples=5000)

    # 2. Preprocess
    X, y, feature_cols = preprocess_data(df)

    # 3. Train/test split (80/20)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_SEED
    )
    print(f"\n📂 Train: {len(X_train)} | Test: {len(X_test)}")

    # 4. Train models
    results, scaler = train_models(X_train, X_test, y_train, y_test)

    # 5. Summary
    print_summary(results)

    # 6. Best model
    best_name, best_model = select_best_model(results)

    # 7. Feature importance
    plot_feature_importance(best_model, feature_cols)

    # 8. Save
    model_path = save_model(best_model, scaler, feature_cols, best_name)

    print("\n✅ Training complete! Model exported to models/yield_model.pkl")
    print("   Load with: artifacts = joblib.load('models/yield_model.pkl')")
    return model_path


if __name__ == "__main__":
    main()
