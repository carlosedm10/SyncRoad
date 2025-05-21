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
  const [screen, setScreen] = useState<"home0" | "home" | "home2" | "home3">(
    "home0",
  );
  const [ahorrado, setAhorrado] = useState(0);
  const [kmOptimizados, setKmOptimizados] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [followerLocation, setFollowerLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [userName, setUserName] = useState<string>("Jorge");

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
        ]),
      ).start();
    }
  }, [screen]);

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

  useEffect(() => {
    if (screen !== "home3") return;

    const interval = setInterval(() => {
      setAhorrado((prev) => prev + 1);
      setKmOptimizados((prev) => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, [screen]);

  useEffect(() => {
    if (screen !== "home3") return;

    const euroInterval = setInterval(() => {
      setAhorrado((prev) => prev + 1);
    }, 8000);

    return () => clearInterval(euroInterval);
  }, [screen]);

  useEffect(() => {
    if (screen !== "home3") return;

    const kmInterval = setInterval(() => {
      setKmOptimizados((prev) => prev + 1);
    }, 2000);

    return () => clearInterval(kmInterval);
  }, [screen]);

  // Pantalla 0: Pantalla inicial
  if (screen === "home0") {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.followerButton}>
          <Text style={styles.followerText}>Follower</Text>
        </TouchableOpacity>
        <View style={styles.mapContainer}>
          <MapComponent />
        </View>
        <View style={styles.waitingContent}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setScreen("home")}
          >
            <Text style={styles.searchButtonText}>Buscar guía</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Pantalla 1: Esperando guía
  if (screen === "home") {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.followerButton}>
          <Text style={styles.followerText}>Follower</Text>
        </TouchableOpacity>

        <View style={styles.mapContainer}>
          <MapComponent />
        </View>

        <View style={styles.waitingContent}>
          <Text style={styles.mainText}>Buscando guías cercanos...</Text>
          <Animated.Image
            source={require("../../assets/images/truck1.png")}
            style={[styles.truck, { transform: [{ translateX }] }]}
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
                const response = await updateDriver(userId, false, true);
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
              onPress={() => setScreen("home0")} // ✅ CAMBIADO A PANTALLA 0
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
          <MapComponent
            driverLocation={driverLocation}
            followerLocation={followerLocation}
            userName={userName}
          />
        </View>
        <TouchableOpacity
          style={styles.endButton}
          onPress={() => {
            setScreen("home0"); // ✅ FINALIZA Y VUELVE A PANTALLA 0
            setAhorrado(0);
            setKmOptimizados(0);
            updateDriver(userId, false, false);
          }}
        >
          <Text style={styles.endButtonText}>Finalizar trayecto</Text>
        </TouchableOpacity>

        <Text style={styles.followingText}>Siguiendo a Platooning....</Text>

        <View style={styles.infoBox}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.circle}>
                <Text style={styles.circleText}>{ahorrado}</Text>
              </View>
              <Text style={styles.statLabel}>Euros ahorrados</Text>
            </View>
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

// 🎨 ESTILOS
const styles = StyleSheet.create({
  mapContainer: {
    width: "100%",
    height: 350,
    marginTop: 60,
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
    marginTop: 20,
  },
  mainText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    position: "absolute",
    bottom: 170,
    whiteSpace: "nowrap",
    textAlign: "center",
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
  statLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
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
  searchButton: {
    backgroundColor: "#F26262",
    paddingVertical: 15,
    paddingHorizontal: 120,
    borderRadius: 20,
    marginBottom: 0,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
