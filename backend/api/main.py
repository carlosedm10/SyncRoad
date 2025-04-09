# main.py
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from api.models import (
    Base,
    UserCredentials,
    UserRegistration,
    LocationUpdate,
    engine,
    User,
    Location,
    get_db,
)
from passlib.context import CryptContext

Base.metadata.create_all(bind=engine)  # Crea o actualiza las tablas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI()


@app.get("/")
def read_root():
    return "Hello, there is nothing intereseting here. VISIT: http://localhost:8000/docs"


@app.post("/login")
def login(user_data: UserCredentials, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(
            status_code=404, detail="User not found. Please sign up."
        )
    if not pwd_context.verify(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    # Retornamos información relevante, incluyendo el rol
    return {
        "login_successful": True,
        "role": user.role,
        "user_id": user.user_id,
    }


@app.post("/create-user")
def create_user(user_data: UserRegistration, db: Session = Depends(get_db)):
    already_existing_user = (
        db.query(User).filter(User.email == user_data.email).first()
    )
    if already_existing_user:
        raise HTTPException(status_code=409, detail="User already exists")

    try:
        hashed_password = pwd_context.hash(user_data.password)
        new_user = User(
            email=user_data.email,
            password=hashed_password,
            role=user_data.role,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "message": "User created successfully",
        "user_id": new_user.user_id,
        "role": new_user.role,
    }


@app.post("/update-location")
def update_location(
    location_data: LocationUpdate,
    db: Session = Depends(get_db),
    user_id: int = None,
):
    """
    Este endpoint recibe la latitud y longitud,
    y actualiza la ubicación en la base de datos.

    En un escenario real, probablemente querrías
    obtener el user_id desde un token de autenticación
    y no pasarlo como parámetro.
    Aquí lo dejamos sencillo para mostrar la lógica.
    """

    # Verificamos que el usuario existe
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verificamos que sea un usuario "seguido"
    if user.role != "seguido":
        raise HTTPException(
            status_code=403, detail="User is not 'seguido' role"
        )

    # Creamos el registro de ubicación
    new_location = Location(
        user_id=user_id,
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


@app.get("/get-last-location/{followed_user_id}")
def get_last_location(
    followed_user_id: int, db: Session = Depends(get_db), user_id: int = None
):
    """
    Retorna la última ubicación registrada de la persona seguida.
    'user_id' podría ser el que realiza la consulta (en un proyecto real,
    se obtendría de un token y se validarían permisos).
    """

    # Verificamos que el "seguido" existe
    followed_user = (
        db.query(User).filter(User.user_id == followed_user_id).first()
    )
    if not followed_user:
        raise HTTPException(status_code=404, detail="Followed user not found")

    # (Opcional) Verificamos que el solicitante sea "seguidor"
    # y tenga permiso para ver la ubicación del 'followed_user'
    requesting_user = db.query(User).filter(User.user_id == user_id).first()
    if requesting_user is None:
        raise HTTPException(
            status_code=404, detail="Requesting user not found"
        )

    if requesting_user.role != "seguidor":
        raise HTTPException(
            status_code=403,
            detail="Only 'seguidores' can access this information",
        )

    # Obtenemos la última ubicación del usuario seguido
    last_location = (
        db.query(Location)
        .filter(Location.user_id == followed_user_id)
        .order_by(Location.timestamp.desc())
        .first()
    )

    if not last_location:
        return {"message": "No location found for this user"}

    return {
        "user_id": followed_user_id,
        "latitude": last_location.latitude,
        "longitude": last_location.longitude,
        "timestamp": last_location.timestamp,
    }
