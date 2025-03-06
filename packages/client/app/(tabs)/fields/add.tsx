import { zodResolver } from "@hookform/resolvers/zod";
import { MoveDown, MoveUp, Trash } from "@tamagui/lucide-icons";
import * as turf from "@turf/turf";
import { fieldSchema } from "backend/src/schema/field";
import * as Location from "expo-location";
import { router } from "expo-router";
import { getAuth } from "firebase/auth";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Platform } from "react-native";
import MapView, {
  Circle,
  LatLng,
  Marker,
  Polygon,
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

const formSchema = fieldSchema.omit({
  id: true,
  updatedAt: true,
  createdAt: true,
});

export default function PolygonEditor() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    async function getCurrentLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      mapRef.current?.setCamera({
        center: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        zoom: 20,
      });
    }

    getCurrentLocation();
  }, []);

  const mapRef = useRef<MapView>(null);
  const [madeCoordCount, setMadeCoordCount] = useState(0);

  const [coords, setCoords] = useState<Coord[]>([]);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    watch,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  console.log(watch());
  console.log(errors);

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
    })();
  }, []);

  useEffect(() => {
    setValue(
      "coordinate",
      coords.map((coord) => ({ lat: coord.latitude, lon: coord.longitude })),
    );

    if (coords.length > 2) {
      const polygon = turf.polygon([
        [
          ...coords.map((coord) => [coord.longitude, coord.latitude]),
          [coords[0].longitude, coords[0].latitude],
        ],
      ]);
      setValue("area", turf.area(polygon));
    }
  }, [coords]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    // logger.write({ message: "Add the field", ...data });
    setPosting(true);
    const res = await (
      await client()
    ).api.fields.$post({
      json: data,
    });
    if (!res.ok) return;
    const json = await res.json();
    if (!json) return;
    reset();
    setCoords([]);
    setMadeCoordCount(0);
    setPosting(false);
    router.push({ pathname: "/fields/[id]", params: { id: json.id, page: 1 } });
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
        <Label>圃場範囲</Label>
        <SizableText>
          マップ上で圃場の角を全て選択し、多角形を作成してください。
        </SizableText>
        <XStack height="100%">
          <YGroup width={320} bordered scrollable>
            <ScrollView>
              {coords.map((coord, index) => (
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
                        <Button
                          width="$1"
                          marginRight="$1"
                          onPress={() => {
                            setCoords((prev) => {
                              if (index === 0) return prev;
                              const next = [...prev];
                              [next[index], next[index - 1]] = [
                                next[index - 1],
                                next[index],
                              ];
                              return next;
                            });
                          }}
                        >
                          <MoveUp />
                        </Button>
                        <Button
                          width="$1"
                          onPress={() => {
                            setCoords((prev) => {
                              if (index === prev.length - 1) return prev;
                              const next = [...prev];
                              [next[index], next[index + 1]] = [
                                next[index + 1],
                                next[index],
                              ];
                              return next;
                            });
                          }}
                        >
                          <MoveDown />
                        </Button>
                      </>
                    }
                    iconAfter={
                      <Button
                        minHeight="$4"
                        onPress={() => {
                          setCoords((prev) => {
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
              setCoords((prev: Coord[]) => [
                ...prev,
                {
                  id: madeCoordCount,
                  latitude:
                    Math.round(e.nativeEvent.coordinate.latitude * 100000000) /
                    100000000,
                  longitude:
                    Math.round(e.nativeEvent.coordinate.longitude * 100000000) /
                    100000000,
                },
              ]);
            }}
          >
            {coords.length > 2 && (
              <Polygon
                coordinates={coords}
                fillColor="rgba(0, 255, 42, 0.5)"
                strokeColor="rgb(0, 255, 0)"
                strokeWidth={2}
              />
            )}
            {coords.map((coord) => (
              <Fragment key={coord.id}>
                <Circle
                  center={coord}
                  radius={1.5}
                  fillColor="rgba(0, 255, 42, 0.5)"
                  strokeColor="rgb(0, 255, 0)"
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
          {i18n.t("next")}
        </Button>
      </YStack>
    </View>
  );
}
