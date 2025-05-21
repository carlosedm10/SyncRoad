import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface StaticMapComponentProps {
  imageSource: any; // require('path/to/image.png')
  imageWidth: number;
  imageHeight: number;
  userLocation: {
    lat: number;
    lng: number;
  } | null;
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
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
