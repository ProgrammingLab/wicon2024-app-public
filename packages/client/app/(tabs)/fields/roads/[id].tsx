import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "@tamagui/lucide-icons";
import { roadSchema } from "backend/src/schema/road";
import { router, useLocalSearchParams } from "expo-router";
import { getAuth } from "firebase/auth";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform } from "react-native";
import MapView, {
  Circle,
  LatLng,
  Marker,
  Polygon,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import {
  Button,
  Input,
  Label,
  ListItem,
  ScrollView,
  SizableText,
  Text,
  View,
  XStack,
  YGroup,
  YStack,
} from "tamagui";
import { z } from "zod";

import { client } from "@/lib/honoClient";
import i18n from "@/lib/i18n";
// import { logger } from "@/lib/logger";

export type Coord = LatLng & { id: number };
type roadSchema = z.infer<typeof roadSchema>;

const formSchema = roadSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export default function Update() {
  const [refresh, setRefresh] = useState(false);
  const params = useLocalSearchParams<{ id: string }>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  const mapRef = useRef<MapView>(null);
  const [madeCoordCount, setMadeCoordCount] = useState(0);

  const [coords, setCoords] = useState<Coord[]>([]);
  const [roadCoords, setRoadCoords] = useState<Coord[]>([]);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (refresh) {
      console.log("refresh=true");
    } else {
      console.log("refresh=false");
    }
  }, [refresh]);

  useEffect(() => {
    setRefresh(true);
  }, [params.id]);

  useEffect(() => {
    (async () => {
      const auth = getAuth();
      if (!auth.currentUser) return;

      const res = await (
        await client()
      ).api.users[":id"].groups.$get({
        param: {
          id: auth.currentUser.uid,
        },
      });
      if (!res.ok) return;
      const json = await res.json();
      if (!json) return;
      setValue("groupId", json[0].groupId);

      const res1 = await (
        await client()
      ).api.roads[":id"].$get({
        param: {
          id: Number(params.id),
        },
      });
      if (!res1.ok) return;
      const json1 = await res1.json();
      if (!json1) return;
      setValue("name", json1.name);
      setValue("fieldId", json1.fieldId);

      setRoadCoords(
        json1.coordinates.map((coord: { lat: number; lon: number }, index) => ({
          id: index,
          latitude: coord.lat,
          longitude: coord.lon,
        })),
      );

      const res2 = await (
        await client()
      ).api.fields[":id"].$get({
        param: {
          id: json1.fieldId,
        },
      });
      if (!res2.ok) return;
      const json2 = await res2.json();
      if (!json2) return;

      setCoords(
        json2.coordinate.map((coord: { lat: number; lon: number }, index) => ({
          id: index,
          latitude: coord.lat,
          longitude: coord.lon,
        })),
      );
      mapRef.current?.fitToCoordinates(
        json2.coordinate.map((coord: { lat: number; lon: number }) => ({
          latitude: coord.lat,
          longitude: coord.lon,
        })),
        { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 } },
      );
      setMadeCoordCount(json1.coordinates.length);
      setRefresh(false);
    })();
  }, [refresh]);

  useEffect(() => {
    setValue(
      "coordinates",
      roadCoords.map((coord) => ({
        lat: coord.latitude,
        lon: coord.longitude,
      })),
    );
    setRefresh(false);
  }, [roadCoords, refresh]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    // logger.write({ message: "Change the roads", ...data });
    // setPosting(true);
    const res = await (
      await client()
    ).api.roads[":id"].$patch({
      param: {
        id: Number(params.id),
      },
      json: data,
    });
    if (!res.ok) return;
    reset();
    setCoords([]);
    setMadeCoordCount(0);
    setPosting(false);
    setRefresh(true);
    router.push("/fields");
  };

  return (
    <View flex={1} height="100%" paddingBottom={390} marginHorizontal={20}>
      <YStack>
        <Label>{i18n.t("name")}</Label>
        <Controller
          name="name"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <Input value={field.value} onChangeText={field.onChange} />
          )}
        />
        {errors.name && <SizableText>{errors.name.message}</SizableText>}
        <Label>圃場の道</Label>
        <SizableText>
          マップ上で基準となる道を2点選択し、直線を作成してください。
        </SizableText>
        <XStack height="100%">
          <YGroup width={320} bordered scrollable>
            <ScrollView>
              {roadCoords.map((coord, index) => (
                <YGroup.Item key={index}>
                  <ListItem
                    hoverTheme
                    height="$5"
                    title={
                      <YStack height="100%" justifyContent="center">
                        <Text>{coord.latitude}</Text>
                        <Text>{coord.longitude}</Text>
                      </YStack>
                    }
                    icon={
                      <>
                        <SizableText size="$9" paddingRight="$3">
                          {coord.id}
                        </SizableText>
                      </>
                    }
                    iconAfter={
                      <Button
                        minHeight="$4"
                        onPress={() => {
                          setRoadCoords((prev) => {
                            const next = [...prev];
                            next.splice(index, 1);
                            return next;
                          });
                        }}
                      >
                        <Trash />
                      </Button>
                    }
                  />
                </YGroup.Item>
              ))}
            </ScrollView>
          </YGroup>

          <MapView
            mapType="hybrid"
            style={{
              flex: 1,
              margin: 10,
            }}
            ref={mapRef}
            initialRegion={{
              latitude: 36,
              longitude: 140,
              latitudeDelta: 10,
              longitudeDelta: 10,
            }}
            provider={Platform.OS === "web" ? "google" : PROVIDER_GOOGLE}
            // TODO: fix this error
            // @ts-ignore
            googleMapsApiKey={
              Platform.OS === "web" &&
              process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
            }
            onPress={(e) => {
              if (Platform.OS !== "web") e.persist();
              setMadeCoordCount((prev) => prev + 1);
              setRoadCoords((prev: Coord[]) => {
                if (prev.length >= 2) {
                  prev = [prev[1]];
                }
                return [
                  ...prev,
                  {
                    id: madeCoordCount,
                    latitude:
                      Math.round(
                        e.nativeEvent.coordinate.latitude * 100000000,
                      ) / 100000000,
                    longitude:
                      Math.round(
                        e.nativeEvent.coordinate.longitude * 100000000,
                      ) / 100000000,
                  },
                ];
              });
            }}
          >
            {coords.length > 2 && (
              <Polygon
                coordinates={coords}
                fillColor="rgba(0, 255, 42, 0.2)"
                strokeColor="rgb(0, 255, 0)"
                strokeWidth={2}
              />
            )}
            {roadCoords.length >= 2 && (
              <Polyline
                coordinates={roadCoords}
                strokeColor="rgb(0, 162, 255)"
                strokeWidth={3}
              ></Polyline>
            )}
            {roadCoords.map((coord) => (
              <Fragment key={coord.id}>
                <Circle
                  center={coord}
                  radius={1.5}
                  fillColor="rgba(0, 162, 255, 0.5)"
                  strokeColor="rgb(0, 162, 255)"
                  strokeWidth={2}
                />
                <Marker coordinate={coord}>
                  <View
                    backgroundColor="$accentBackground"
                    opacity={0.8}
                    borderRadius="$5"
                    padding="$2"
                  >
                    <SizableText size="$9">{coord.id}</SizableText>
                  </View>
                </Marker>
              </Fragment>
            ))}
          </MapView>
        </XStack>
        <Button
          onPress={handleSubmit(onSubmit)}
          variant="outlined"
          disabled={posting}
        >
          {i18n.t("submit")}
        </Button>
      </YStack>
    </View>
  );
}
