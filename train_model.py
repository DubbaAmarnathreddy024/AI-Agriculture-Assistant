import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder

print("🌾 Training KisanAI Yield Model")

df = pd.read_csv("data/crop_dataset_clean.csv")

# encode crop
encoder = LabelEncoder()
df["crop_encoded"] = encoder.fit_transform(df["label"])

# create yield column
df["yield"] = (
    df["rainfall"] * 0.02 +
    df["temperature"] * 0.3 +
    df["humidity"] * 0.05 +
    df["N"] * 0.01 +
    df["P"] * 0.005
)

features = [
    "rainfall",
    "temperature",
    "humidity",
    "ph",
    "N",
    "P",
    "K",
    "crop_encoded"
]

X = df[features]
y = df["yield"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)

model = RandomForestRegressor(
    n_estimators=300,
    max_depth=12
)

model.fit(X_train, y_train)

score = model.score(X_test, y_test)

print("Model accuracy:", score)

joblib.dump(
    {
        "model": model,
        "encoder": encoder,
        "features": features
    },
    "models/yield_model.pkl"
)

print("✅ Model saved to models/yield_model.pkl")