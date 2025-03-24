# models.py
import os
from sqlalchemy import Column, String, Integer, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

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


class Company(Base):
    __tablename__ = "companies"
    company_id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, index=True)
    password = Column(String)


# Define the User model
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
    name = Column(String, index=True)
    email = Column(String, index=True, unique=True, nullable=False)
    password = Column(String, nullable=False)


# Dependency for FastAPI to get a database session per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
