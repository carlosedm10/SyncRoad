import json
import threading
import socket
from datetime import datetime
from sqlalchemy.orm import Session
from api.models import Location, User, get_db
import time

UDP_PORT_IN = 5005  # The same port your Pi sends to
UDP_IP = "0.0.0.0"  # Local IP

UPD_PORT_OUT = 5006


def udp_listener(app, db_session_factory):
    def listen():
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.bind((UDP_IP, UDP_PORT_IN))
        print(f"✅ Listening for UDP data on {UDP_IP}:{UDP_PORT_IN}...")

        while True:
            try:
                data, addr = sock.recvfrom(1024)  # Buffer size
                decoded = data.decode("utf-8").strip()
                print(f"📡 Received: {data} from {addr}")
                coords = json.loads(decoded)
                user_id, lat, lon = (
                    coords["user_id"],
                    coords["lat"],
                    coords["lon"],
                )

                db: Session = db_session_factory()
                user = db.query(User).filter_by(id=user_id).first()
                if user:
                    location = db.query(Location).filter_by(user_id=user_id).first()
                    if location:
                        location.latitude = lat
                        location.longitude = lon
                        location.timestamp = datetime.utcnow()
                    else:
                        new_location = Location(
                            user_id=user_id,
                            latitude=lat,
                            longitude=lon,
                            timestamp=datetime.utcnow(),
                        )
                        db.add(new_location)
                    db.commit()
                    db.close()
                else:
                    print(f"⚠️ User {user_id} not found.")
            except Exception as e:
                print(f"❌ UDP Listener error: {e}")
                time.sleep(1)

    thread = threading.Thread(target=listen, daemon=True)
    thread.start()


def udp_sender(flag: str | bool):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    dest = ("host.docker.internal", UPD_PORT_OUT)
    sock.sendto(str(flag).encode(), dest)
    print(f"\n✅ Sent flag={flag} → {dest}")
