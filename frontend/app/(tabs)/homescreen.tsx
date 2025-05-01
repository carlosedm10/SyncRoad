import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from "react-native";
import { getPosition, updateDriver } from "./routing";
import MapComponent from "@/components/Maps";

export default function HomeScreen({ userId }: { userId: number }) {
  const [screen, setScreen] = useState<"home" | "home2" | "home3">("home");
  const [ahorrado, setAhorrado] = useState(0);
  const [kmOptimizados, setKmOptimizados] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  // Animación del camión de izquierda a derecha
  useEffect(() => {
    if (screen === "home") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: 100,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [screen]);

  // Polling para detectar llegada de coordenadas (pasar a home2)
  useEffect(() => {
    if (screen !== "home") return;

    const interval = setInterval(async () => {
      const position = await getPosition(userId);
      if (position) {
        setScreen("home2");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [screen, userId]);
  // Polling para actualizar ahorrado y km optimizados
  useEffect(() => {
    if (screen !== "home3") return;

    const interval = setInterval(() => {
      setAhorrado((prev) => prev + 1);
      setKmOptimizados((prev) => prev + 1);
    }, 60000); // cada minuto

    return () => clearInterval(interval);
  }, [screen]);

  // Incrementar euros ahorrados cada 8 segundos
  useEffect(() => {
    if (screen !== "home3") return;

    const euroInterval = setInterval(() => {
      setAhorrado((prev) => prev + 1);
    }, 8000); // ✅ cada 8 segundos

    return () => clearInterval(euroInterval);
  }, [screen]);

  // Incrementar kilómetros optimizados cada 2 segundos
  useEffect(() => {
    if (screen !== "home3") return;

    const kmInterval = setInterval(() => {
      setKmOptimizados((prev) => prev + 1);
    }, 2000); // ✅ cada 2 segundos

    return () => clearInterval(kmInterval);
  }, [screen]);

  // Pantalla 1: Esperando guía
  if (screen === "home") {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.followerButton}>
          <Text style={styles.followerText}>Follower</Text>
        </TouchableOpacity>

        <View style={styles.waitingContent}>
          <Text style={styles.mainText}>Buscando guías cercanos...</Text>

          {/* Camión animado */}
          <Animated.Image
            source={require("../../assets/images/truck1.png")}
            style={[
              styles.truck,
              {
                transform: [{ translateX }],
              },
            ]}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  }

  // Pantalla 2: ¿Quieres seguirle?
  if (screen === "home2") {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.followerButton}>
          <Text style={styles.followerText}>Follower</Text>
        </TouchableOpacity>
        <View style={styles.mapContainer}>
          <MapComponent />
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Hemos encontrado al guía{"\n"}
            Platooning con destino Buenos Aires.
          </Text>
          <Text style={styles.boldText}>¿Quieres seguirle?</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.yesButton}
              onPress={async () => {
                const response = await updateDriver(userId, true, false);
                if (response?.updated) {
                  setScreen("home3");
                } else {
                  Alert.alert("Error", "No se pudo conectar.");
                }
              }}
            >
              <Text style={styles.buttonLabel}>SI</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.noButton}
              onPress={() => setScreen("home")}
            >
              <Text style={styles.buttonLabel}>NO</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Pantalla 3: Siguiendo al guía
  if (screen === "home3") {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.followerButton}>
          <Text style={styles.followerText}>Follower</Text>
        </TouchableOpacity>
        <View style={styles.mapContainer}>
          <MapComponent />
        </View>
        <TouchableOpacity
          style={styles.endButton}
          onPress={() => {
            setScreen("home");
            setAhorrado(0);
            setKmOptimizados(0);
          }}
        >
          <Text style={styles.endButtonText}>Finalizar trayecto</Text>
        </TouchableOpacity>

        <Text style={styles.followingText}>Siguiendo a Platooning....</Text>

        <View style={styles.infoBox}>
          <View style={styles.statsContainer}>
            {/* Dinero */}
            <View style={styles.statItem}>
              <View style={styles.circle}>
                <Text style={styles.circleText}>{ahorrado}</Text>
              </View>
              <Text style={styles.statLabel}>Euros ahorrados</Text>
            </View>

            {/* Km optimizados */}
            <View style={styles.statItem}>
              <View style={styles.circle}>
                <Text style={styles.circleText}>{kmOptimizados}</Text>
              </View>
              <Text style={styles.statLabel}>Km optimizados</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return null;
}

// 🔧 ESTILOS
const styles = StyleSheet.create({
  mapContainer: {
    width: "100%",
    height: 350, // ajusta esta altura según el espacio que quieras
    marginTop: 60, // esto empuja el mapa hacia abajo para dejar espacio al botón "Follower"
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 20,
    position: "relative",
    alignItems: "center",
  },
  waitingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 60,
  },
  mainText: {
    fontSize: 16,
    alignSelf: "center",
    fontWeight: "bold",
    marginBottom: 20,
    position: "absolute",
    bottom: 170,
    whiteSpace: "nowrap",
  },
  truck: {
    width: 100,
    height: 100,
    position: "absolute",
    bottom: 80,
  },
  followerButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "#A8BBC6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    zIndex: 10,
  },
  followerText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  endButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#F26262",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    zIndex: 10,
  },
  endButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  infoBox: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#DCE3E6",
    borderRadius: 30,
    padding: 20,
    alignItems: "center",
  },
  infoText: {
    fontSize: 16,
    textAlign: "center",
    color: "#000",
    marginBottom: 10,
  },
  boldText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 20,
  },
  yesButton: {
    backgroundColor: "#C8FF94",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  noButton: {
    backgroundColor: "#F26262",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonLabel: {
    fontWeight: "bold",
    color: "#000",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  bar: {
    backgroundColor: "#A8BBC6",
    height: 15,
    borderRadius: 10,
    marginTop: 6,
    width: "100%",
  },
  icon: {
    width: 40,
    height: 40,
  },

  followingText: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },

  statItem: {
    alignItems: "center",
    marginHorizontal: 10,
  },

  statIcon: {
    width: 40,
    height: 40,
    marginBottom: 10,
  },

  circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 10,
  },

  circleText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
});
