import React from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";

// CARLOS API KEY, OJO CON ESTO QUE ME COBRAN SI LA LIAMOS XD
const apiKey = "AIzaSyAqM4b9zR8tWZ4rGOz7PSS4OjOjme79y4U";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

type MapComponentProps = {
  location?: { lat: number; lng: number };
};

const MapComponent: React.FC<MapComponentProps> = ({ location }) => {
  const center = location || defaultCenter;

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12} />
    </LoadScript>
  );
};

export default MapComponent;
