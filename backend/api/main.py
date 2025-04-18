# main.py
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from api.models import (
    Base,
    DriveSession,
    DriverData,
    LocationData,
    UserCredentials,
    engine,
    User,
    Location,
    get_db,
)
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)  # Create tables if they don't exist

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
    """Example endpoint to check if the server is running."""
    return (
        "Hello, there is nothing intereseting here. VISIT: http://localhost:8000/docs"
    )


@app.post("/create-user")
def create_user(user_data: UserCredentials, db: Session = Depends(get_db)):
    new_user = db.query(User).filter(User.email == user_data.email).first()
    if new_user:
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
    return {"user_id": new_user.id, "created": True}


@app.post("/login")
def login(user_data: UserCredentials, db: Session = Depends(get_db)):
    """Endpoint to log in a user."""
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please sign up.")
    if not pwd_context.verify(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    return {"user_id": user.id, "logged": True}


@app.get("/get-user-info/{user_id}")
def get_user_info(user_id: int, db: Session = Depends(get_db)):
    """Endpoint to get user information by user_id."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.post("/update-location/")  # NOTE: uncomment this for testing in Local
def update_location(location_data: LocationData, db: Session = Depends(get_db)):
    """Method that will connect to raspberry pi and update the location of the user"""

    user = db.query(User).filter(User.id == location_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    location = db.query(Location).filter_by(user_id=user.id).first()
    if location:
        location.latitude = location_data.latitude
        location.longitude = location_data.longitude
        location.timestamp = location_data.timestamp
    else:
        location = Location(
            user_id=user.id,
            latitude=location_data.latitude,
            longitude=location_data.longitude,
            timestamp=location_data.timestamp,
        )
        db.add(location)
    db.commit()

    return {
        "user_id": user.id,
        "updated": True,
    }


@app.get("/get-locations/{user_id}")
def get_locations(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Internal Error")

    last_location = db.query(Location).filter(Location.user_id == user.id).first()

    if not last_location:
        raise HTTPException(status_code=404, detail="Location not found")

    return {
        "user_id": user.id,
        "latitude": last_location.latitude,
        "longitude": last_location.longitude,
        "timestamp": last_location.timestamp,
    }


@app.post("/update-driver/")
def update_driver(driver_data: DriverData, db: Session = Depends(get_db)):
    """Updates the drivers preferences when the user clicks the buttons"""
    user = db.query(User).filter(User.id == driver_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        user.driver = driver_data.driver
        if driver_data.linked:
            if user.drive_session_id is None and driver_data.driver is False:
                # add user to existing session
                session = db.query(DriveSession).first()
                if session:
                    user.drive_session_id = session.id
                    session.participants.append(user)
                else:
                    raise HTTPException(
                        status_code=404, detail="No active drive session found"
                    )
            elif user.drive_session_id is None and driver_data.driver is True:
                # Create a new DriveSession
                new_session = DriveSession(
                    token=f"session-{user.id}-{datetime.utcnow().timestamp()}",
                    driver_id=user.id if driver_data.driver else None,
                )
                db.add(new_session)
                db.commit()
                user.drive_session_id = new_session.id
            else:
                # Update driver in existing session if needed
                session = (
                    db.query(DriveSession).filter_by(id=user.drive_session_id).first()
                )
                if session and driver_data.driver:
                    session.driver_id = user.id
        else:
            # If user is linked to a session but now wants to unlink, delete the session
            if user.drive_session_id:
                session = (
                    db.query(DriveSession).filter_by(id=user.drive_session_id).first()
                )
                if session:
                    # Unlink all users connected to this session
                    users_in_session = (
                        db.query(User).filter_by(drive_session_id=session.id).all()
                    )
                    for u in users_in_session:
                        u.drive_session_id = None
                    db.delete(session)

        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    return {
        "user_id": user.id,
        "updated": True,
        "linked": driver_data.linked,
        "drive_session_id": user.drive_session_id,
    }
