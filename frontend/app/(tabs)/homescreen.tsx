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

  // Pantalla 1: Esperando guía
  if (screen === "home") {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.driverButton}>
          <Text style={styles.driverText}>Driver</Text>
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
        <TouchableOpacity style={styles.driverButton}>
          <Text style={styles.driverText}>Driver</Text>
        </TouchableOpacity>
        <MapComponent></MapComponent>
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
        <TouchableOpacity style={styles.driverButton}>
          <Text style={styles.driverText}>Driver</Text>
        </TouchableOpacity>
        <MapComponent></MapComponent>
        <TouchableOpacity
          style={styles.endButton}
          onPress={() => setScreen("home")}
        >
          <Text style={styles.endButtonText}>Finalizar trayecto</Text>
        </TouchableOpacity>

        <Text style={styles.mainText}>Siguiendo a Platooning....</Text>

        <View style={styles.infoBox}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Dinero ahorrado:</Text>
            <Animated.Image
              source={require("../../assets/images/coinss.png")}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.bar} />

          <View style={[styles.statRow, { marginTop: 20 }]}>
            <Text style={styles.statLabel}>Km optimizados</Text>
            <Animated.Image
              source={require("../../assets/images/measure.webp")}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.bar} />
        </View>
      </View>
    );
  }

  return null;
}

// 🔧 ESTILOS
const styles = StyleSheet.create({
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
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 20,
    position: "absolute",
    bottom: 150,
  },
  truck: {
    width: 100,
    height: 100,
    position: "absolute",
    bottom: 80,
  },
  driverButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "#A8BBC6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    zIndex: 10,
  },
  driverText: {
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
    borderRadius: 5,
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
});
