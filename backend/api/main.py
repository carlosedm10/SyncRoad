# main.py
import asyncio
from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
)
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import subprocess

from api.models import (
    Base,
    UserCredentials,
    DriverData,
    ConnectionData,
    LocationUpdate,
    WifiCredentials,
    engine,
    User,
    Location,
    get_db,
)

# Crear/actualizar tablas en la BD
Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
app = FastAPI()

# ------------------------------------------------------------------------------
# WebSocket Connection Manager for drivers and followers
# ------------------------------------------------------------------------------
from typing import Dict, List


class ConnectionManager:
    def __init__(self):
        self.driver_ws: Dict[int, WebSocket] = {}
        self.followers_ws: Dict[int, List[WebSocket]] = {}

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


# ------------------------------------------------------------------------------
# 1. Login de usuario
# (sin cambios)
# ------------------------------------------------------------------------------
@app.post("/login")
def login(user_data: UserCredentials, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(
            status_code=404, detail="User not found. Please sign up."
        )
    if not pwd_context.verify(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    return {
        "login_successful": True,
        "user_id": user.user_id,
        "driver": user.driver,
        "linked": user.linked,
    }


# ------------------------------------------------------------------------------
# 2. Crear un nuevo usuario
# (sin cambios)
# ------------------------------------------------------------------------------
@app.post("/create-user")
def create_user(user_data: UserCredentials, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="User already exists")
    hashed = pwd_context.hash(user_data.password)
    new_user = User(email=user_data.email, password=hashed)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {
        "message": "User created successfully",
        "user_id": new_user.user_id,
        "driver": new_user.driver,
        "linked": new_user.linked,
    }


# ------------------------------------------------------------------------------
# 3. Obtener información de un usuario (ID)
# ------------------------------------------------------------------------------
@app.get("/get-user-info/{user_id}")
def get_user_info(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "user_id": user.user_id,
        "email": user.email,
        "driver": user.driver,
        "linked": user.linked,
        "follow_target_id": user.follow_target_id,
    }


# ------------------------------------------------------------------------------
# 4. Actualizar driver/linked
# ------------------------------------------------------------------------------
@app.post("/update-driver")
def update_driver(driver_data: DriverData, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == driver_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.driver = driver_data.driver
    user.linked = driver_data.linked
    db.commit()
    db.refresh(user)
    return {
        "success": True,
        "user_id": user.user_id,
        "driver": user.driver,
        "linked": user.linked,
    }


# ------------------------------------------------------------------------------
# 5. WebSocket endpoint for Raspberry Pi (driver) to send GPS data
# ------------------------------------------------------------------------------
@app.websocket("/ws/gps/{driver_id}")
async def ws_gps(
    driver_id: int, websocket: WebSocket, db: Session = Depends(get_db)
):
    await websocket.accept()
    user = db.query(User).filter(User.user_id == driver_id).first()
    if not user or not user.driver:
        await websocket.close(code=1008)
        return
    manager.connect_driver(driver_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            lat = data.get("latitude")
            lon = data.get("longitude")
            if lat is None or lon is None:
                await websocket.send_json(
                    {"error": "latitude and longitude required"}
                )
                continue
            # Guardar en BD
            loc = Location(user_id=driver_id, latitude=lat, longitude=lon)
            db.add(loc)
            db.commit()
            db.refresh(loc)
            message = {
                "latitude": lat,
                "longitude": lon,
                "timestamp": loc.timestamp.isoformat(),
            }
            # Enviar a followers
            await manager.broadcast_to_followers(driver_id, message)
    except WebSocketDisconnect:
        manager.disconnect_driver(driver_id)


# ------------------------------------------------------------------------------
# 6. WebSocket endpoint for follower to receive GPS data
# ------------------------------------------------------------------------------
@app.websocket("/ws/follow/{follower_id}/{driver_id}")
async def ws_follow(
    follower_id: int,
    driver_id: int,
    websocket: WebSocket,
    db: Session = Depends(get_db),
):
    await websocket.accept()
    follower = db.query(User).filter(User.user_id == follower_id).first()
    if (
        not follower
        or not follower.linked
        or follower.follow_target_id != driver_id
    ):
        await websocket.close(code=1008)
        return
    manager.connect_follower(driver_id, websocket)
    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        manager.disconnect_follower(driver_id, websocket)


# ------------------------------------------------------------------------------
# 7. Endpoint para iniciar conexión de frontend
# ------------------------------------------------------------------------------
@app.post("/connect-driver")
def connect_driver_endpoint(
    conn: ConnectionData, db: Session = Depends(get_db)
):
    driver = db.query(User).filter(User.user_id == conn.driver_id).first()
    follower = db.query(User).filter(User.user_id == conn.follower_id).first()
    if not driver or not driver.driver:
        raise HTTPException(
            status_code=404, detail="Driver not found or not a driver"
        )
    if not follower:
        raise HTTPException(status_code=404, detail="Follower not found")
    follower.linked = True
    follower.follow_target_id = conn.driver_id
    db.commit()
    return {
        "connected": True,
        "follower_id": follower.user_id,
        "driver_id": driver.user_id,
    }


# ------------------------------------------------------------------------------
# 8. Conexión a WiFi
# (sin cambios)
# ------------------------------------------------------------------------------
@app.post("/connect-rpi-wifi")
def connect_rpi_wifi(
    wifi_data: WifiCredentials,
    db: Session = Depends(get_db),
    user_id: int = None,
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    command = [
        "nmcli",
        "dev",
        "wifi",
        "connect",
        wifi_data.ssid,
        "password",
        wifi_data.password,
    ]
    try:
        result = subprocess.run(command, capture_output=True, text=True)
        print("probando conexión a WiFi")
        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Error connecting to WiFi: {result.stderr}",
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Exception: {str(e)}")
    return {
        "message": f"Connected to WiFi SSID '{wifi_data.ssid}' successfully"
    }
