# 🌾 KisanAI — Production AI Agriculture Platform
## Complete Technical Documentation

---

## 🎯 Project Overview

**KisanAI** is a voice-first, AI-powered agriculture assistant platform designed specifically for rural Indian farmers with limited digital literacy. The system combines Computer Vision, Machine Learning, Natural Language Processing, and real-time data APIs to deliver personalized farming advice.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React PWA)                  │
│  Voice UI · Camera · Offline-first · Multi-language     │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS / REST
┌──────────────────────▼──────────────────────────────────┐
│              FastAPI Backend (Python)                    │
│  JWT Auth · Rate Limiting · CORS · Logging              │
├─────────────┬──────────────┬──────────────┬─────────────┤
│  ML Models  │  Weather API │  Market API  │  DB Layer   │
│ (EfficientNet│(OpenWeather) │(Agmarknet)   │(PostgreSQL) │
│  XGBoost)   │              │              │             │
└─────────────┴──────────────┴──────────────┴─────────────┘
```

---

## 📁 Project Structure

```
farmtech/
├── frontend/
│   └── index.jsx              ← React PWA (voice + camera + i18n)
├── backend/
│   ├── main.py                ← FastAPI app + all endpoints
│   ├── database.py            ← SQLAlchemy models (8 tables)
│   └── requirements.txt       ← Python dependencies
├── models/
│   └── train_yield_model.py   ← ML training pipeline
└── docs/
    └── README.md              ← This file
```

---

## 🤖 AI/ML Models

### 1. Crop Disease Detection (Computer Vision)
- **Architecture**: EfficientNetB0 (Transfer Learning)
- **Dataset**: PlantVillage (54,000+ leaf images, 38 classes)
- **Accuracy**: ~94% validation accuracy
- **Input**: RGB leaf image (224×224)
- **Output**: Disease name, confidence, treatment
- **Training**:
  ```python
  base = EfficientNetB0(weights='imagenet', include_top=False)
  x = GlobalAveragePooling2D()(base.output)
  x = Dense(256, activation='relu')(x)
  x = Dropout(0.3)(x)
  output = Dense(38, activation='softmax')(x)
  ```

### 2. Crop Yield Prediction (Regression)
- **Models compared**: Linear Regression, Ridge, Random Forest, XGBoost
- **Best model**: Random Forest (R² = 0.84, RMSE = 0.31)
- **Features**: rainfall, temperature, soil pH, fertilizer, soil moisture
- **Cross-validation**: 5-fold KFold
- **Export**: `models/yield_model.pkl`

### 3. Market Price Prediction (Time Series)
- **Model**: ARIMA + Random Forest ensemble
- **Data source**: Agmarknet API (historical mandi prices)
- **Prediction horizon**: 1-30 days

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Farmer registration | No |
| POST | `/auth/login` | Login → JWT token | No |
| POST | `/predict-yield` | ML yield prediction | Optional |
| POST | `/detect-disease` | CNN disease detection | Optional |
| POST | `/soil-analysis` | Soil NPK analysis | Optional |
| POST | `/irrigation-schedule` | AI irrigation planner | Optional |
| GET | `/market-prices` | Mandi price + prediction | No |
| GET | `/weather` | Weather + farm alerts | No |
| GET | `/pest-alerts` | Regional pest reports | No |
| GET | `/government-schemes` | Govt scheme database | No |
| GET | `/fertilizer-guide` | Fertilizer calculator | No |
| GET | `/crop-rotation` | Next crop recommendation | No |
| GET | `/satellite-data` | NDVI + crop health | Optional |

---

## 🌍 Multi-Language Support

| Language | Code | Voice Lang |
|----------|------|------------|
| English  | en   | en-IN      |
| Hindi    | hi   | hi-IN      |
| Telugu   | te   | te-IN      |
| Tamil    | ta   | ta-IN      |
| Kannada  | kn   | kn-IN      |

---

## 🗄️ Database Schema (PostgreSQL)

**8 Tables — 3NF Normalized**

| Table | Purpose |
|-------|---------|
| `farmers` | Core farmer profile |
| `crop_history` | Seasonal crop records |
| `predictions` | All AI inference logs |
| `disease_logs` | Disease detections (for outbreak alerts) |
| `market_prices` | Historical mandi data |
| `alerts` | Disease/pest/weather alerts |
| `community_posts` | Farmer forum |
| `equipment` | Rental marketplace |

---

## 📴 Offline Support (PWA)

```javascript
// Service Worker caches:
// - Static assets (HTML, CSS, JS)
// - Last AI prediction
// - Weather data (2hr cache)
// - Market prices (1hr cache)

