# models.py
import os
from sqlalchemy import Column, String, Integer, create_engine, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel

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


# Pydantic models for incoming request bodies
class UserCredentials(BaseModel):
    email: str
    password: str


class DriverData(BaseModel):
    user_id: int
    driver = bool
    linked = bool


# Define the User model
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
    linked = Column(Boolean, default=False)


# Dependency for FastAPI to get a database session per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
