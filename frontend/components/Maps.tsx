import { getPosition } from "@/app/(tabs)/routing";
import { useEffect, useState } from "react";
import { View, ImageBackground, Dimensions } from "react-native";
import resolveAssetSource from "react-native/Libraries/Image/resolveAssetSource";

const imageSource = require("../assets/images/MapaAntenas.png");
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

export default function MapComponent({ screen }: { screen: string }) {
  // Simulando datos estáticos (puedes cambiar por datos reales con getPosition)
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [driverLat, setDriverLat] = useState<number | null>(null);
  const [driverLon, setDriverLon] = useState<number | null>(null);

  useEffect(() => {
    const fetchPositions = async () => {
      const userPosition = await getPosition(1); // User position
      const driverPosition = await getPosition(2); // Driver position

      if (userPosition) {
        setUserLat(userPosition.latitude);
        setUserLon(userPosition.longitude);
      }
      if (driverPosition) {
        setDriverLat(driverPosition.latitude);
        setDriverLon(driverPosition.longitude);
      }
    };

    fetchPositions();
    const interval = setInterval(fetchPositions, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const [userPixel, setUserPixel] = useState({ x: 0, y: 0 });
  const [driverPixel, setDriverPixel] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (userLat && userLon) {
      const pixel = latLonToPixel(userLat, userLon);
      setUserPixel({
        x: pixel.x - 30,
        y: pixel.y + 25,
      });
    }
    if (screen === "home2" || screen === "home3") {
      if (driverLat && driverLon) {
        const pixel = latLonToPixel(driverLat, driverLon);
        setDriverPixel({
          x: pixel.x + 20,
          y: pixel.y + 8,
        });
      }
    }
  }, [userLat, userLon, driverLat, driverLon, screen]);

  console.log(screen);

  return (
    <View style={{ width: screenWidth, height: imageHeight }}>
      <ImageBackground
        source={imageSource}
        style={{ width: "100%", height: "100%" }}
        resizeMode="contain"
      >
        {/* User Marker */}
        <View
          style={{
            position: "absolute",
            left: userPixel.x,
            top: userPixel.y,
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
              left: driverPixel.x,
              top: driverPixel.y,
              width: 15,
              height: 15,
              borderRadius: 7.5,
              backgroundColor: "blue",
            }}
          />
        )}

        {/* Linea entre ellos */}
        {(screen === "home2" || screen === "home3") && (
          <View
            style={{
              position: "absolute",
              top: userPixel.y + 7.5, // Center vertically with marker
              left: userPixel.x + 7.5, // Center horizontally with marker
              width: Math.hypot(
                driverPixel.x - userPixel.x,
                driverPixel.y - userPixel.y
              ),
              height: 2,
              backgroundColor: "blue",
              transformOrigin: "0 0",
              transform: [
                {
                  rotate: `${Math.atan2(
                    driverPixel.y - userPixel.y,
                    driverPixel.x - userPixel.x
                  )}rad`,
                },
              ],
              zIndex: -1, // Add this to ensure line appears below markers
            }}
          />
        )}
      </ImageBackground>
    </View>
  );
}
