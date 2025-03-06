import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useKeepAwake } from "@sayem314/react-native-keep-awake";
import { Bluetooth, SatelliteDish } from "@tamagui/lucide-icons";
import * as turf from "@turf/turf";
import { carSchema } from "backend/src/schema/car";
import { fieldSchema } from "backend/src/schema/field";
import { ntripcasterSchema } from "backend/src/schema/ntripcaster";
import { roadSchema } from "backend/src/schema/road";
import CheapRuler from "cheap-ruler";
import { Audio } from "expo-av";
import { router } from "expo-router";
import {
  Feature,
  GeoJsonProperties,
  Geometry,
  MultiPolygon,
  Polygon as GeoPolygon,
} from "geojson";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Device } from "react-native-ble-plx";
import { PROVIDER_GOOGLE } from "react-native-maps";
import MapView, {
  Circle,
  Geojson,
  LatLng,
  Polygon,
  Polyline,
} from "react-native-maps";
import {
  Button,
  Image,
  ScrollView,
  SizableText,
  styled,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";
import { z } from "zod";

import leftIcon from "@/assets/images/left.png";
import rightIcon from "@/assets/images/right.png";
import rawBeep1 from "@/assets/sound/beep1.mp3";
import rawBeep2 from "@/assets/sound/beep2.mp3";
import { RoadPreview } from "@/components/roadPreview";
import { BleReceiver, DeviceState } from "@/lib/bleReceiver";
import {
  checkPointPosition,
  choose_closest_point2,
  getAngleFromNorth,
  getCloserDirection,
  getIntersectionsWithPolygon,
  movePointsPerpendicular,
} from "@/lib/coordCalc";
import DummyReceiver from "@/lib/dummyReceiver";
import { Field } from "@/lib/field";
import { client } from "@/lib/honoClient";
import i18n from "@/lib/i18n";
import { logger } from "@/lib/logger";
import { NtripClient, NtripClientState } from "@/lib/ntripClient";
import UBXPacketParser, {
  parsedResult,
} from "@/lib/ubx-parser/ubx-packet-parser/index";
import { ReturnPvt } from "@/lib/ubx-parser/ubx-packet-parser/nav";
import UBXProtocolParser from "@/lib/ubx-parser/ubx-protocol-parser/index";

import { FieldPreview } from "../../components/fieldPreview";

// デバッグモード
const SPEED = 0.3;
const IS_DEBUG_MODE = false;

type fieldSchema = z.infer<typeof fieldSchema>;
type roadSchema = z.infer<typeof roadSchema>;
type carSchema = z.infer<typeof carSchema>;

export default function NavigationScreen() {
  const [field, setField] = React.useState<Field | null>(null);
  const [fieldWithoutRoad, setFieldWithoutRoad] =
    React.useState<fieldSchema | null>(null);
  const [fieldChoices, setFieldChoices] = React.useState<fieldSchema[]>([]);
  const [carChoices, setCarChoices] = React.useState<carSchema[]>([]);
  const [roadChoices, setRoadChoices] = React.useState<roadSchema[]>([]);
  const [pvt, setPvt] = React.useState<ReturnPvt | null>(null);
  const [car, setCar] = React.useState<LatLng[] | null>(null);
  const [ruler, setRuler] = React.useState<CheapRuler | null>(null);
  const [focused, setFocused] = React.useState<number | null>(null);
  const [carWidthFromCoord, setCarWidthFromCoord] = React.useState<
    number | null
  >(null);
  const [lines, setLines] = React.useState<LatLng[][]>([]);
  const [isDeveloper, setIsDeveloper] = React.useState(false);
  const [finishedArea, setFinishedArea] = React.useState<Feature<
    Geometry,
    GeoJsonProperties
  > | null>(null);
  const [misalignment, setMisalignment] = React.useState(0);
  const mapRef = React.useRef<MapView>(null);
  const [carPosition, setCarPosition] = React.useState<"RIGHT" | "LEFT" | "ON">(
    "ON",
  );
  const [carWidth, setCarWidth] = React.useState(2);
  const [carHeight, setCarHeight] = React.useState(4);
  const [carSize, setCarSize] = React.useState<{ x: number; y: number }[]>([]);
  const [isCarSetting, setIsCarSetting] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isHeadLocked, setIsHeadLocked] = React.useState(true);
  const [beep1, setBeep1] = React.useState<Audio.Sound | null>(null);
  const [beep2, setBeep2] = React.useState<Audio.Sound | null>(null);
  const deviationRef = useRef(0);
  const carPositionRef = useRef<"RIGHT" | "LEFT" | "ON">("ON");
  // For logger
  const timerRef = useRef<Timer>();
  const focusedRef = useRef<number>();
  const pvtRef = useRef<ReturnPvt>();
  const linesRef = useRef<LatLng[][]>();

  useKeepAwake();

  useEffect(() => {
    setCarSize([
      { x: -carHeight / 2, y: -carWidth / 2 },
      { x: -carHeight / 2, y: carWidth / 2 },
      { x: carHeight / 2, y: carWidth / 2 },
      { x: carHeight / 2, y: -carWidth / 2 },
    ]);
  }, [carHeight, carWidth]);

  useEffect(() => {
    (async () => {
      try {
        const res = await (await client()).api.fields.$get();
        if (!res.ok) return;
        const json = await res.json();
        if (!json) return;
        setFieldChoices(json);
      } catch (e) {
        console.error(e);
      }

      try {
        const res = await (await client()).api.roads.$get();
        if (!res.ok) return;
        const json = await res.json();
        if (!json) return;
        setRoadChoices(json);
      } catch (e) {
        console.error(e);
      }

      try {
        const res = await (await client()).api.cars.$get();
        if (!res.ok) return;
        const json = await res.json();
        if (!json) return;
        setCarChoices(json);
      } catch (e) {
        console.error(e);
      }
      {
        const { sound } = await Audio.Sound.createAsync(rawBeep1);
        setBeep1(sound);
      }
      {
        const { sound } = await Audio.Sound.createAsync(rawBeep2);
        setBeep2(sound);
      }
      return () => {
        beep1?.unloadAsync();
        beep2?.unloadAsync();
      };
    })();
  }, []);

  // PVTらへんのお話
  useEffect(() => {
    if (IS_DEBUG_MODE) {
      const receiver = new DummyReceiver();
      const protocolParser = new UBXProtocolParser();
      const packetParser = new UBXPacketParser();
      receiver.on((data) => {
        protocolParser.write(data);
      });
      protocolParser.pipe(packetParser);

      packetParser.on("data", (data: parsedResult) => {
        if (data.type === "NAV-PVT") {
          if (!isDeveloper) {
            setPvt(data);
            pvtRef.current = data;
          }
        }
      });

      return () => {
        receiver.clear();
      };
    }
  }, [isDeveloper]);

  useEffect(() => {
    if (field && carWidthFromCoord) {
      // TODO: 交点が複数ある場合の処理
      setLines([]);
      const duplicate = (i: number) => {
        const prime = movePointsPerpendicular(
          field.roads[0].coordinates[0].lon,
          field.roads[0].coordinates[0].lat,
          field.roads[0].coordinates[1].lon,
          field.roads[0].coordinates[1].lat,
          carWidthFromCoord * i,
        );
        const intersections = getIntersectionsWithPolygon(
          prime.x1Prime,
          prime.y1Prime,
          prime.x2Prime,
          prime.y2Prime,
          field.area,
        );
        if (intersections) {
          if (i >= 0) {
            setLines((lines) => [
              ...lines,
              [
                {
                  latitude: intersections[0].y,
                  longitude: intersections[0].x,
                },
                {
                  latitude: intersections[1].y,
                  longitude: intersections[1].x,
                },
              ],
            ]);
          } else {
            setLines((lines) => [
              [
                {
                  latitude: intersections[0].y,
                  longitude: intersections[0].x,
                },
                {
                  latitude: intersections[1].y,
                  longitude: intersections[1].x,
                },
              ],
              ...lines,
            ]);
          }
          return true;
        } else {
          return false;
        }
      };
      {
        let is_inside = true;

        for (let i = 0; is_inside; i++) {
          is_inside = duplicate(i);
        }
      }
      {
        let is_inside = true;

        for (let i = -1; is_inside; i--) {
          is_inside = duplicate(i);
        }
      }
    }
  }, [field, carWidthFromCoord]);

  useEffect(() => {
    if (pvt && field) {
      if (ruler === null) {
        setRuler(new CheapRuler(pvt.data.lat, "meters"));
        return;
      }

      let heading;
      if (isHeadLocked) {
        switch (
          getCloserDirection(
            [
              field.roads[0].coordinates[0].lon,
              field.roads[0].coordinates[0].lat,
            ],
            [
              field.roads[0].coordinates[1].lon,
              field.roads[0].coordinates[1].lat,
            ],
            pvt.data.headMot,
          )
        ) {
          case "Start->End":
            heading = getAngleFromNorth(
              [
                field.roads[0].coordinates[0].lon,
                field.roads[0].coordinates[0].lat,
              ],
              [
                field.roads[0].coordinates[1].lon,
                field.roads[0].coordinates[1].lat,
              ],
            );
            break;
          case "End->Start":
            heading = getAngleFromNorth(
              [
                field.roads[0].coordinates[1].lon,
                field.roads[0].coordinates[1].lat,
              ],
              [
                field.roads[0].coordinates[0].lon,
                field.roads[0].coordinates[0].lat,
              ],
            );
            break;
          case "Neither":
            heading = undefined;
        }
      }

      mapRef.current?.setCamera({
        center: {
          latitude: pvt.data.lat,
          longitude: pvt.data.lon,
        },
        zoom: zoomMax,
        heading: isHeadLocked ? heading : pvt.data.headMot,
        pitch: 0,
      });

      setCar(
        carSize.map((point) => {
          const rotated = ruler.destination(
            [pvt.data.lon, pvt.data.lat],
            Math.sqrt(point.x ** 2 + point.y ** 2),
            pvt.data.headMot + Math.atan2(point.y, point.x) * (180 / Math.PI),
          );
          return {
            latitude: rotated[1],
            longitude: rotated[0],
          };
        }),
      );
    }
  }, [ruler, pvt, carSize, field, isHeadLocked]);

  useEffect(() => {
    if (ruler && pvt) {
      const point = ruler.offset(
        [pvt.data.lon, pvt.data.lat],
        carWidth * 0.88,
        0,
      );
      const distance = point[0] - pvt.data.lon;
      setCarWidthFromCoord(distance);
    }
  }, [ruler, pvt, carWidth]);

  useEffect(() => {
    if (!pvt) return;
    const newFocused = choose_closest_point2(
      {
        lat: pvt.data.lat,
        lon: pvt.data.lon,
      },
      lines,
    );
    focusedRef.current = newFocused;
    setFocused(newFocused);
  }, [pvt, lines]);

  useEffect(() => {
    if (ruler && pvt && lines && focused !== null) {
      if (focused >= lines.length || focused < 0) {
        return;
      }

      const distance = ruler.pointToSegmentDistance(
        [pvt.data.lon, pvt.data.lat],
        [lines[focused][0].longitude, lines[focused][0].latitude],
        [lines[focused][1].longitude, lines[focused][1].latitude],
      );

      setMisalignment(distance);

      if (Math.round(distance * 100) === 0) {
        setCarPosition("ON");
        return;
      }

      const lineAngle = ruler.bearing(
        [lines[focused][0].longitude, lines[focused][0].latitude],
        [lines[focused][1].longitude, lines[focused][1].latitude],
      );
      const tmp = (pvt.data.headMot - lineAngle + 360) % 360;
      let start;
      let end;
      if (tmp <= 90 || 270 <= tmp) {
        start = [lines[focused][0].longitude, lines[focused][0].latitude];
        end = [lines[focused][1].longitude, lines[focused][1].latitude];
      } else {
        end = [lines[focused][0].longitude, lines[focused][0].latitude];
        start = [lines[focused][1].longitude, lines[focused][1].latitude];
      }
      let pos: "RIGHT" | "LEFT" | "ON";
      switch (checkPointPosition(start, end, [pvt.data.lon, pvt.data.lat])) {
        case "left":
          pos = "LEFT";
          break;
        case "right":
          pos = "RIGHT";
          break;
        case "on the line":
          pos = "ON";
          break;
      }
      setCarPosition(pos);
      carPositionRef.current = pos;
    }
  }, [ruler, pvt, lines, focused]);

  useEffect(() => {
    if (car) {
      setFinishedArea((area) => {
        const carCoordArray = car.map((point) => [
          point.longitude,
          point.latitude,
        ]);
        const carPolygon = turf.polygon([
          [
            carCoordArray[0],
            carCoordArray[1],
            carCoordArray[2],
            carCoordArray[3],
            carCoordArray[0],
          ],
        ]);
        if (area) {
          try {
            return turf.union(
              turf.featureCollection([
                area as Feature<GeoPolygon | MultiPolygon>,
                carPolygon,
              ]),
            );
          } catch {
            return area;
          }
        }
        return carPolygon;
      });
    }
  }, [car]);

  /*
    BLE
  */
  const [solutionStatus, setSolutionStatus] = useState("");
  const [deviceState, setDeviceState] = useState<DeviceState>("disconnected");
  const [devices, setDevices] = useState<Device[]>([]);
  const [device, setDevice] = useState<Device | null>(null);
  const bleReceiver = useMemo(() => new BleReceiver(), []);

  useEffect(() => {
    const func = async () => {
      await bleReceiver.requestPermissions();
      await bleReceiver.startScan(setDevices);
    };
    func();
  }, []);

  useEffect(() => {
    if (!device) {
      return;
    }
    (async () => {
      bleReceiver.stopScan();
      setDeviceState("connecting");
      await bleReceiver.connect(device, setDeviceState);
      setDeviceState("connected");
      bleReceiver.read((data) => {
        switch (data.data.flags.carrSoln.string) {
          case "00":
            setSolutionStatus("No solution");
            break;
          case "01":
            setSolutionStatus("Float");
            break;
          case "10":
            setSolutionStatus("Fix");
            break;
        }
        setPvt(data);
        pvtRef.current = data;
      });
    })();
    return () => {
      bleReceiver.disconnect(device);
      setDeviceState("disconnected");
    };
  }, [device]);

  const [mapType, setMapType] = useState<"hybrid" | "standard">("hybrid");
  const [zoomMax, setZoomMax] = useState<undefined | 21>(21);
  const [showReceiverSetting, setShowReceiverSetting] = useState(false);

  const deviation = Math.round(misalignment * 100); // cm
  deviationRef.current = deviation;

  /*
    NTRIP
  */
  type ntripcasterSchema = z.infer<typeof ntripcasterSchema>;
  const [ntripcasters, setNtripcasters] = useState<ntripcasterSchema[] | null>(
    null,
  );
  const [ntripcaster, setNtripcaster] = useState<ntripcasterSchema | null>(
    null,
  );
  const [showNtripcasterSettings, setShowNtripcasterSettings] = useState(false);
  const [ntripClientState, setNtripClientState] =
    useState<NtripClientState>("disconnected");
  const ntripClient = new NtripClient(setNtripClientState);

  useEffect(() => {
    (async () => {
      const res = await (await client()).api.ntripcasters.$get();
      if (!res.ok) return;
      const json = await res.json();
      if (!json) return;
      setNtripcasters(json);
    })();
  }, []);

  useEffect(() => {
    if (!ntripcaster) return;
    setNtripClientState("connecting");
    ntripClient.connect(
      ntripcaster.host,
      ntripcaster.port,
      ntripcaster.mountpoint,
      ntripcaster.username || undefined,
      ntripcaster.password || undefined,
    );
    setNtripClientState("connected");
    ntripClient.read((data) => {
      bleReceiver.write(data);
    });

    return () => {
      ntripClient.disconnect();
      setNtripClientState("disconnected");
    };
  }, [ntripcaster]);

  // For logger
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!focusedRef.current) return;
      if (!pvtRef.current) return;
      logger.writeNavi({
        timestamp: Date.now(),
        selectedLine: {
          start: {
            lon: linesRef.current?.[focusedRef.current]?.[0]?.longitude ?? 0,
            lat: linesRef.current?.[focusedRef.current]?.[0]?.latitude ?? 0,
          },
          end: {
            lon: linesRef.current?.[focusedRef.current]?.[1]?.longitude ?? 0,
            lat: linesRef.current?.[focusedRef.current]?.[1]?.latitude ?? 0,
          },
        },
        current: {
          lon: pvtRef.current?.data?.lon ?? 0,
          lat: pvtRef.current?.data?.lat ?? 0,
        },
        deviation: deviationRef.current ?? 0,
        carPosition: carPositionRef.current ?? "ON",
        displayedCarPosition:
          (deviationRef.current ?? 0) <= 5
            ? "ON"
            : (carPositionRef.current ?? "ON"),
      });
    }, 100);

    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  useEffect(() => {
    const sleep = (time: number) =>
      new Promise((resolve) => setTimeout(resolve, time));
    let isStop = false;

    (async () => {
      for (;;) {
        if (carPositionRef.current === "RIGHT" && deviationRef.current > 3) {
          beep1?.replayAsync();
          await sleep(Math.max(1000 / 4, 1000 / (deviationRef.current / 20)));
        } else if (
          carPositionRef.current === "LEFT" &&
          deviationRef.current > 3
        ) {
          beep2?.replayAsync();
          await sleep(Math.max(1000 / 4, 1000 / (deviationRef.current / 20)));
        } else {
          await sleep(250);
        }
        if (isStop) {
          break;
        }
      }
    })();

    return () => {
      isStop = true;
    };
  }, [beep1, beep2]);

  return (
    <YStack h={"100%"} w={"100%"} position="relative">
      {showReceiverSetting && (
        <ScrollView
          pos="absolute"
          width="100%"
          height="100%"
          backgroundColor="rgba(255,255,255,0.9)"
          padding="$6"
          pt="$6"
          zIndex={1000000}
        >
          <XStack justifyContent="flex-end">
            <Button
              circular
              backgroundColor="$accentBackground"
              marginTop="$2"
              marginRight="$2"
              onPress={() => setShowReceiverSetting(false)}
            >
              X
            </Button>
          </XStack>
          <SizableText size="$10">
            Solution: {solutionStatus || "?"}
          </SizableText>
          <SizableText size="$10">Receiver: {deviceState}</SizableText>
          <ScrollView>
            {deviceState === "disconnected" &&
              devices
                .filter((device) => !!device.name)
                .map((device, idx) => (
                  <SizableText
                    backgroundColor="$accentBackground"
                    margin="$5"
                    padding="$2"
                    borderRadius="$5"
                    size="$10"
                    key={idx}
                    onPress={() => {
                      setDevice(device);
                    }}
                  >
                    {device.name}
                  </SizableText>
                ))}
          </ScrollView>
          <Button
            onPress={async () => {
              if (device) await bleReceiver.disconnect(device);
              setDevice(null);
            }}
            disabled={!device}
          >
            disconnect
          </Button>
        </ScrollView>
      )}
      <YStack position="absolute" bottom={10} right={10} zIndex={1000} gap={20}>
        <Button
          icon={
            <View
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <SatelliteDish size={"$3"} />
              <SizableText>NTRIP</SizableText>
            </View>
          }
          circular
          size={"$7"}
          onPress={() => setShowNtripcasterSettings(true)}
        />
        <Button
          icon={
            <View
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <Bluetooth size={"$3"} />
              <SizableText>Receiver</SizableText>
            </View>
          }
          circular
          size={"$7"}
          onPress={() => setShowReceiverSetting(true)}
        />
        <Button
          icon={
            <View
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <FontAwesome size={30} name="close" />
              <SizableText>{i18n.t("finish")}</SizableText>
            </View>
          }
          circular
          size={"$7"}
          onPress={() => router.back()}
          backgroundColor={"$red7"}
        />
      </YStack>
      {showNtripcasterSettings && (
        <ScrollView
          pos="absolute"
          width="100%"
          height="100%"
          backgroundColor="rgba(255,255,255,0.9)"
          padding="$6"
          pt="$6"
          zIndex={1000000}
        >
          <XStack justifyContent="flex-end">
            <Button
              circular
              backgroundColor="$accentBackground"
              marginTop="$2"
              marginRight="$2"
              onPress={() => setShowNtripcasterSettings(false)}
            >
              X
            </Button>
          </XStack>
          <SizableText size="$10">
            NTRIP Caster:{" "}
            {typeof ntripClientState === "string"
              ? ntripClientState
              : ntripClientState.toISOString()}
          </SizableText>
          <SizableText size="$10">
            ntripcaster: {ntripcaster ? `${ntripcaster.name}` : "None"}
          </SizableText>
          <ScrollView>
            {ntripcasters?.map((ntripcaster) => (
              <SizableText
                backgroundColor="$accentBackground"
                padding="$2"
                borderRadius="$5"
                margin="$2"
                size="$10"
                key={ntripcaster.id}
                onPress={() => {
                  setNtripcaster(ntripcaster);
                }}
              >
                {ntripcaster.name}
              </SizableText>
            ))}
          </ScrollView>
          <Button
            onPress={() => {
              if (ntripcaster) ntripClient.disconnect();
              setNtripcaster(null);
            }}
            disabled={!ntripcaster}
          >
            disconnect
          </Button>
          <YStack zIndex={999} backgroundColor="$accentBackground">
            <XStack>
              <Button onPress={() => setMapType("hybrid")}>hybrid</Button>
              <Button onPress={() => setMapType("standard")}>standard</Button>
              <Button onPress={() => setZoomMax(21)}>Zoom!!max</Button>
              <Button onPress={() => setZoomMax(undefined)}>Zoom!!none</Button>
            </XStack>
          </YStack>
        </ScrollView>
      )}
      <XStack
        h={"$8"}
        zIndex={1000}
        bg={"rgba(255,255,255,0.8)"}
        width={"100%"}
        justifyContent="center"
        alignItems="center"
      >
        <View position="absolute" left="$4" top="$4" zIndex={1000}>
          <SizableText size="$6">Solution: {solutionStatus || "?"}</SizableText>
          <SizableText size="$6">Receiver: {deviceState}</SizableText>
          <SizableText size="$6">
            NTRIP Caster:{" "}
            {typeof ntripClientState === "string"
              ? ntripClientState
              : ntripClientState.toISOString()}
          </SizableText>
        </View>
        <Image
          source={leftIcon}
          h={50}
          w={50}
          opacity={carPosition === "RIGHT" && deviation > 3 ? 1 : 0}
        ></Image>
        <Text fontSize={"$10"} color="black" mx="$4">
          {deviation > 3 ? `${deviation}cm` : i18n.t("onTrack")}
        </Text>
        <Image
          source={rightIcon}
          h={50}
          w={50}
          opacity={carPosition === "LEFT" && deviation > 3 ? 1 : 0}
        ></Image>
      </XStack>
      {field === null && (
        <View
          pos="absolute"
          top="0"
          right="0"
          bottom="0"
          left="0"
          w="100%"
          h="100%"
          bg="rgba(255,255,255,0.9)"
          pt="$6"
          zi={1000000}
        >
          {!isCarSetting ? (
            <>
              <Text fontSize="$10" textAlign="center" mb="$2">
                {i18n.t("selectACar")}
              </Text>
              <XStack fw="wrap">
                {carChoices.map((car, index) => (
                  <Card
                    onPress={() => {
                      setCarWidth(car.width / 100);
                      setCarHeight(car.height / 100);
                      logger.write({ message: "Select the car", ...car });
                      setIsCarSetting(true);
                    }}
                    key={index}
                  >
                    <Image
                      // eslint-disable-next-line @typescript-eslint/no-require-imports
                      source={require("@/assets/images/adaptive-icon.png")}
                      w={280}
                      h={180}
                    ></Image>
                    <Text marginHorizontal="$4" marginVertical="$2">
                      {i18n.t("Updated at")} {car.updatedAt}
                    </Text>
                    <Text
                      fontSize={20}
                      marginHorizontal="$4"
                      fontWeight="bold"
                      marginBottom="$3"
                    >
                      {car.name}
                    </Text>
                  </Card>
                ))}
              </XStack>
            </>
          ) : fieldWithoutRoad === null ? (
            <>
              <Text fontSize="$10" textAlign="center" mb="$2">
                {i18n.t("selectAField")}
              </Text>
              <XStack fw="wrap">
                {fieldChoices.map((field, index) => (
                  <FieldCard
                    key={index}
                    field={field}
                    onPress={() => {
                      logger.write({ message: "Select the field", ...field });
                      setFieldWithoutRoad(field);
                    }}
                  />
                ))}
              </XStack>
            </>
          ) : (
            <>
              <Text fontSize="$10" textAlign="center" mb="$2">
                {i18n.t("selectARoad")}
              </Text>
              <XStack fw="wrap">
                {roadChoices
                  .filter((road) => road.fieldId === fieldWithoutRoad.id)
                  .map((road, index) => (
                    <RoadCard
                      key={index}
                      field={fieldWithoutRoad}
                      road={road}
                      onPress={() => {
                        setField({
                          ...fieldWithoutRoad,
                          created_at: new Date(fieldWithoutRoad.createdAt),
                          updated_at: new Date(fieldWithoutRoad.updatedAt),
                          area: fieldWithoutRoad.coordinate,
                          roads: [{ ...road }],
                        });
                      }}
                    />
                  ))}
              </XStack>
            </>
          )}
        </View>
      )}
      <View flex={1} overflow="hidden">
        {
          <View scale={3}>
            <MapView
              style={{
                width: "100%",
                height: "100%",
              }}
              mapType={mapType}
              ref={mapRef}
              rotateEnabled={true}
              provider={PROVIDER_GOOGLE}
            >
              {car && (
                <Polygon
                  coordinates={car}
                  fillColor="rgb(0,0,200)"
                  strokeColor="rgb(0,0,100)"
                  zIndex={7}
                />
              )}
              {field && (
                <Polygon
                  coordinates={fieldToCordinates(field)}
                  fillColor="rgba(0,255,0,0.2)"
                  strokeColor="rgba(0,255,0,0.6)"
                />
              )}
              {finishedArea && (
                <Geojson
                  geojson={turf.featureCollection([finishedArea])}
                  fillColor="rgba(255,255,0,0.6)"
                  strokeColor="rgba(0,0,0,0)"
                />
              )}
              {lines.map((line, index) => {
                if (index === focused) {
                  return (
                    <Polyline
                      key={index}
                      coordinates={line}
                      strokeColor="rgb(255,0,0)"
                      zIndex={10}
                      strokeWidth={3}
                    />
                  );
                } else {
                  return (
                    <Polyline
                      key={index}
                      coordinates={line}
                      strokeColor="rgba(0,0,0,0.5)"
                      zIndex={5}
                    />
                  );
                }
              })}
              {pvt && ruler && (
                <>
                  <Circle
                    center={{
                      latitude: pvt.data.lat,
                      longitude: pvt.data.lon,
                    }}
                    radius={0.2}
                    fillColor="rgb(0,0,0)"
                    strokeWidth={0}
                    zIndex={8}
                  />
                  <Polyline
                    coordinates={[
                      {
                        latitude: ruler.destination(
                          [pvt.data.lon, pvt.data.lat],
                          carHeight / 2,
                          pvt.data.headMot,
                        )[1],
                        longitude: ruler.destination(
                          [pvt.data.lon, pvt.data.lat],
                          carHeight / 2,
                          pvt.data.headMot,
                        )[0],
                      },
                      {
                        latitude: ruler.destination(
                          [pvt.data.lon, pvt.data.lat],
                          carHeight / 2,
                          pvt.data.headMot + 180,
                        )[1],
                        longitude: ruler.destination(
                          [pvt.data.lon, pvt.data.lat],
                          carHeight / 2,
                          pvt.data.headMot + 180,
                        )[0],
                      },
                    ]}
                    strokeColor="rgb(0,0,0)"
                    zIndex={8}
                  />
                </>
              )}
            </MapView>
          </View>
        }
      </View>
      {IS_DEBUG_MODE ? (
        <XStack h={"$8"}>
          <View
            flex={1}
            bg={"#ff5555"}
            onTouchEnd={() => {
              setIsDeveloper(!isDeveloper);
            }}
          ></View>
          {isDeveloper && (
            <>
              <View
                flex={1}
                bg={"#55FF55"}
                onTouchEnd={() => {
                  setPvt((pvt) => {
                    const moving = ruler?.destination(
                      [pvt!.data.lon, pvt!.data.lat],
                      SPEED,
                      pvt!.data.headMot + 270,
                    );
                    return {
                      ...pvt!,
                      data: {
                        ...pvt!.data,
                        lat: moving![1],
                        lon: moving![0],
                      },
                    };
                  });
                }}
              >
                <Text>←</Text>
              </View>
              <View
                flex={1}
                bg={"#5555ff"}
                onTouchEnd={() => {
                  setPvt((pvt) => {
                    const moving = ruler?.destination(
                      [pvt!.data.lon, pvt!.data.lat],
                      SPEED,
                      pvt!.data.headMot,
                    );
                    return {
                      ...pvt!,
                      data: {
                        ...pvt!.data,
                        lat: moving![1],
                        lon: moving![0],
                      },
                    };
                  });
                }}
              >
                <Text>↑</Text>
              </View>
              <View
                flex={1}
                bg={"#55FF55"}
                onTouchEnd={() => {
                  setPvt((pvt) => {
                    const moving = ruler?.destination(
                      [pvt!.data.lon, pvt!.data.lat],
                      SPEED,
                      pvt!.data.headMot + 180,
                    );
                    return {
                      ...pvt!,
                      data: {
                        ...pvt!.data,
                        lat: moving![1],
                        lon: moving![0],
                      },
                    };
                  });
                }}
              >
                <Text>↓</Text>
              </View>
              <View
                flex={1}
                bg={"#5555ff"}
                onTouchEnd={() => {
                  setPvt((pvt) => {
                    const moving = ruler?.destination(
                      [pvt!.data.lon, pvt!.data.lat],
                      SPEED,
                      pvt!.data.headMot + 90,
                    );
                    return {
                      ...pvt!,
                      data: {
                        ...pvt!.data,
                        lat: moving![1],
                        lon: moving![0],
                      },
                    };
                  });
                }}
              >
                <Text>→</Text>
              </View>
              <View
                flex={1}
                bg={"#55FF55"}
                onTouchEnd={() => {
                  setPvt((pvt) => {
                    return {
                      ...pvt!,
                      data: {
                        ...pvt!.data,
                        headMot: pvt!.data.headMot + 8,
                      },
                    };
                  });
                }}
              >
                <Text>⟳</Text>
              </View>
              <View
                flex={1}
                bg={"#5555ff"}
                onTouchEnd={() => {
                  setPvt((pvt) => {
                    return {
                      ...pvt!,
                      data: {
                        ...pvt!.data,
                        headMot: pvt!.data.headMot - 8,
                      },
                    };
                  });
                }}
              >
                <Text>⟲</Text>
              </View>
            </>
          )}
        </XStack>
      ) : null}
    </YStack>
  );
}

function fieldToCordinates(field: Field) {
  const coordinates = field.area.map((point) => ({
    latitude: point.lat,
    longitude: point.lon,
  }));
  return coordinates;
}

const Card = styled(YStack, {
  w: 280,
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

function FieldCard({
  field,
  onPress,
}: {
  field: fieldSchema;
  onPress: () => void;
}) {
  return (
    <>
      <Card onPress={onPress}>
        <FieldPreview field={field} />
        <Text marginHorizontal="$4" marginVertical="$2">
          {i18n.t("Updated at")} {field.updatedAt}
        </Text>
        <Text
          fontSize={20}
          marginHorizontal="$4"
          fontWeight="bold"
          marginBottom="$3"
        >
          {field.name}
        </Text>
      </Card>
    </>
  );
}

function RoadCard({
  field,
  road,
  onPress,
}: {
  field: fieldSchema;
  road: roadSchema;
  onPress: () => void;
}) {
  return (
    <>
      <Card onPress={onPress}>
        <View overflow="hidden" flex={1}>
          <View scale={1.7}>
            <RoadPreview fieldCoord={field.coordinate} road={road} />
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
