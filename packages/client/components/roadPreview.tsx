import { roadSchema } from "backend/src/schema/road";
import React, { Fragment, useRef } from "react";
import { Platform } from "react-native";
import MapView, {
  Circle,
  LatLng,
  Polygon,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { z } from "zod";

export function RoadPreview({
  fieldCoord,
  road,
}: {
  fieldCoord: {
    lat: number;
    lon: number;
  }[];
  road: z.infer<typeof roadSchema>;
}) {
  const mapRef = useRef<MapView>(null);
  const roadCoord: LatLng[] = road.coordinates.map((coord) => ({
    latitude: coord.lat,
    longitude: coord.lon,
  }));

  return (
    <MapView
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%",
      }}
      provider={Platform.OS === "web" ? "google" : PROVIDER_GOOGLE}
      // TODO: fix this error
      // @ts-ignore
      googleMapsApiKey={
        Platform.OS === "web" && process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
      }
      initialRegion={{
        latitude: fieldCoord[0].lat,
        longitude: fieldCoord[0].lon,
        latitudeDelta: 0.042,
        longitudeDelta: 0.02,
      }}
      mapType="hybrid"
      scrollEnabled={false}
      onMapReady={() =>
        mapRef.current?.fitToCoordinates(
          road.coordinates.map((coord) => ({
            latitude: coord.lat,
            longitude: coord.lon,
          })),
          { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 } },
        )
      }
    >
      <Polygon
        coordinates={fieldCoord.map((coord) => ({
          latitude: coord.lat,
          longitude: coord.lon,
        }))}
        fillColor="rgba(0, 255, 42, 0.5)"
        strokeColor="rgb(0, 255, 0)"
        strokeWidth={2}
      />
      <Polyline
        coordinates={roadCoord}
        strokeColor="rgb(0, 71, 112)"
        strokeWidth={4}
        zIndex={100}
      ></Polyline>
      {roadCoord.map((coord, index) => (
        <Fragment key={index}>
          <Circle
            center={coord}
            radius={2}
            fillColor="rgb(0, 71, 112)"
            strokeColor="rgb(0, 71, 112)"
            strokeWidth={2}
            zIndex={100}
          />
        </Fragment>
      ))}
    </MapView>
  );
}
