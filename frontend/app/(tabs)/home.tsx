import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function HomeScreen() {
  const translateX = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    const animateTruck = () => {
      translateX.setValue(-100); // Comienza fuera de pantalla
      Animated.timing(translateX, {
        toValue: SCREEN_WIDTH,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        animateTruck(); // Reinicia cuando llega al final
      });
    };

    animateTruck();
  }, [translateX]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Buscando guías cercanos...</Text>
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
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    marginBottom: 40,
    color: "#333",
  },
  truck: {
    width: 160,
    height: 120,
    position: "absolute",
    bottom: 80,
  },
});
