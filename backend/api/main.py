# main.py
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from api.models import Base, UserCredentials, engine, User, get_db

from passlib.context import CryptContext

# Create the database tables if they don't already exist
Base.metadata.create_all(bind=engine)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


# Endpoint to log in the user
@app.post("/login")
def login(user_data: UserCredentials, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(
            status_code=404, detail="User not found. Please sign up."
        )
    if not pwd_context.verify(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    return {True}


# Endpoint to create a new user
@app.post("/create-user")
def create_user(user_data: UserCredentials, db: Session = Depends(get_db)):
    already_existing_user = (
        db.query(User).filter(User.email == user_data.email).first()
    )
    if already_existing_user:
        raise HTTPException(status_code=409, detail="User already exists")
    try:
        hashed_password = pwd_context.hash(user_data.password)
        new_user = User(email=user_data.email, password=hashed_password)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    return {
        "message": "User created successfully",
        "user_id": new_user.user_id,
    }
