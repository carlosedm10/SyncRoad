# main.py
from api.Users.utils import hash_password
from api.Users.models import Base, engine, User, get_db

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

# Create the database tables if they don't already exist
Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/get_user/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.user_id == user_id).first()
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/create_user/")
def create_user(user_data: dict, db: Session = Depends(get_db)):
    try:
        # Check if email is already in use
        existing_user = db.query(User).filter(User.email == user_data["email"]).first()
        # NOTE: fix this rasinging error
        if existing_user:
            return HTTPException(status_code=400, detail="Email already registered")

        # Create new user instance
        new_user = User(
            name=user_data["name"],
            email=user_data["email"],
            password=hash_password(user_data["password"]),  # Hash the password
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    # except IntegrityError:
    #     db.rollback()
    #     raise HTTPException(status_code=400, detail="Email already registered")
    except Exception as e:
        db.rollback()  # Rollback in case of any errors
        raise HTTPException(status_code=500, detail=str(e))
