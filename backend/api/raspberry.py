import threading
import socket
from datetime import datetime
from sqlalchemy.orm import Session
from api.models import Location, User, get_db
import time

UDP_PORT = 5005  # The same port your Pi sends to
LISTEN_IP = "0.0.0.0"  # Listen on all interfaces


def start_udp_listener(app, db_session_factory):
    def listen():
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.bind((LISTEN_IP, UDP_PORT))
        print(f"✅ Listening for UDP data on port {UDP_PORT}...")

        while True:
            try:
                data, addr = sock.recvfrom(1024)  # Buffer size
                decoded = data.decode("utf-8").strip()
                print(f"📡 Received: {decoded} from {addr}")
                lat, lon = map(float, decoded.split(","))

                # For testing, let's assume it's always user_id = 1
                user_id = 1

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
