import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Botón Driver */}
      <TouchableOpacity style={styles.driverButton}>
        <Text style={styles.driverText}>Driver</Text>
      </TouchableOpacity>

      {/* Botón Finalizar trayecto */}
      <TouchableOpacity style={styles.endButton}>
        <Text style={styles.endButtonText}>Finalizar trayecto</Text>
      </TouchableOpacity>

      {/* Texto principal */}
      <Text style={styles.mainText}>Siguiendo a Platooning....</Text>

      {/* Cuadro inferior con estadísticas */}
      <View style={styles.infoBox}>
        {/* Dinero ahorrado */}
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Dinero ahorrado:</Text>
          <Image
            source={require("../../assets/images/coinss.png")}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
        <View style={styles.bar} />

        {/* Km optimizados */}
        <View style={[styles.statRow, { marginTop: 20 }]}>
          <Text style={styles.statLabel}>Km optimizados</Text>
          <Image
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 20,
    position: "relative",
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
  mainText: {
    marginTop: 100,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
  infoBox: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#DCE3E6",
    borderRadius: 30,
    padding: 20,
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
  },
  icon: {
    width: 40,
    height: 40,
  },
});
