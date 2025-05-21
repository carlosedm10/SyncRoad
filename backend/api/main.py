# main.py
from datetime import datetime
from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    WebSocket,
)
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from api.models import (
    Base,
    DriveSession,
    LocationData,
    SessionLocal,
    UserCredentials,
    LinkData,
    engine,
    User,
    Location,
    get_db,
)
from api.raspberry import udp_listener, udp_sender

# Crear/actualizar tablas en la BD
Base.metadata.create_all(bind=engine)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


Base.metadata.create_all(bind=engine)  # Create tables if they don't exist

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*"
    ],  # TODO: Replace "*" with your frontend's URL in production for security.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConnectionManager:
    def __init__(self):
        self.driver_ws: dict[int, WebSocket] = {}
        self.followers_ws: dict[int, list[WebSocket]] = {}

    def connect_driver(self, driver_id: int, ws: WebSocket):
        self.driver_ws[driver_id] = ws

    def disconnect_driver(self, driver_id: int):
        self.driver_ws.pop(driver_id, None)

    def connect_follower(self, driver_id: int, ws: WebSocket):
        self.followers_ws.setdefault(driver_id, []).append(ws)

    def disconnect_follower(self, driver_id: int, ws: WebSocket):
        if driver_id in self.followers_ws:
            self.followers_ws[driver_id].remove(ws)

    async def broadcast_to_followers(self, driver_id: int, message: dict):
        for ws in self.followers_ws.get(driver_id, []):
            try:
                await ws.send_json(message)
            except:
                pass  # ignore broken connections


manager = ConnectionManager()


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
        new_user = User(email=user_data.email, password=hashed_password, driver=False)
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
    """Method for testing purposes"""
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


@app.post("/update-link-session/")
def update_link_session(user_data: LinkData, db: Session = Depends(get_db)):
    """Updates the user's preferences for the platooning session."""
    # 1. Load user
    user = db.query(User).filter(User.id == user_data.user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    # 2. Set driver flag on the user record
    user.driver = user_data.driver

    if user_data.linked:
        # --- Linking logic ---
        if user.drive_session_id is None:
            # a) Try to join an existing session where they're already a participant
            session = (
                db.query(DriveSession)
                .filter(DriveSession.participants.any(User.id == user.id))
                .first()
            )
            if not session:
                # b) No session found → create one with the default driver (user 2)
                default_driver = db.query(User).get(2)
                if not default_driver:
                    raise HTTPException(404, "Default driver (ID=2) not found")

                session = DriveSession(
                    token=f"session-{default_driver.id}-{datetime.utcnow().timestamp()}",
                    driver_id=default_driver.id,
                )
                db.add(session)
                db.flush()  # to assign session.id

            # c) Whether found or newly created, add this follower
            user.drive_session_id = session.id
            if user not in session.participants:
                session.participants.append(user)

        else:
            # Already in a session → (optionally) you could ensure the driver hasn't changed
            session = db.query(DriveSession).get(user.drive_session_id)
            if not session:
                # Weird: they had an ID but no session exists
                raise HTTPException(404, "Previously linked session not found")

            # If somehow they flipped to `driver=True` you could reassign,
            # but since this user is always follower, we do nothing here.

    else:
        # --- Unlinking logic ---
        if user.drive_session_id:
            session = db.query(DriveSession).get(user.drive_session_id)
            if session:
                # Unlink *all* participants and delete session
                for u in session.participants:
                    u.drive_session_id = None
                db.delete(session)
            user.drive_session_id = None

    # Send the UDP update, commit everything once
    udp_sender(user_data.linked)
    db.commit()
    db.refresh(user)

    return {
        "user_id": user.id,
        "updated": True,
        "linked": user_data.linked,
        "drive_session_id": user.drive_session_id,
    }


# Connection to RaspberryPi
@app.on_event("startup")
def startup_event():
    udp_listener(app, SessionLocal)
