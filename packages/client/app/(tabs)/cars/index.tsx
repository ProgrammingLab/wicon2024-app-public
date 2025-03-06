import { carSchema } from "backend/src/schema/car";
import { router } from "expo-router";
import React, { Fragment, useEffect } from "react";
import { RefreshControl } from "react-native";
import {
  Circle,
  Image,
  ScrollView,
  styled,
  Text,
  View,
  XStack,
  YStack,
} from "tamagui";
import { z } from "zod";

import adapterIcon from "@/assets/images/adaptive-icon.png";
import { client } from "@/lib/honoClient";
import i18n from "@/lib/i18n";

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

export default function Cars() {
  const [cars, setCars] = React.useState<z.infer<typeof carSchema>[]>([]);
  const [needRefresh, setNeedRefresh] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    (async () => {
      setRefreshing(true);
      const carsRes = await (await client()).api.cars.$get();
      if (!carsRes.ok) return;
      const carsJson = await carsRes.json();
      if (!carsJson) return;
      setCars(carsJson);

      setRefreshing(false);
    })();
  }, [needRefresh]);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => setNeedRefresh(true)}
        />
      }
    >
      <XStack flexWrap="wrap">
        <Card
          jc="center"
          ai="center"
          onPress={() => {
            router.push("/cars/add");
          }}
        >
          <Circle
            size={80}
            bg="$accentBackground"
            elevation={1}
            pressStyle={{ scale: 0.95 }}
            animation="quicker"
          >
            <Text fontSize={50}>+</Text>
          </Circle>
          <Text fontSize="$8" marginTop="$2" fontWeight="bold">
            {i18n.t("Add a car")}
          </Text>
        </Card>
        {cars.map((car, index) => (
          <Fragment key={index}>
            <Card
              onPress={() => {
                router.push({
                  pathname: "/(tabs)/cars/[id]",
                  params: { id: car.id },
                });
              }}
            >
              <View flex={1} jc={"center"} ai={"center"}>
                <Image source={adapterIcon} w={280} h={180}></Image>
              </View>
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
          </Fragment>
        ))}
      </XStack>
    </ScrollView>
  );
}
