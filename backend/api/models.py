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
    Table,
    ForeignKey,
    create_engine,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from pydantic import BaseModel

# Construct the database URL from environment variables
DATABASE_URL = (
    f"postgresql://{os.getenv('POSTGRES_USER', 'syncroad')}:"
    f"{os.getenv('POSTGRES_PASSWORD', 'syncroad')}@"
    f"{os.getenv('DATABASE_HOST', 'syncroad_database')}/"
    f"{os.getenv('POSTGRES_DB', 'syncroad')}"
)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class UserCredentials(BaseModel):
    email: str
    password: str


class LocationData(BaseModel):
    user_id: int
    latitude: float
    longitude: float
    timestamp: datetime


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
    id = Column(
        Integer,
        primary_key=True,
        index=True,
        nullable=False,
        autoincrement=True,
        unique=True,
    )
    email = Column(String, index=True, unique=True, nullable=False)
    password = Column(String, nullable=False)
    driver = Column(Boolean, default=False)
    # Each user may optionally be linked to one drive session (one-to-many relationship).
    drive_session_id = Column(Integer, ForeignKey("drive_sessions.id"), nullable=True)
    drive_session = relationship(
        "DriveSession",
        back_populates="participants",
        foreign_keys=[drive_session_id],
    )
    location = relationship(
        "Location",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )


class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, autoincrement=True)

    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    timestamp = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="location")


class DriveSession(Base):
    __tablename__ = "drive_sessions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    token = Column(String, unique=True, nullable=False)
    driver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # The user who is the driver
    driver = relationship("User", foreign_keys=[driver_id])

    # List of users in this session (linked via User.drive_session_id)
    participants = relationship(
        "User",
        back_populates="drive_session",
        foreign_keys=[User.drive_session_id],
    )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
