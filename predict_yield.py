import joblib
import numpy as np

artifacts = joblib.load("models/yield_model.pkl")

model = artifacts["model"]
encoder = artifacts["encoder"]

def predict_yield_ml(req):

    crop_encoded = encoder.transform([req.crop])[0]

    features = np.array([[
        req.rainfall,
        req.temperature,
        req.soil_moisture,
        req.soil_ph,
        90,
        40,
        40,
        crop_encoded
    ]])

    prediction = model.predict(features)[0]

    return {
        "yield_per_hectare": round(prediction,2),
        "confidence": "High",
        "model": "RandomForest"
    }