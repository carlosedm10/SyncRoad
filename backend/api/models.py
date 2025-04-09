# models.py
import os
from sqlalchemy import (
    Column,
    String,
    Integer,
    create_engine,
    ForeignKey,
    Float,
    DateTime,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
from datetime import datetime

# Construct the database URL from environment variables
DATABASE_URL = (
    f"postgresql://{os.getenv('POSTGRES_USER', 'syncroad')}:"
    f"{os.getenv('POSTGRES_PASSWORD', 'syncroad')}@"
    f"{os.getenv('DATABASE_HOST', 'syncroad_database')}/"
    f"{os.getenv('POSTGRES_DB', 'syncroad')}"
)

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for our models
Base = declarative_base()


# ------------- Pydantic models -------------
class UserCredentials(BaseModel):
    email: str
    password: str


# Nuevo modelo Pydantic para registrar usuarios con rol
class UserRegistration(BaseModel):
    email: str
    password: str
    role: str  # "seguidor" o "seguido"


# Nuevo modelo Pydantic para recibir actualizaciones de ubicación
class LocationUpdate(BaseModel):
    latitude: float
    longitude: float


# ------------- ORM models (tablas) -------------
class User(Base):
    __tablename__ = "users"
    user_id = Column(
        Integer,
        primary_key=True,
        index=True,
        nullable=False,
        autoincrement=True,
        unique=True,
    )
    email = Column(String, index=True, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, index=True, nullable=False)  # "seguidor" o "seguido"


class Location(Base):
    __tablename__ = "locations"
    location_id = Column(
        Integer, primary_key=True, index=True, autoincrement=True
    )
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


# Dependency for FastAPI to get a database session per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
