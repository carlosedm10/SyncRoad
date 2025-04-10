# main.py
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from api.models import Base, DriverData, UserCredentials, engine, User, get_db

from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware

# Create the database tables if they don't already exist
Base.metadata.create_all(bind=engine)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],  # Replace "*" with your frontend's URL in production for security.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return "Hello, there is nothing intereseting here. VISIT: http://localhost:8000/docs"


# Endpoint to log in the user
@app.post("/login")
def login(user_data: UserCredentials, db: Session = Depends(get_db)):
    print(user_data)
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


@app.get("get-user-info({user_id}")
def get_user_info(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User


@app.post("/update-driver")
def update_driver(driver_data: DriverData, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == driver_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        user.driver = driver_data.driver
        user.linked = driver_data.linked
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    return {True}
