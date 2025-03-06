/*
 *
 */
import { ChevronRight, FilePlus2, ReceiptText } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import React from "react";
import { Card, H1, Separator, Text, XStack, YStack } from "tamagui";

import i18n from "@/lib/i18n";

export default function Fertilizers() {
  return (
    <XStack padding="$2">
      <YStack gap="$2" width="100%">
        <XStack alignItems="center" gap="$2">
          <ReceiptText size="$3" />
          <H1
            fontSize="$9"
            color="$primary"
            letterSpacing="$1"
            fontWeight="400"
          >
            {i18n.t("FertilizerSettings")}
          </H1>
        </XStack>
        <Card
          bordered
          padding="$4"
          width="100%"
          pressStyle={{ scale: 0.97 }}
          onPress={() => {
            router.push(`/(tabs)/diaries/fertilizers/add`); //should
          }}
        >
          <XStack alignItems="center" justifyContent="space-between">
            <XStack alignItems="center" gap="$2">
              <FilePlus2 size="$3" />
              <YStack>
                <Text fontWeight="bold" fontSize="$7">
                  {i18n.t("AddFertilizer")}
                </Text>
                {/* <Text color="$colorSubtitle">{i18n.t("")}</Text> */}
              </YStack>
            </XStack>
            <ChevronRight size="$2" color="$color" />
          </XStack>
        </Card>
        <Separator alignSelf="stretch" borderColor={"$color"} />
        {/* MUST:ここに肥料一覧 */}
      </YStack>
    </XStack>
  );
}
