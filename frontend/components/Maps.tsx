import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
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
  userName?: string;
};

const MapComponent: React.FC<MapComponentProps> = ({ userName }) => {
  console.log("userName prop:", userName);

  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [driverLocation, setFollowerLocation] = useState({
    lat: 37.7739,
    lng: -122.4184,
  });
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const mapRef = useRef<google.maps.Map>();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setFollowerLocation({
            lat: latitude + 0.005,
            lng: longitude + 0.005,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        },
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  const calculateRoute = () => {
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: userLocation,
        destination: driverLocation,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error(`Error fetching directions ${result}`, status);
        }
      },
    );
  };

  useEffect(() => {
    if (mapRef.current) {
      calculateRoute();
    }
  }, [userLocation, driverLocation]);

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    calculateRoute();
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
              : {
                  text: "User",
                  style: { fontWeight: "bold" },
                }
          }
        />
        <Marker position={driverLocation} label="Driver" />
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
