# udp_bridge.py

import socket, threading, time

PI_IP = "10.42.0.1"
MAC_IP = "10.42.0.150"

# Incoming from Pi
MAC_PORT_FROM_PI = 5004
# Outgoing to Docker
DOCKER_PORT_HOST = 5005

# Incoming from Docker
MAC_PORT_FROM_DOCKER = 5006
# Outgoing to Pi
PI_PORT_RECV = 5004

# 1) Socket to receive GPS from Pi
sock_pi = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock_pi.bind((MAC_IP, MAC_PORT_FROM_PI))

# 2) Socket to receive booleans from Docker
sock_docker = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock_docker.bind(("0.0.0.0", MAC_PORT_FROM_DOCKER))

# 3) Single socket for sending
sock_out = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)


def forward_pi_to_docker():
    while True:
        data, _ = sock_pi.recvfrom(4096)
        print(f"\n⟵ Pi → Mac on {MAC_PORT_FROM_PI}, data: {data!r}")
        # forward into the container via host loopback
        sock_out.sendto(data, ("127.0.0.1", DOCKER_PORT_HOST))
        print(f"⟶ Mac → Docker at 127.0.0.1:{DOCKER_PORT_HOST}")
        time.sleep(1)


def forward_docker_to_pi():
    while True:
        data, _ = sock_docker.recvfrom(4096)
        print(f"\n⟵ Docker → Mac on {MAC_PORT_FROM_DOCKER}: {data!r}")
        # forward back to the Pi
        sock_out.sendto(data, (PI_IP, PI_PORT_RECV))
        print(f"⟶ Mac → Pi at {PI_IP}:{PI_PORT_RECV}")
        time.sleep(1)


threading.Thread(target=forward_pi_to_docker, daemon=True).start()
threading.Thread(target=forward_docker_to_pi, daemon=True).start()

print("UDP bridge running on Mac. Press Ctrl-C to stop.")
while True:
    time.sleep(1)
