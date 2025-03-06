/*
    diaryPack
    View a diary pack list
    * name
    * createdAt
    
    -> settings
    * Delete
    * Edit
*/
import {
  ChevronLeft,
  ChevronRight,
  FilePlus2,
  SprayCan,
} from "@tamagui/lucide-icons";
import { diaryPackSchema } from "backend/src/schema/diaryPack";
import { Link, router } from "expo-router";
import React, { useEffect } from "react";
import { Card, H1, ScrollView, Separator, Text, XStack, YStack } from "tamagui";
import { z } from "zod";

import { client } from "@/lib/honoClient";
import i18n from "@/lib/i18n";

export default function diaryPack() {
  const [diaryPacks, setDiaryPacks] = React.useState<
    z.infer<typeof diaryPackSchema>[]
  >([]);
  const [refresh, setRefresh] = React.useState(true);
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await (await client()).api.diaryPacks.$get();
        if (!res.ok) return;
        const json = await res.json();
        setDiaryPacks(json);
      } catch (error) {
        console.error(error);
      }
    };
    fetch();
    setRefresh(false);
  }, [refresh]);
  return (
    <ScrollView>
      <XStack padding="$2">
        <YStack gap="$2" width="100%">
          <XStack alignItems="center" gap="$2">
            <SprayCan size="$3" />
            <H1
              fontSize="$9"
              color="$primary"
              letterSpacing="$1"
              fontWeight="400"
            >
              {i18n.t("diaryPackSetting")}
            </H1>
          </XStack>
          <Card
            bordered
            padding="$4"
            width="100%"
            pressStyle={{ scale: 0.97 }}
            onPress={() => {
              router.push(`/(tabs)/diaries/diaryPack/add`); //should
            }}
          >
            <XStack alignItems="center" justifyContent="space-between">
              <XStack alignItems="center" gap="$2">
                <FilePlus2 size="$3" />
                <YStack>
                  <Text fontWeight="bold" fontSize="$7">
                    {i18n.t("AddDiaryPack")}
                  </Text>
                  {/* <Text color="$colorSubtitle">{i18n.t("")}</Text> */}
                </YStack>
              </XStack>
              <ChevronRight size="$2" color="$color" />
            </XStack>
          </Card>
          <Separator alignSelf="stretch" borderColor={"$color"} />
          {diaryPacks.map((pack) => (
            <Link
              key={pack?.id}
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
                      {pack?.name}
                    </Text>
                  </XStack>
                </XStack>
              </Card>
            </Link>
          ))}
          {/* 戻る */}
          <YStack alignItems="center">
            <Link href="/diaries" asChild>
              <Card
                bordered
                alignItems="center"
                padding="$4"
                width="30%"
                pressStyle={{ scale: 0.97 }}
              >
                <XStack alignItems="center">
                  <ChevronLeft size="$2" color="$color" />
                  <YStack>
                    <Text fontWeight="bold" fontSize="$5">
                      {i18n.t("return")}
                    </Text>
                  </YStack>
                </XStack>
              </Card>
            </Link>
          </YStack>
        </YStack>
      </XStack>
    </ScrollView>
  );
}
