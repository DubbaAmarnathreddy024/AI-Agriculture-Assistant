import streamlit as st
import joblib
import numpy as np

# Load model
artifacts = joblib.load("models/yield_model.pkl")
model = artifacts["model"]
encoder = artifacts["encoder"]

st.title("🌱 AI Agriculture Assistant (KisanAI)")

st.write("Smart farming using AI 🚀")

# Inputs
crop = st.selectbox("Select Crop", ["rice","wheat","cotton","maize","tomato","groundnut"])
rainfall = st.number_input("Rainfall (mm)", 0.0, 5000.0)
temperature = st.number_input("Temperature (°C)", 0.0, 55.0)
soil_moisture = st.number_input("Soil Moisture (%)", 0.0, 100.0)
soil_ph = st.number_input("Soil pH", 3.0, 10.0)
fertilizer = st.number_input("Fertilizer (kg/ha)", 0.0, 1000.0)
farm_size = st.number_input("Farm Size (hectare)", 0.1, 100.0)

if st.button("Predict Yield"):
    crop_encoded = encoder.transform([crop])[0]

    features = np.array([[ 
        rainfall,
        temperature,
        soil_moisture,
        soil_ph,
        fertilizer,
        farm_size,
        crop_encoded,
        0
    ]])

    prediction = model.predict(features)[0]

    st.success(f"🌾 Predicted Yield: {round(prediction,2)} tons/hectare")