// frontend/components/InteractiveMap.tsx
import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";

interface Location {
  latitude: number;
  longitude: number;
}

interface Props {
  userLocation: Location;
  driverLocation?: Location;
}

const InteractiveMap: React.FC<Props> = ({ userLocation, driverLocation }) => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker coordinate={userLocation} title="Tú" pinColor="blue" />
        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            title="Conductor"
            pinColor="red"
          />
        )}
      </MapView>
    </View>
  );
};

export default InteractiveMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
