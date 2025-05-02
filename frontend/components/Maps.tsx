import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";

// CARLOS API KEY, OJO CON ESTO QUE ME COBRAN SI LA LIAMOS XD
const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

type MapComponentProps = {
  driverLocation?: { lat: number; lng: number };
  followerLocation?: { lat: number; lng: number };
  userName?: string;
};

const MapComponent: React.FC<MapComponentProps> = ({
  driverLocation,
  followerLocation,
  userName,
}) => {
  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const mapRef = useRef<google.maps.Map>();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    if (driverLocation && followerLocation) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: driverLocation,
          destination: followerLocation,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error(`Error fetching directions ${result}`, status);
          }
        }
      );
    }
  }, [driverLocation, followerLocation]);

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation}
        zoom={12}
        onLoad={onLoad}
      >
        <Marker
          position={userLocation}
          label={
            userName
              ? {
                  text: userName,
                  style: { fontWeight: "bold" },
                }
              : undefined
          }
        />
        {driverLocation && <Marker position={driverLocation} label="Driver" />}
        {followerLocation && (
          <Marker position={followerLocation} label="Follower" />
        )}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: "#0000FF",
                strokeOpacity: 0.8,
                strokeWeight: 5,
              },
              suppressMarkers: true,
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
