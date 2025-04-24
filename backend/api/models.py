# models.py
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
from sqlalchemy.orm import sessionmaker, relationship
from pydantic import BaseModel
import os

DATABASE_URL = f"postgresql://{os.getenv('POSTGRES_USER','syncroad')}:{os.getenv('POSTGRES_PASSWORD','syncroad')}@{os.getenv('DATABASE_HOST','syncroad_database')}/{os.getenv('POSTGRES_DB','syncroad')}"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Pydantic models
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


class ConnectionData(BaseModel):
    follower_id: int
    driver_id: int


# ORM models
db_Base = Base


class User(Base):
    __tablename__ = "users"
    user_id = Column(
        Integer, primary_key=True, index=True, autoincrement=True, unique=True
    )
    email = Column(String, index=True, unique=True, nullable=False)
    password = Column(String, nullable=False)
    driver = Column(Boolean, default=False)
    linked = Column(Boolean, default=False)
    follow_target_id = Column(
        Integer, ForeignKey("users.user_id"), nullable=True
    )
    follow_target = relationship("User", remote_side=[user_id])


class Location(Base):
    __tablename__ = "locations"
    location_id = Column(
        Integer, primary_key=True, index=True, autoincrement=True
    )
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


# Dependency to get DB session


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
