import { fieldSchema } from "backend/src/schema/field";
import React, { useRef } from "react";
import { Platform } from "react-native";
import MapView, { Polygon, PROVIDER_GOOGLE } from "react-native-maps";
import { z } from "zod";

export function FieldPreview({
  field,
}: {
  field: z.infer<typeof fieldSchema>;
}) {
  const mapRef = useRef<MapView>(null);

  return (
    <MapView
      ref={mapRef}
      provider={Platform.OS === "web" ? "google" : PROVIDER_GOOGLE}
      // TODO: fix this error
      // @ts-ignore
      googleMapsApiKey={
        Platform.OS === "web" && process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
      }
      initialRegion={{
        latitude: field.coordinate[0].lat,
        longitude: field.coordinate[0].lon,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      style={{ flex: 1 }}
      mapType="hybrid"
      scrollEnabled={false}
      onMapReady={() =>
        mapRef.current?.fitToCoordinates(
          field.coordinate.map((coord) => ({
            latitude: coord.lat,
            longitude: coord.lon,
          })),
          { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 } },
        )
      }
    >
      <Polygon
        coordinates={field.coordinate.map((coord) => ({
          latitude: coord.lat,
          longitude: coord.lon,
        }))}
        fillColor="rgba(0, 255, 42, 0.5)"
        strokeColor="rgb(0, 255, 0)"
        strokeWidth={2}
      />
    </MapView>
  );
}
