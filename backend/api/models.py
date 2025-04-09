# models.py
import os
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    Float,
    DateTime,
    ForeignKey,
    create_engine,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel

# --------------------
# 1. Configuración de la BD
# --------------------
DATABASE_URL = (
    f"postgresql://{os.getenv('POSTGRES_USER', 'syncroad')}:"
    f"{os.getenv('POSTGRES_PASSWORD', 'syncroad')}@"
    f"{os.getenv('DATABASE_HOST', 'syncroad_database')}/"
    f"{os.getenv('POSTGRES_DB', 'syncroad')}"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# --------------------
# 2. Pydantic models
# --------------------
class UserCredentials(BaseModel):
    email: str
    password: str


class DriverData(BaseModel):
    user_id: int
    driver: bool
    linked: bool


class LocationUpdate(BaseModel):
    latitude: float
    longitude: float


class WifiCredentials(BaseModel):
    ssid: str
    password: str


# --------------------
# 3. ORM models (tablas)
# --------------------
class User(Base):
    __tablename__ = "users"
    user_id = Column(
        Integer, primary_key=True, index=True, autoincrement=True, unique=True
    )
    email = Column(String, index=True, unique=True, nullable=False)
    password = Column(String, nullable=False)
    # Nuevos campos booleanos en lugar de "role"
    driver = Column(Boolean, default=False)
    linked = Column(Boolean, default=False)


class Location(Base):
    __tablename__ = "locations"
    location_id = Column(
        Integer, primary_key=True, index=True, autoincrement=True
    )
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


# --------------------
# 4. Dependencia para obtener DB
# --------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
