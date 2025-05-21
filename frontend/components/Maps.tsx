import { getPosition } from "@/app/(tabs)/routing";
import { useEffect, useState } from "react";
import { View, Image, ImageBackground, Dimensions } from "react-native";
import resolveAssetSource from "react-native/Libraries/Image/resolveAssetSource"; // ✅ Import correcto

const imageSource = require("../assets/images/Mapa Antenas.png");
const { width: screenWidth } = Dimensions.get("window");

const { width: imageOriginalWidth, height: imageOriginalHeight } =
  resolveAssetSource(imageSource); // ✅ Usado correctamente
const imageHeight = screenWidth * (imageOriginalHeight / imageOriginalWidth);

console.log("Screen Width:", screenWidth);
console.log("Image Source Dimensions:", resolveAssetSource(imageSource));

const topLeft = { lat: 39.4800046, lon: -0.343775 };
const topRight = { lat: 39.47981, lon: -0.343041 };
const bottomLeft = { lat: 39.479791, lon: -0.343885 };
const bottomRight = { lat: 39.479584, lon: -0.34317 };

function latLonToPixel(lat: number, lon: number) {
  const latMin = Math.min(bottomLeft.lat, bottomRight.lat);
  const latMax = Math.max(topLeft.lat, topRight.lat);
  const lonMin = Math.min(bottomLeft.lon, topLeft.lon);
  const lonMax = Math.max(bottomRight.lon, topRight.lon);

  const x = ((lon - lonMin) / (lonMax - lonMin)) * screenWidth;
  const y = ((latMax - lat) / (latMax - latMin)) * imageHeight;

  return { x, y };
}

export default function MapComponent({ screen }) {
  // Simulando datos estáticos (puedes cambiar por datos reales con getPosition)
  const userLat = 39.479791;
  const userLon = -0.343885;
  const driverLat = 39.479584;
  const driverLon = -0.34317;

  const [userPixel, setUserPixel] = useState({ x: 0, y: 0 });
  const [driverPixel, setDriverPixel] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (userLat && userLon) {
      setUserPixel(latLonToPixel(userLat, userLon));
    }
    if ((screen === "home2" || screen === "home3") && driverLat && driverLon) {
      setDriverPixel(latLonToPixel(driverLat, driverLon));
    }
  }, [userLat, userLon, driverLat, driverLon, screen]);

  return (
    <View style={{ width: screenWidth, height: imageHeight }}>
      <ImageBackground
        source={imageSource}
        style={{ width: "100%", height: "100%" }}
      >
        {/* User Marker */}
        <View
          style={{
            position: "absolute",
            left: userPixel.x - 7.5,
            top: userPixel.y - 7.5,
            width: 15,
            height: 15,
            borderRadius: 7.5,
            backgroundColor: "red",
          }}
        />

        {/* Driver Marker */}
        {(screen === "home2" || screen === "home3") && (
          <View
            style={{
              position: "absolute",
              left: driverPixel.x - 7.5,
              top: driverPixel.y - 7.5,
              width: 15,
              height: 15,
              borderRadius: 7.5,
              backgroundColor: "red",
            }}
          />
        )}

        {/* Linea entre ellos */}
        {(screen === "home2" || screen === "home3") && (
          <View
            style={{
              position: "absolute",
              top: Math.min(userPixel.y, driverPixel.y),
              left: Math.min(userPixel.x, driverPixel.x),
              width: Math.hypot(
                driverPixel.x - userPixel.x,
                driverPixel.y - userPixel.y
              ),
              height: 2,
              backgroundColor: "blue",
              transform: [
                {
                  rotate: `${Math.atan2(
                    driverPixel.y - userPixel.y,
                    driverPixel.x - userPixel.x
                  )}rad`,
                },
              ],
            }}
          />
        )}
      </ImageBackground>
    </View>
  );
}
