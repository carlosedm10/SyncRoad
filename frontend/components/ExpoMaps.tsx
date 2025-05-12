import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView from 'expo-maps'; // import expo-maps

const ExpoMaps = () => {
  // Random coordinates, for example purposes (latitude and longitude)
  const randomLatitude = 37.78825; // Random Latitude
  const randomLongitude = -122.4324; // Random Longitude

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: randomLatitude,
          longitude: randomLongitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <MapView.Marker coordinate={{ latitude: randomLatitude, longitude: randomLongitude }} />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default ExpoMaps;
