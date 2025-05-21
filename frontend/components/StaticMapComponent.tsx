import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface StaticMapComponentProps {
  imageSource: any; // require('path/to/image.png')
  imageWidth: number;
  imageHeight: number;
  minLat: number;      // 39.479566 (bottom left)
  maxLat: number;      // 39.480051 (top right)
  minLng: number;      // -0.343956 (bottom left)
  maxLng: number;      // -0.342979 (top right)
  userLocation?: {
    lat: number;
    lng: number;
  } | null;
  // ...add more props if needed...
}

const StaticMapComponent: React.FC<StaticMapComponentProps> = ({
  imageSource,
  imageWidth,
  imageHeight,
  userLocation,
  minLat,
  maxLat,
  minLng,
  maxLng,
}) => {
  const calculatePixelCoordinates = (latitude: number, longitude: number) => {
    const latRange = maxLat - minLat;
    const lngRange = maxLng - minLng;

    const latPercentage = (latitude - minLat) / latRange;
    const lngPercentage = (longitude - minLng) / lngRange;

    const x = lngPercentage * imageWidth;
    const y = (1 - latPercentage) * imageHeight; // Invert latitude calculation

    return { x, y };
  };

  return (
    <View style={styles.container}>
      <Image source={imageSource} style={{ width: imageWidth, height: imageHeight }} />
      {userLocation && (
        <View
          style={{
            position: 'absolute',
            left: calculatePixelCoordinates(userLocation.lat, userLocation.lng).x - 5, // Adjust for pin size
            top: calculatePixelCoordinates(userLocation.lat, userLocation.lng).y - 5, // Adjust for pin size
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: 'red', // Pin color
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});

export default StaticMapComponent;
