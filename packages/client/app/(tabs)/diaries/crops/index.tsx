import { Carrot, ChevronRight, FilePlus2 } from "@tamagui/lucide-icons";
import { cropSchema } from "backend/src/schema/crop";
import { Link, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Card, H1, Separator, Text, XStack, YStack } from "tamagui";
import { z } from "zod";

import { client } from "@/lib/honoClient";
import i18n from "@/lib/i18n";

export default function Crops() {
  const [crops, setCrops] = useState<z.infer<typeof cropSchema>[]>([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await (await client()).api.diaries.crops.$get();
        if (!res.ok) return;
        const json = await res.json();
        if (!json) return;
        setCrops(json);
      } catch (error) {
        console.error(error);
      }
    };
    fetch();
    setRefresh(false);
  }, [refresh]);

  return (
    <XStack padding="$2">
      <YStack gap="$2" width="100%">
        <XStack alignItems="center" gap="$2">
          <Carrot size="$3" />
          <H1
            fontSize="$9"
            color="$primary"
            letterSpacing="$1"
            fontWeight="400"
          >
            {i18n.t("cropSettings")}
          </H1>
        </XStack>
        <Card
          bordered
          padding="$4"
          width="100%"
          pressStyle={{ scale: 0.97 }}
          onPress={() => {
            router.push(`/(tabs)/diaries/crops/add`); //should
          }}
        >
          <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center" gap="$2">
              <FilePlus2 size="$3" />
              <YStack>
                <Text fontWeight="bold" fontSize="$7">
                  {i18n.t("AddCrop")}
                </Text>
                {/* <Text color="$colorSubtitle">{i18n.t("")}</Text> */}
              </YStack>
            </XStack>
            <ChevronRight size="$2" color="$color" />
          </XStack>
        </Card>
        <Separator alignSelf="stretch" borderColor={"$color"} />
        {/* MUST:ここに作目一覧 */}
        {crops.map((crop) => (
          <Link
            key={crop.id}
            href={{
              pathname: "/(tabs)/diaries",
              params: { view: "overview" },
            }}
            asChild
          >
            <Card
              bordered
              padding="$5"
              width="100%"
              pressStyle={{ scale: 0.97 }}
              onPress={() => {
                setRefresh(true);
              }}
            >
              <XStack alignItems="center" justifyContent="space-between">
                <XStack alignItems="center">
                  <Text fontSize="$7" fontWeight="bold">
                    {crop.name}
                  </Text>
                </XStack>
              </XStack>
            </Card>
          </Link>
        ))}
      </YStack>
    </XStack>
  );
}