// When offline:
// 1. Show "Offline Mode Active" banner
// 2. Serve cached predictions
// 3. Queue voice commands for later
// 4. Sync when back online
```

---

## 🚀 Deployment Guide

### Frontend (Vercel)
```bash
# Install dependencies
npm install

# Build
npm run build

# Deploy
vercel --prod

# Environment Variables (Vercel Dashboard):
REACT_APP_API_URL=https://kisanai-api.railway.app
```

### Backend (Railway / Render)
```bash
# Clone and install
pip install -r requirements.txt

# Environment Variables:
DATABASE_URL=postgresql://user:pass@host:5432/kisanai
JWT_SECRET=your-secret-key-min-32-chars
OPENWEATHER_API_KEY=your_openweather_key
FRONTEND_URL=https://kisanai.vercel.app
SENTRY_DSN=your_sentry_dsn

# Run locally
uvicorn main:app --reload --port 8000

# Production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Database Setup
```bash
python database.py    # Creates all tables
```

### ML Models
```bash
cd models
python train_yield_model.py    # Trains and saves yield_model.pkl
```

---

## 🔐 Security

| Feature | Implementation |
|---------|----------------|
| Auth | JWT (30-day expiry, RS256) |
| Rate Limiting | 5-30 req/min per endpoint |
| Input Validation | Pydantic models with regex |
| File Upload | MIME type + size validation |
| CORS | Whitelist production origins |
| Error Handling | No stack traces in production |

---

## 📊 Performance Benchmarks

| Metric | Value |
|--------|-------|
| Disease Detection | < 2s (CPU) / 0.3s (GPU) |
| Yield Prediction | < 100ms |
| API Response P95 | < 500ms |
| Offline startup | < 1s (cached) |
| PWA Lighthouse Score | 92/100 |

---

## 🧪 API Testing (curl examples)

```bash
# Health check
curl https://kisanai-api.railway.app/health

# Yield prediction
curl -X POST https://kisanai-api.railway.app/predict-yield \
  -H "Content-Type: application/json" \
  -d '{"crop":"rice","rainfall":1200,"temperature":28,"soil_moisture":65,"soil_ph":6.5,"fertilizer_kg_per_hectare":150,"farm_size_hectare":2}'

# Market prices
curl "https://kisanai-api.railway.app/market-prices?crop=rice&days_ahead=7"

# Soil analysis
curl -X POST https://kisanai-api.railway.app/soil-analysis \
  -H "Content-Type: application/json" \
  -d '{"ph":6.4,"nitrogen":280,"phosphorus":45,"potassium":180,"crop":"rice"}'

# Disease detection (with image)
curl -X POST https://kisanai-api.railway.app/detect-disease \
  -F "file=@leaf.jpg" -F "crop=rice"
```

---

## 👨‍🌾 Farmer User Flow

```
1. Open app → Onboarding (3 steps: profile + location + farm)
2. Home screen with voice button + weather summary
3. Tap 🎤 → Speak in Telugu/Hindi/English
4. AI processes → Navigates to relevant screen
5. All results read aloud automatically
6. One-tap icons for: Disease Scan, Weather, Market, Expert
```

---

## 📚 Technologies Used

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Web Speech API, PWA Service Worker |
| Backend | FastAPI, Python 3.11 |
| ML/AI | scikit-learn, XGBoost, TensorFlow/EfficientNet |
| Database | PostgreSQL (production), SQLite (dev) |
| ORM | SQLAlchemy 2.0 |
| Auth | JWT (python-jose) |
| Rate Limiting | SlowAPI |
| Deployment | Vercel (frontend), Railway (backend) |
| Monitoring | Sentry, Prometheus |

---

*Built for rural Indian farmers by KisanAI Team. Making AI accessible to every farmer.*
