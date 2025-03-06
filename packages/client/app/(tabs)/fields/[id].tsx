import { zodResolver } from "@hookform/resolvers/zod";
import { MoveDown, MoveUp, Trash } from "@tamagui/lucide-icons";
import * as turf from "@turf/turf";
import { fieldSchema } from "backend/src/schema/field";
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
  PROVIDER_GOOGLE,
} from "react-native-maps";
import {
  Button,
  Circle as TamaguiCircle,
  Input,
  Label,
  ListItem,
  ScrollView,
  SizableText,
  styled,
  Text,
  View,
  XStack,
  YGroup,
  YStack,
} from "tamagui";
import { z } from "zod";

import { RoadPreview } from "@/components/roadPreview";
import { client } from "@/lib/honoClient";
import i18n from "@/lib/i18n";
// import { logger } from "@/lib/logger";

export type Coord = LatLng & { id: number };
type fieldSchema = z.infer<typeof fieldSchema>;
type roadSchema = z.infer<typeof roadSchema>;

const formSchema = fieldSchema.omit({
  id: true,
  updatedAt: true,
  createdAt: true,
});

export default function Update() {
  const [refresh, setRefresh] = useState(false);
  const params = useLocalSearchParams<{ id: string; page?: string }>();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [page, setPage] = useState(Number(params.page ?? "0"));
  const [roads, setRoads] = useState<roadSchema[]>([]);
  const [groupId, setGroupId] = useState(0);

  const mapRef = useRef<MapView>(null);
  const [madeCoordCount, setMadeCoordCount] = useState(0);

  const [coords, setCoords] = useState<Coord[]>([]);
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
      setGroupId(json[0].groupId);

      const res2 = await (
        await client()
      ).api.fields[":id"].$get({
        param: {
          id: Number(params.id),
        },
      });
      if (!res2.ok) return;
      const json2 = await res2.json();
      if (!json2) return;
      setValue("name", json2.name);
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
      setMadeCoordCount(json2.coordinate.length);
      setRefresh(false);
    })();
  }, [refresh]);

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
    setRefresh(false);
  }, [coords, refresh]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    // logger.write({ message: "Change the field", ...data });
    setPosting(true);
    const res = await (
      await client()
    ).api.fields[":id"].$patch({
      param: {
        id: Number(params.id),
      },
      json: data,
    });
    if (!res.ok) return;
    reset();
    setMadeCoordCount(0);
    setPosting(false);
    setRefresh(true);
    setPage(1);
  };

  useEffect(() => {
    if (page === 1) {
      (async () => {
        const res = await (await client()).api.roads.$get();
        if (!res.ok) return;
        const json = await res.json();
        if (!json) return;
        const fieldRoads = json.filter((i) => i.fieldId === Number(params.id));
        setRoads(fieldRoads);
      })();
    }
  }, [page]);

  return (
    <View flex={1} height="100%" paddingBottom={390} marginHorizontal={20}>
      <YStack>
        {page === 0 ? (
          <>
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
                  setCoords((prev: Coord[]) => [
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
          </>
        ) : (
          <>
            <XStack fw="wrap">
              <Card
                jc="center"
                ai="center"
                onPress={async () => {
                  const res = await (
                    await client()
                  ).api.roads.$post({
                    json: {
                      groupId: groupId,
                      fieldId: parseInt(params.id),
                      coordinates: [
                        {
                          lon: coords[0].longitude,
                          lat: coords[0].latitude,
                        },
                        {
                          lon: coords[1].longitude,
                          lat: coords[1].latitude,
                        },
                      ],
                      name: "default",
                    },
                  });
                  if (!res.ok) return;
                  setPage(0);
                  setPage(1);
                }}
              >
                <TamaguiCircle
                  size={80}
                  bg="$accentBackground"
                  elevation={1}
                  pressStyle={{ scale: 0.95 }}
                  animation="quicker"
                  onPress={async () => {
                    const res = await (
                      await client()
                    ).api.roads.$post({
                      json: {
                        groupId: groupId,
                        fieldId: parseInt(params.id),
                        coordinates: [
                          {
                            lon: coords[0].longitude,
                            lat: coords[0].latitude,
                          },
                          {
                            lon: coords[1].longitude,
                            lat: coords[1].latitude,
                          },
                        ],
                        name: "default",
                      },
                    });
                    if (!res.ok) return;
                    setPage(0);
                    setPage(1);
                  }}
                >
                  <Text fontSize={50}>+</Text>
                </TamaguiCircle>
                <Text fontSize="$8" marginTop="$2" fontWeight="bold">
                  {i18n.t("add")}
                </Text>
              </Card>

              {roads.map((road) => (
                <RoadCard
                  key={road.id}
                  fieldCoord={coords.map((coord) => ({
                    lat: coord.latitude,
                    lon: coord.longitude,
                  }))}
                  road={road}
                  onPress={() => {
                    setPage(0);
                    router.push({
                      pathname: "/fields/roads/[id]",
                      params: { id: road.id },
                    });
                  }}
                />
              ))}
            </XStack>
            {/* <Button
              w={"100%"}
              h={"$4"}
              onPress={() => {
                setPage(0);
                router.push("/fields");
              }}
              variant="outlined"
              disabled={posting}
            >
              {i18n.t("close")}
            </Button> */}
          </>
        )}
      </YStack>
    </View>
  );
}

const Card = styled(YStack, {
  w: 270,
  h: 280,
  bg: "$background",
  m: "$4",
  borderBottomRightRadius: "$2",
  borderBottomLeftRadius: "$2",
  pressStyle: {
    scale: 0.95,
  },
  elevation: 1,
  animation: "quicker",
});

function RoadCard({
  fieldCoord,
  road,
  onPress,
}: {
  fieldCoord: {
    lat: number;
    lon: number;
  }[];
  road: roadSchema;
  onPress: () => void;
}) {
  return (
    <>
      <Card onPress={onPress}>
        {/* TODO: 航空画像をapiで */}
        <View overflow="hidden" flex={1}>
          <View scale={1.7}>
            <RoadPreview fieldCoord={fieldCoord} road={road} />
          </View>
        </View>
        <Text marginHorizontal="$4" marginVertical="$2">
          {i18n.t("Updated at")} {road.updatedAt}
        </Text>
        <Text
          fontSize={20}
          marginHorizontal="$4"
          fontWeight="bold"
          marginBottom="$3"
        >
          {road.name}
        </Text>
      </Card>
    </>
  );
}
