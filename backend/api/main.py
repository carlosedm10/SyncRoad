# main.py
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from api.models import Base, engine, User, get_db

# Create the database tables if they don't already exist
Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/get_user/{user_email}")
def get_user(user_email: str, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == user_email).first()
    except Exception as e:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.post("/create_user/")
def create_user(user_data: list, db: Session = Depends(get_db)):
    name, email, password = user_data
    already_existing_user = db.query(User).filter(User.email == email).first()
    if already_existing_user:
        raise HTTPException(status_code=409, detail="User already exists")
    try:
        new_user = User(name=name, email=email, password=password)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    return new_user
