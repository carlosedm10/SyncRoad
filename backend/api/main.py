# main.py
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Base, engine, User, get_db

# Create the database tables if they don't already exist
Base.metadata.create_all(bind=engine)

app = FastAPI()


def get_or_create_user(db: Session, user_id: str) -> User:
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        user = User(user_id=user_id)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/user/{user_id}")
def read_user(user_id: str, db: Session = Depends(get_db)):
    try:
        user = get_or_create_user(db, user_id)
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
