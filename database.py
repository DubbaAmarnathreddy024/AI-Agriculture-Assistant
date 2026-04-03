# ═══════════════════════════════════════════════════════════════════════════
# KisanAI – Database Schema (PostgreSQL / SQLite)
# ═══════════════════════════════════════════════════════════════════════════

# Run: python database.py  (creates all tables)

import os
import datetime
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, Boolean,
    DateTime, Text, ForeignKey, Index, JSON
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kisanai.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ─── Tables ──────────────────────────────────────────────────────────────────

class Farmer(Base):
    """
    Core farmer profile table.
    All recommendations are personalized using this data.
    Normalized: 3NF - no repeating groups, all non-key attrs depend on PK.
    """
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(String(16), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    phone = Column(String(15), unique=True, nullable=False)
    village = Column(String(100))
    district = Column(String(100))
    state = Column(String(100))
    language = Column(String(5), default="en")        # te/hi/en/ta/kn
    farm_size_acres = Column(Float)
    soil_type = Column(String(50))
    primary_crop = Column(String(50))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Relationships
    crop_history = relationship("CropHistory", back_populates="farmer")
    predictions = relationship("Prediction", back_populates="farmer")
    disease_logs = relationship("DiseaseLog", back_populates="farmer")

    # Index for geolocation-based queries
    __table_args__ = (Index("ix_farmers_district_state", "district", "state"),)


class CropHistory(Base):
    """
    Track crops grown each season.
    Used for crop rotation recommendations.
    1NF: each cell atomic. 2NF: all attrs depend on composite PK (farmer_id, season).
    """
    __tablename__ = "crop_history"

    id = Column(Integer, primary_key=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False)
    crop_name = Column(String(50), nullable=False)
    season = Column(String(20))           # kharif / rabi / zaid
    year = Column(Integer)
    farm_size_hectare = Column(Float)
    yield_tons_ha = Column(Float)
    actual_yield_tons = Column(Float)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farmer = relationship("Farmer", back_populates="crop_history")


class Prediction(Base):
    """
    AI prediction log. Every inference is stored for audit and retraining.
    """
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False)
    prediction_type = Column(String(30))      # yield / disease / pest / market
    crop = Column(String(50))
    input_data = Column(JSON)
    output_data = Column(JSON)
    model_name = Column(String(50))
    confidence = Column(Float)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farmer = relationship("Farmer", back_populates="predictions")
    __table_args__ = (Index("ix_predictions_type_crop", "prediction_type", "crop"),)


class DiseaseLog(Base):
    """
    Disease detections. Aggregated for regional outbreak alerts.
    """
    __tablename__ = "disease_logs"

    id = Column(Integer, primary_key=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False)
    crop = Column(String(50))
    disease_name = Column(String(100))
    confidence = Column(Float)
    severity = Column(String(20))
    image_path = Column(String(255))
    lat = Column(Float)
    lng = Column(Float)
    village = Column(String(100))
    district = Column(String(100))
    state = Column(String(100))
    treatment_applied = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farmer = relationship("Farmer", back_populates="disease_logs")
    __table_args__ = (
        Index("ix_disease_district", "district", "disease_name"),
        Index("ix_disease_location", "lat", "lng"),
    )


class MarketPrice(Base):
    """
    Historical and current mandi prices.
    Used for ML price prediction model training.
    """
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True)
    crop = Column(String(50), nullable=False, index=True)
    market_name = Column(String(100))
    state = Column(String(100))
    district = Column(String(100))
    price_per_quintal = Column(Float, nullable=False)
    min_price = Column(Float)
    max_price = Column(Float)
    arrival_tonnes = Column(Float)
    date = Column(DateTime, nullable=False, index=True)
    source = Column(String(50), default="agmarknet")

    __table_args__ = (Index("ix_market_crop_date", "crop", "date"),)


class Alert(Base):
    """
    Disease outbreak / pest alerts.
    Sent to farmers in affected radius.
    """
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True)
    alert_type = Column(String(30))     # disease_outbreak / pest / weather / price
    title = Column(String(200))
    message = Column(Text)
    severity = Column(String(20))       # Low / Medium / High / Critical
    crop = Column(String(50))
    district = Column(String(100))
    state = Column(String(100))
    lat = Column(Float)
    lng = Column(Float)
    radius_km = Column(Float, default=20)
    farmers_notified = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    expires_at = Column(DateTime)

    __table_args__ = (Index("ix_alerts_district_type", "district", "alert_type"),)


class SoilTest(Base):
    """Soil test results submitted by farmers."""
    __tablename__ = "soil_tests"

    id = Column(Integer, primary_key=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False)
    ph = Column(Float)
    nitrogen_kg_ha = Column(Float)
    phosphorus_kg_ha = Column(Float)
    potassium_kg_ha = Column(Float)
    organic_matter_pct = Column(Float)
    recommendations = Column(JSON)
    test_date = Column(DateTime, default=datetime.datetime.utcnow)


class CommunityPost(Base):
    """Farmer community forum posts."""
    __tablename__ = "community_posts"

    id = Column(Integer, primary_key=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False)
    title = Column(String(200))
    content = Column(Text)
    crop = Column(String(50))
    image_url = Column(String(255))
    likes = Column(Integer, default=0)
    replies = Column(Integer, default=0)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Equipment(Base):
    """Equipment rental marketplace."""
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True)
    owner_farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=False)
    name = Column(String(100))
    type = Column(String(50))           # tractor / harvester / sprayer
    horsepower = Column(Float)
    hourly_rate = Column(Float)
    daily_rate = Column(Float)
    is_available = Column(Boolean, default=True)
    lat = Column(Float)
    lng = Column(Float)
    village = Column(String(100))
    district = Column(String(100))
    contact_phone = Column(String(15))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (Index("ix_equipment_district_type", "district", "type"),)


# ─── DB Init ──────────────────────────────────────────────────────────────────
def init_db():
    Base.metadata.create_all(bind=engine)
    print("✅ All database tables created successfully")
    print("Tables:", [t for t in Base.metadata.tables])


def get_db():
    """FastAPI dependency injection for DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
