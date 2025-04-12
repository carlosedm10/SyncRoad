import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Botón "Driver" */}
      <TouchableOpacity style={styles.driverButton}>
        <Text style={styles.driverText}>Driver</Text>
      </TouchableOpacity>

      {/* Cuadro informativo */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Hemos encontrado al guía{"\n"}
          Platooning con destino Buenos Aires.
        </Text>
        <Text style={styles.boldText}>¿Quieres seguirle?</Text>

        {/* Botones SI / NO */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.yesButton}>
            <Text style={styles.buttonLabel}>SI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.noButton}>
            <Text style={styles.buttonLabel}>NO</Text>
          </TouchableOpacity>
        </View>
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
  infoBox: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: "#A8BBC6",
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
    backgroundColor: "#C8FF94", // verde claro
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  noButton: {
    backgroundColor: "#F26262", // rojo
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
});
