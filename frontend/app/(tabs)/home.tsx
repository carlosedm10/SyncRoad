import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function HomeScreen() {
  const translateX = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    const animateTruck = () => {
      translateX.setValue(-100);
      Animated.timing(translateX, {
        toValue: SCREEN_WIDTH,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        animateTruck();
      });
    };

    animateTruck();
  }, [translateX]);

  return (
    <View style={styles.container}>
      {/* Botón "Driver" */}
      <TouchableOpacity style={styles.driverButton}>
        <Text style={styles.driverText}>Driver</Text>
      </TouchableOpacity>

      {/* Texto */}
      <Text style={styles.text}>Buscando guías cercanos...</Text>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  text: {
    fontSize: 16,
    color: "#333",
    position: "absolute",
    bottom: 180,
    alignSelf: "center",
  },
  truck: {
    width: 80,
    height: 100,
    position: "absolute",
    bottom: 80,
  },
});
