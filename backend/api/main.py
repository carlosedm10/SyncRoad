# main.py
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import subprocess

from api.models import (
    Base,
    UserCredentials,
    DriverData,
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


@app.get("/")
def read_root():
    return "Hello, there is nothing interesting here. VISIT: http://localhost:8000/docs"


# ------------------------------------------------------------------------------
# 1. Login de usuario (solo verifica email/pass, devuelve booleans)
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
# 2. Crear un nuevo usuario (por defecto, driver=False, linked=False)
# ------------------------------------------------------------------------------
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
    }


# ------------------------------------------------------------------------------
# 4. Actualizar driver/linked
# ------------------------------------------------------------------------------
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

    return {
        "success": True,
        "user_id": user.user_id,
        "driver": user.driver,
        "linked": user.linked,
    }


# ------------------------------------------------------------------------------
# 5. Actualizar ubicación (solo si driver=True)
# ------------------------------------------------------------------------------
@app.post("/update-location")
def update_location(
    location_data: LocationUpdate,
    db: Session = Depends(get_db),
    user_id: int = None,
):
    """
    Registra la latitud/longitud en la base de datos para user_id.
    Normalmente se extraería user_id de un token JWT. Aquí lo hacemos simple.
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Si el usuario no es "driver", no puede actualizar ubicación
    if not user.driver:
        raise HTTPException(status_code=403, detail="User is not a driver")

    new_location = Location(
        user_id=user.user_id,
        latitude=location_data.latitude,
        longitude=location_data.longitude,
    )
    db.add(new_location)
    db.commit()
    db.refresh(new_location)

    return {
        "message": "Location updated successfully",
        "location_id": new_location.location_id,
        "user_id": user_id,
    }


# ------------------------------------------------------------------------------
# 6. Obtener la última ubicación (solo si linked=True)
# ------------------------------------------------------------------------------
@app.get("/get-last-location/{driver_user_id}")
def get_last_location(
    driver_user_id: int, db: Session = Depends(get_db), user_id: int = None
):
    """
    Retorna la última ubicación registrada de la persona 'driver_user_id'.
    Se asume que el solicitante (user_id) es un "linked".
    """
    # Verificamos que el "driver" existe
    driver_user = db.query(User).filter(User.user_id == driver_user_id).first()
    if not driver_user:
        raise HTTPException(status_code=404, detail="Driver user not found")

    # Verificamos que el solicitante sea "linked"
    requesting_user = db.query(User).filter(User.user_id == user_id).first()
    if not requesting_user:
        raise HTTPException(
            status_code=404, detail="Requesting user not found"
        )

    if not requesting_user.linked:
        raise HTTPException(status_code=403, detail="User is not 'linked'")

    # Obtenemos la última ubicación
    last_location = (
        db.query(Location)
        .filter(Location.user_id == driver_user_id)
        .order_by(Location.timestamp.desc())
        .first()
    )
    if not last_location:
        return {"message": "No location found for this driver"}

    return {
        "driver_user_id": driver_user_id,
        "latitude": last_location.latitude,
        "longitude": last_location.longitude,
        "timestamp": last_location.timestamp,
    }


# ------------------------------------------------------------------------------
# 7. Conexión a WiFi (asumiendo que la app corre en la RPi con nmcli)
# ------------------------------------------------------------------------------
@app.post("/connect-rpi-wifi")
def connect_rpi_wifi(
    wifi_data: WifiCredentials,
    db: Session = Depends(get_db),
    user_id: int = None,
):
    """
    Conecta la Raspberry Pi a una red WiFi usando nmcli.
    Requiere permisos y que 'nmcli' esté instalado.
    """
    # (Opcional) validar que quien invoque sea un usuario válido
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
        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Error connecting to WiFi: {result.stderr}",
            )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Exception trying to connect to WiFi: {str(e)}",
        )

    return {
        "message": f"Connected to WiFi SSID '{wifi_data.ssid}' successfully"
    }
