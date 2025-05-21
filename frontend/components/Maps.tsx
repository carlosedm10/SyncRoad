import { getPosition } from "@/app/(tabs)/routing";
import React, { useEffect, useState } from "react";
import { View, Image, ImageBackground, Dimensions } from "react-native";
import Svg, { Line } from "react-native-svg";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const imageSource = require("assets/images/Mapa Antenas.png");
const { width: screenWidth } = Dimensions.get("window");
console.log("Screen Width:", screenWidth);
console.log("Image Source:", imageSource);
console.log("Image Source URI:", imageSource.uri);
console.log("Image Source Width:", imageSource.width);
console.log("Image Source Height:", imageSource.height);
console.log("Image Source Dimensions:", Image.resolveAssetSource(imageSource));
const { width: imageOriginalWidth, height: imageOriginalHeight } =
  Image.resolveAssetSource(imageSource);
const imageHeight = screenWidth * (imageOriginalHeight / imageOriginalWidth);

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
  const userPosition = getPosition(1);
  console.log("User Position:", userPosition);

  const driverPosition = getPosition(2);
  console.log("Driver Position:", driverPosition);

  //const userLat = userPosition.lat;
  //const userLon = userPosition.lon;
  //const driverLat = driverPosition.lat;
  //const driverLon = driverPosition.lon;

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
    if (screen === undefined && driverLat && driverLon) {
      setDriverPixel(latLonToPixel(driverLat, driverLon));
    }
  }, [userLat, userLon, driverLat, driverLon]);

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

        {/* Connecting Line */}
        {(screen === "home2" || screen === "home3") && (
          <Svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: screenWidth,
              height: imageHeight,
            }}
          >
            <Line
              x1={userPixel.x}
              y1={userPixel.y}
              x2={driverPixel.x}
              y2={driverPixel.y}
              stroke="blue"
              strokeWidth={2}
            />
          </Svg>
        )}
      </ImageBackground>
    </View>
  );
}
